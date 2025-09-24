"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthContext } from "@/contexts/auth-context";
import { apiRequest, isSuccess } from "@/lib/api-client";
import { resolveErrorMessage } from "@/lib/error-utils";
import { formatDateTime, formatDisplayDate, formatTimeLabel } from "@/lib/date-format";
import type {
  AvailabilityDay,
  BookingStep,
  BookingSummary,
  MessageDescriptor,
  SalonArtist,
  SalonLocation,
} from "@/lib/types";
import { bookingSteps } from "@/lib/types";

const BookingPage = () => {
  const router = useRouter();
  const { token, user, logout, hydrated } = useAuthContext();

  const [step, setStep] = useState<BookingStep>("location");
  const [message, setMessage] = useState<MessageDescriptor | null>(null);

  const [locations, setLocations] = useState<SalonLocation[]>([]);
  const [artists, setArtists] = useState<SalonArtist[]>([]);
  const [availabilityDays, setAvailabilityDays] = useState<AvailabilityDay[]>([]);

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [lastBooking, setLastBooking] = useState<BookingSummary | null>(null);
  const [history, setHistory] = useState<BookingSummary[]>([]);

  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingArtists, setIsLoadingArtists] = useState(false);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "submitting">("idle");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const resetState = useCallback(() => {
    setStep("location");
    setLocations([]);
    setArtists([]);
    setAvailabilityDays([]);
    setSelectedLocationId(null);
    setSelectedArtistId(null);
    setSelectedDay(null);
    setSelectedTime(null);
    setLastBooking(null);
    setMessage(null);
  }, []);

  const loadLocations = useCallback(async () => {
    setIsLoadingLocations(true);
    const response = await apiRequest<{ locations: SalonLocation[] }>("/booking/locations", { method: "GET" });

    if (isSuccess(response)) {
      const list = response.locations ?? [];
      setLocations(list);

      if (list.length === 1) {
        const onlyLocation = list[0];
        setSelectedLocationId(onlyLocation.id);
        setArtists([]);
        setAvailabilityDays([]);
        setStep("artist");
        setMessage({ tone: "info", text: "Автоматаар сонгосон салонд зориулсан артистаа сонгоно уу." });
      } else if (list.length > 1) {
        setMessage({ tone: "info", text: "Салонуудаас нэгийг сонгоод эхлээрэй." });
      }
    } else {
      setMessage({ tone: "error", text: resolveErrorMessage(response, "Салонуудыг татахад алдаа гарлаа.") });
    }

    setIsLoadingLocations(false);
  }, []);

  const loadArtists = useCallback(async (locationId: string) => {
    if (!locationId) {
      return;
    }

    setIsLoadingArtists(true);
    const response = await apiRequest<{ artists: SalonArtist[] }>(
      `/booking/artists?locationId=${encodeURIComponent(locationId)}`,
      { method: "GET" },
    );

    if (isSuccess(response)) {
      const list = response.artists ?? [];
      setArtists(list);

      if (list.length === 0) {
        setMessage({ tone: "info", text: "Энэ салонд одоогоор артист бүртгэлгүй байна." });
      }
    } else {
      setMessage({ tone: "error", text: resolveErrorMessage(response, "Артистуудын мэдээлэл ачаалахад алдаа гарлаа.") });
    }

    setIsLoadingArtists(false);
  }, []);

  const loadAvailability = useCallback(
    async (locationId: string, artistId: string) => {
      if (!locationId || !artistId) {
        return;
      }

      setIsLoadingAvailability(true);
      const response = await apiRequest<{ days: AvailabilityDay[] }>(
        `/booking/availability?locationId=${encodeURIComponent(locationId)}&artistId=${encodeURIComponent(artistId)}&days=7`,
        { method: "GET" },
      );

      if (isSuccess(response)) {
        const days = (response.days ?? []).map((day) => ({
          ...day,
          slots: (day.slots || []).map((slot) => ({ ...slot })).sort((a, b) => a.time.localeCompare(b.time)),
        }));

        setAvailabilityDays(days);
        const firstAvailable = days.find((day) => day.slots.some((slot) => slot.available));
        setSelectedDay(firstAvailable?.date ?? null);
        setSelectedTime(null);

        if (!firstAvailable) {
          setMessage({ tone: "info", text: "Энэ артистын сул цаг түр дууссан байна." });
        } else {
          setMessage({ tone: "info", text: "Цагаа сонгоод захиалгаа баталгаажуулаарай." });
        }
      } else {
        setMessage({ tone: "error", text: resolveErrorMessage(response, "Сул цаг татахад алдаа гарлаа.") });
      }

      setIsLoadingAvailability(false);
    },
    [],
  );

  const loadHistory = useCallback(async () => {
    if (!token) {
      setHistory([]);
      return;
    }

    setIsLoadingHistory(true);
    const response = await apiRequest<{ bookings: BookingSummary[] }>("/booking/history", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (isSuccess(response)) {
      setHistory(response.bookings ?? []);
    } else {
      setMessage((current) => current ?? {
        tone: "error",
        text: resolveErrorMessage(response, "Захиалгын түүх ачаалахад алдаа гарлаа."),
      });
    }

    setIsLoadingHistory(false);
  }, [token]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!token) {
      router.replace("/auth");
      return;
    }

    resetState();
    void loadLocations();
    void loadHistory();
  }, [hydrated, token, router, loadLocations, loadHistory, resetState]);

  useEffect(() => {
    if (selectedLocationId) {
      void loadArtists(selectedLocationId);
    }
  }, [loadArtists, selectedLocationId]);

  useEffect(() => {
    if (selectedLocationId && selectedArtistId) {
      void loadAvailability(selectedLocationId, selectedArtistId);
    }
  }, [loadAvailability, selectedArtistId, selectedLocationId]);

  const canAccessStep = useCallback(
    (target: BookingStep) => {
      if (target === "location") {
        return true;
      }
      if (target === "artist") {
        return Boolean(selectedLocationId);
      }
      if (target === "time") {
        return Boolean(selectedLocationId && selectedArtistId);
      }
      if (target === "summary") {
        return Boolean(lastBooking);
      }
      return false;
    },
    [lastBooking, selectedArtistId, selectedLocationId],
  );

  const goToStep = (target: BookingStep) => {
    if (!canAccessStep(target)) {
      return;
    }
    setStep(target);
  };

  const handleSelectLocation = (locationId: string) => {
    if (selectedLocationId === locationId) {
      setStep("artist");
      return;
    }

    setSelectedLocationId(locationId);
    setSelectedArtistId(null);
    setArtists([]);
    setAvailabilityDays([]);
    setSelectedDay(null);
    setSelectedTime(null);
    setStep("artist");
    setMessage({ tone: "info", text: "Артистаа сонгоод үргэлжлүүлээрэй." });
  };

  const handleSelectArtist = (artistId: string) => {
    if (!selectedLocationId) {
      setMessage({ tone: "error", text: "Эхлээд салон сонгоно уу." });
      return;
    }

    setSelectedArtistId(artistId);
    setAvailabilityDays([]);
    setSelectedDay(null);
    setSelectedTime(null);
    setStep("time");
    setMessage({ tone: "info", text: "Сул цагийг ачаалж байна." });
  };

  const handleSelectSlot = (day: string, time: string) => {
    setSelectedDay(day);
    setSelectedTime(time);
  };

  const submitBooking = async () => {
    if (!token) {
      setMessage({ tone: "error", text: "Эхлээд нэвтэрч орно уу." });
      router.push("/auth");
      return;
    }

    if (!selectedLocationId || !selectedArtistId || !selectedDay || !selectedTime) {
      setMessage({ tone: "error", text: "Сонголтоо бүрэн хийгээд дахин оролдоно уу." });
      return;
    }

    setBookingStatus("submitting");

    const response = await apiRequest<{ booking: BookingSummary }>("/booking", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        locationId: selectedLocationId,
        artistId: selectedArtistId,
        date: selectedDay,
        time: selectedTime,
      }),
    });

    if (isSuccess(response)) {
      setLastBooking(response.booking);
      setMessage({ tone: "success", text: "Захиалга баталгаажлаа." });
      setStep("summary");
      void loadAvailability(selectedLocationId, selectedArtistId);
      void loadHistory();
    } else {
      setMessage({ tone: "error", text: resolveErrorMessage(response, "Захиалга баталгаажуулахад алдаа гарлаа.") });
    }

    setBookingStatus("idle");
  };

  const startOver = () => {
    resetState();
    void loadLocations();
  };

  const activeStepIndex = useMemo(
    () => bookingSteps.findIndex((entry) => entry.key === step),
    [step],
  );
  const activeDay = selectedDay ? availabilityDays.find((day) => day.date === selectedDay) : null;
  const displayedSlots = activeDay ? activeDay.slots : [];
  const lastLoginAt = formatDateTime(user?.lastLoginAt) ?? null;
  const lastVerifiedAt = formatDateTime(user?.lastVerifiedAt) ?? null;
  const recentBookings = history.slice(0, 5);
  const nextBooking = history.length > 0 ? history[0] : null;

  return (
    <main className="min-h-screen bg-black text-neutral-100">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-12">
        <header className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-[0.38em] text-neutral-600">Yuki Studio</span>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-50">Цаг захиалах</h1>
        </header>

        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Хэрэглэгч</span>
              <p className="text-lg font-semibold text-neutral-100">{user?.phone ?? "Тохируулаагүй"}</p>
              {nextBooking && (
                <p className="text-xs text-neutral-400">
                  Сүүлд захиалсан: {nextBooking.location.name} • {formatDisplayDate(nextBooking.date)} • {formatTimeLabel(nextBooking.time)}
                </p>
              )}
            </div>
            <div className="flex flex-col items-start gap-2 text-xs sm:items-end">
              <button
                className="rounded-full border border-white/10 px-4 py-2 text-neutral-200 transition hover:border-white/30 hover:bg-white/10"
                onClick={startOver}
              >
                Шинэ захиалга
              </button>
              <button
                className="rounded-full border border-white/10 px-4 py-2 text-neutral-200 transition hover:border-white/30 hover:bg-white/10"
                onClick={() => {
                  logout();
                  router.push("/auth");
                }}
              >
                Гарах
              </button>
            </div>
          </div>
        </section>

        <nav className="flex items-center justify-between w-full">
          {bookingSteps.map((entry, index) => {
            const isActive = entry.key === step;
            const isSummary = step === "summary";
            const isDone = isSummary || index < activeStepIndex;
            const canReach = canAccessStep(entry.key);

            return (
                <div key={entry.key} className="flex items-center flex-1">
                  {/* Circle + Label */}
                  <div className="flex flex-col items-center">
                    <button
                        onClick={() => goToStep(entry.key)}
                        disabled={!canReach}
                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-medium transition-all duration-300 ${
                            isActive && !isSummary
                                ? "bg-neutral-900 text-white border-white shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                                : isDone
                                    ? "bg-white text-black border-white"
                                    : "border-neutral-700 text-neutral-500 bg-transparent"
                        }`}
                    >
                      {isDone ? (
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-black"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                      ) : (
                          index + 1
                      )}
                    </button>
                    <span
                        className={`mt-2 text-[11px] tracking-[0.2em] ${
                            isActive ? "text-white" : isDone ? "text-neutral-400" : "text-neutral-600"
                        }`}
                    >
            {entry.label}
          </span>
                  </div>

                  {index !== bookingSteps.length - 1 && (
                      <div
                          className={`flex-1 h-[1px] mx-2 relative -top-2.5 ${
                              isDone ? "bg-neutral-400" : "bg-neutral-700"
                          }`}
                      />
                  )}

                </div>
            );
          })}
        </nav>


        {message && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              message.tone === "success"
                ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100"
                : message.tone === "error"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                : "border-sky-400/40 bg-sky-500/10 text-sky-100"
            }`}
          >
            {message.text}
          </div>
        )}

        {step === "location" && (
          <section className="grid gap-4">
            {isLoadingLocations ? (
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map((value) => (
                  <div key={value} className="h-16 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                ))}
              </div>
            ) : locations.length ? (
              locations.map((location) => {
                const selected = selectedLocationId === location.id;
                return (
                  <button
                    key={location.id}
                    className={`flex w-full flex-col gap-2 rounded-2xl border px-5 py-4 text-left transition ${
                      selected ? "border-white bg-white/10" : "border-white/10 hover:border-white/30"
                    }`}
                    onClick={() => handleSelectLocation(location.id)}
                  >
                    <span className="text-sm font-semibold text-neutral-100">{location.name}</span>
                    {location.address && <span className="text-xs text-neutral-500">{location.address}</span>}
                    {selected && <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-300">Сонгосон</span>}
                  </button>
                );
              })
            ) : (
              <p className="rounded-2xl border border-white/10 px-5 py-4 text-sm text-neutral-400">
                Салон бүртгэлгүй байна.
              </p>
            )}
          </section>
        )}

        {step === "artist" && (
          <section className="grid gap-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 px-4 py-3 text-xs text-neutral-400">
              <span>Сонгосон салон: <span className="text-neutral-100">{locations.find((item) => item.id === selectedLocationId)?.name ?? "-"}</span></span>
              <button
                className="underline underline-offset-4 transition hover:text-neutral-100"
                onClick={() => goToStep("location")}
              >
                Өөрчлөх
              </button>
            </div>

            {isLoadingArtists ? (
              <div className="flex flex-col gap-3">
                {[0, 1, 2].map((value) => (
                  <div key={value} className="h-16 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                ))}
              </div>
            ) : artists.length ? (
              artists.map((artist) => {
                const selected = selectedArtistId === artist.id;
                return (
                  <button
                    key={artist.id}
                    className={`flex w-full flex-col gap-2 rounded-2xl border px-5 py-4 text-left transition ${
                      selected ? "border-white bg-white/10" : "border-white/10 hover:border-white/30"
                    }`}
                    onClick={() => handleSelectArtist(artist.id)}
                  >
                    <span className="text-sm font-semibold text-neutral-100">{artist.name}</span>
                    {artist.bio && <span className="text-xs text-neutral-500 line-clamp-2">{artist.bio}</span>}
                    {selected && <span className="text-[10px] uppercase tracking-[0.35em] text-neutral-300">Сонгосон</span>}
                  </button>
                );
              })
            ) : (
              <p className="rounded-2xl border border-white/10 px-5 py-4 text-sm text-neutral-400">
                Артист бүртгэлгүй байна.
              </p>
            )}
          </section>
        )}

        {step === "time" && (
          <section className="grid gap-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
              <span>
                {locations.find((item) => item.id === selectedLocationId)?.name ?? "-"} · {artists.find((item) => item.id === selectedArtistId)?.name ?? "-"}
              </span>
              <div className="flex gap-3">
                <button className="underline underline-offset-4" onClick={() => goToStep("location")}>Салон</button>
                <button className="underline underline-offset-4" onClick={() => goToStep("artist")}>Артист</button>
              </div>
            </div>

            {isLoadingAvailability ? (
              <div className="flex flex-col gap-3">
                {[0, 1].map((value) => (
                  <div key={value} className="h-14 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {availabilityDays.map((day) => {
                    const hasSlots = day.slots.some((slot) => slot.available);
                    const active = selectedDay === day.date;

                    const formatDisplayDate = (dateString: string) => {
                      const date = new Date(dateString);
                      const month = date.getMonth() + 1;
                      const dayNum = date.getDate();
                      const weekday = date.toLocaleDateString("mn-MN", { weekday: "short" });
                      return { label: `${month}/${dayNum}`, weekday };
                    };

                    const { label, weekday } = formatDisplayDate(day.date);

                    return (
                        <button
                            key={day.date}
                            className={`flex flex-col items-center rounded-xl px-4 py-2 text-sm font-medium transition ${
                                active
                                    ? "bg-white text-black shadow-md"
                                    : hasSlots
                                        ? "border border-white/30 text-neutral-200 hover:bg-white/10"
                                        : "border border-white/10 text-neutral-500"
                            }`}
                            onClick={() => setSelectedDay(day.date)}
                            disabled={!hasSlots}
                        >
                          <span>{label}</span>
                          <span className="text-[10px] opacity-70">{weekday}</span>
                        </button>
                    );
                  })}
                </div>


                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {displayedSlots.length ? (
                    displayedSlots.map((slot) => {
                      const active = selectedDay === activeDay?.date && selectedTime === slot.time;
                      return (
                        <button
                          key={`${activeDay?.date ?? selectedDay}-${slot.time}`}
                          className={`rounded-2xl border px-4 py-3 text-sm transition ${
                            slot.available
                              ? active
                                ? "border-white bg-white text-black"
                                : "border-white/20 text-neutral-200 hover:border-white/40"
                              : "border-white/5 text-neutral-500 line-through"
                          }`}
                          onClick={() => slot.available && activeDay && handleSelectSlot(activeDay.date, slot.time)}
                          disabled={!slot.available}
                        >
                          {formatTimeLabel(slot.time)}
                        </button>
                      );
                    })
                  ) : (
                    <p className="col-span-full rounded-2xl border border-white/10 px-4 py-4 text-center text-xs text-neutral-400">
                      Сул цаг алга байна.
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
              <button
                className="rounded-full bg-white px-4 py-2 text-neutral-900 transition hover:bg-neutral-200 disabled:bg-white/40 disabled:text-neutral-500"
                onClick={submitBooking}
                disabled={!selectedTime || bookingStatus === "submitting"}
              >
                {bookingStatus === "submitting" ? "Илгээж байна" : "Захиалга баталгаажуулах"}
              </button>
              {selectedDay && selectedTime && (
                <span>
                  Сонгосон: {formatDisplayDate(selectedDay)} • {formatTimeLabel(selectedTime)}
                </span>
              )}
            </div>
          </section>
        )}

        {step === "summary" && (
          <section className="grid gap-4">
            {lastBooking ? (
              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-5 text-sm text-neutral-100">
                <p className="text-lg font-semibold text-neutral-50">Захиалга баталгаажлаа</p>
                <div className="mt-3 grid gap-1 text-xs text-neutral-200">
                  <span>Салон: {lastBooking.location.name}</span>
                  <span>Артист: {lastBooking.artist.name}</span>
                  <span>
                    Цаг: {formatDisplayDate(lastBooking.date)} • {formatTimeLabel(lastBooking.time)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="rounded-2xl border border-white/10 px-5 py-4 text-sm text-neutral-400">Захиалгын мэдээлэл алга.</p>
            )}

            <div className="flex flex-wrap gap-3 text-xs text-neutral-400">
              <button
                className="rounded-full bg-white px-4 py-2 text-neutral-900 transition hover:bg-neutral-200"
                onClick={startOver}
              >
                Шинэ захиалга эхлүүлэх
              </button>
              <button
                className="rounded-full border border-white/10 px-4 py-2 transition hover:border-white/30 hover:bg-white/10"
                onClick={() => {
                  setStep(selectedArtistId ? "time" : "artist");
                }}
                disabled={!selectedArtistId}
              >
                Буцах
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default BookingPage;
