"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthContext } from "@/contexts/auth-context";
import { apiRequest, isSuccess } from "@/lib/api-client";
import { resolveErrorMessage } from "@/lib/error-utils";
import { mapAdminArtist, mapAdminLocation, mapAdminStat } from "@/lib/admin-mappers";
import type {
  AdminArtist,
  AdminArtistForm,
  AdminArtistStat,
  AdminLocation,
  AdminLocationForm,
  AdminTab,
  MessageDescriptor,
} from "@/lib/types";

const defaultLocationForm: AdminLocationForm = {
  id: null,
  name: "",
  city: "",
  district: "",
  address: "",
  phone: "",
  workingHours: "",
  description: "",
  active: true,
};

const defaultArtistForm: AdminArtistForm = {
  id: null,
  name: "",
  bio: "",
  specialtiesText: "",
  avatarUrl: "",
  locationIds: [],
  active: true,
};

const TABS: AdminTab[] = ["locations", "artists", "analytics"];

const tabLabels: Record<AdminTab, string> = {
  locations: "Салонууд",
  artists: "Артистууд",
  analytics: "Гүйцэтгэл",
};

const AdminPage = () => {
  const router = useRouter();
  const { adminToken, adminProfile, clearAdmin, logout, hydrated } = useAuthContext();

  const [message, setMessage] = useState<MessageDescriptor | null>(null);
  const [adminTab, setAdminTab] = useState<AdminTab>("locations");
  const [adminLocations, setAdminLocations] = useState<AdminLocation[]>([]);
  const [adminArtists, setAdminArtists] = useState<AdminArtist[]>([]);
  const [adminStats, setAdminStats] = useState<AdminArtistStat[]>([]);
  const [locationForm, setLocationForm] = useState<AdminLocationForm>(defaultLocationForm);
  const [locationFormMode, setLocationFormMode] = useState<"create" | "edit">("create");
  const [artistForm, setArtistForm] = useState<AdminArtistForm>(defaultArtistForm);
  const [artistFormMode, setArtistFormMode] = useState<"create" | "edit">("create");
  const [adminLoading, setAdminLoading] = useState(false);

  const resolveError = useCallback((payload: Parameters<typeof resolveErrorMessage>[0], fallback: string) => {
    return resolveErrorMessage(payload, fallback);
  }, []);

  const authHeaders = useMemo(() => {
    if (!adminToken) {
      return undefined;
    }
    return { Authorization: `Bearer ${adminToken}` };
  }, [adminToken]);

  const fetchAdminData = useCallback(
    async (tokenOverride?: string) => {
      const tokenValue = tokenOverride ?? adminToken;
      if (!tokenValue) {
        return;
      }

      setAdminLoading(true);
      const headers = { Authorization: `Bearer ${tokenValue}` };

      const [locationsRes, artistsRes, statsRes] = await Promise.all([
        apiRequest<{ locations: AdminLocation[] }>("/admin/locations", { method: "GET", headers }),
        apiRequest<{ artists: AdminArtist[] }>("/admin/artists", { method: "GET", headers }),
        apiRequest<{ stats: AdminArtistStat[] }>("/admin/analytics/artists", { method: "GET", headers }),
      ]);

      if (isSuccess(locationsRes)) {
        setAdminLocations((locationsRes.locations ?? []).map(mapAdminLocation));
      } else {
        setMessage({ tone: "error", text: resolveError(locationsRes, "Салонуудын мэдээлэл авахад алдаа гарлаа.") });
      }

      if (isSuccess(artistsRes)) {
        setAdminArtists((artistsRes.artists ?? []).map(mapAdminArtist));
      } else {
        setMessage({ tone: "error", text: resolveError(artistsRes, "Артистын мэдээлэл авахад алдаа гарлаа.") });
      }

      if (isSuccess(statsRes)) {
        setAdminStats((statsRes.stats ?? []).map(mapAdminStat));
      } else {
        setMessage({ tone: "error", text: resolveError(statsRes, "Статистик ачаалахад алдаа гарлаа.") });
      }

      setAdminLoading(false);
    },
    [adminToken, resolveError],
  );

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!adminToken) {
      router.replace("/auth");
      return;
    }

    void fetchAdminData(adminToken);
  }, [adminToken, fetchAdminData, hydrated, router]);

  const resetLocationForm = () => {
    setLocationForm(defaultLocationForm);
    setLocationFormMode("create");
  };

  const resetArtistForm = () => {
    setArtistForm(defaultArtistForm);
    setArtistFormMode("create");
  };

  const handleLocationSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!authHeaders) {
      setMessage({ tone: "error", text: "Админ эрх шаардлагатай." });
      return;
    }

    const payload = {
      name: locationForm.name,
      city: locationForm.city || undefined,
      district: locationForm.district || undefined,
      address: locationForm.address || undefined,
      phone: locationForm.phone || undefined,
      workingHours: locationForm.workingHours || undefined,
      description: locationForm.description || undefined,
      active: locationForm.active,
    };

    const response = locationFormMode === "create"
      ? await apiRequest<{ location: AdminLocation }>("/admin/locations", {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await apiRequest<{ location: AdminLocation }>(`/admin/locations/${locationForm.id}`, {
          method: "PUT",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (isSuccess(response)) {
      setMessage({ tone: "success", text: locationFormMode === "create" ? "Салон нэмэгдлээ." : "Салон шинэчлэгдлээ." });
      resetLocationForm();
      fetchAdminData();
    } else {
      setMessage({ tone: "error", text: resolveError(response, "Салон хадгалахад алдаа гарлаа.") });
    }
  };

  const handleEditLocation = (location: AdminLocation) => {
    setLocationForm({
      id: location.id,
      name: location.name ?? "",
      city: location.city ?? "",
      district: location.district ?? "",
      address: location.address ?? "",
      phone: location.phone ?? "",
      workingHours: location.workingHours ?? "",
      description: location.description ?? "",
      active: location.active ?? true,
    });
    setLocationFormMode("edit");
    setAdminTab("locations");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!authHeaders) {
      setMessage({ tone: "error", text: "Админ эрх шаардлагатай." });
      return;
    }

    const response = await apiRequest<Record<string, never>>(`/admin/locations/${locationId}`, {
      method: "DELETE",
      headers: authHeaders,
    });

    if (isSuccess(response)) {
      setMessage({ tone: "success", text: "Салон устгагдлаа." });
      fetchAdminData();
    } else {
      setMessage({ tone: "error", text: resolveError(response, "Салон устгахад алдаа гарлаа.") });
    }
  };

  const handleArtistSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!authHeaders) {
      setMessage({ tone: "error", text: "Админ эрх шаардлагатай." });
      return;
    }

    const payload = {
      name: artistForm.name,
      bio: artistForm.bio || undefined,
      specialties: artistForm.specialtiesText
        ? artistForm.specialtiesText.split(",").map((item) => item.trim()).filter(Boolean)
        : [],
      avatarUrl: artistForm.avatarUrl || undefined,
      locationIds: artistForm.locationIds,
      active: artistForm.active,
    };

    const response = artistFormMode === "create"
      ? await apiRequest<{ artist: AdminArtist }>("/admin/artists", {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await apiRequest<{ artist: AdminArtist }>(`/admin/artists/${artistForm.id}`, {
          method: "PUT",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (isSuccess(response)) {
      setMessage({ tone: "success", text: artistFormMode === "create" ? "Артист нэмэгдлээ." : "Артист шинэчлэгдлээ." });
      resetArtistForm();
      fetchAdminData();
    } else {
      setMessage({ tone: "error", text: resolveError(response, "Артист хадгалахад алдаа гарлаа.") });
    }
  };

  const handleEditArtist = (artist: AdminArtist) => {
    setArtistForm({
      id: artist.id,
      name: artist.name ?? "",
      bio: artist.bio ?? "",
      specialtiesText: artist.specialties.join(", "),
      avatarUrl: artist.avatarUrl ?? "",
      locationIds: artist.locations.map((location) => location.id),
      active: artist.active,
    });
    setArtistFormMode("edit");
    setAdminTab("artists");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteArtist = async (artistId: string) => {
    if (!authHeaders) {
      setMessage({ tone: "error", text: "Админ эрх шаардлагатай." });
      return;
    }

    const response = await apiRequest<Record<string, never>>(`/admin/artists/${artistId}`, {
      method: "DELETE",
      headers: authHeaders,
    });

    if (isSuccess(response)) {
      setMessage({ tone: "success", text: "Артист устгагдлаа." });
      fetchAdminData();
    } else {
      setMessage({ tone: "error", text: resolveError(response, "Артист устгахад алдаа гарлаа.") });
    }
  };

  const handleArtistLocationToggle = (locationId: string) => {
    setArtistForm((current) => {
      const exists = current.locationIds.includes(locationId);
      return {
        ...current,
        locationIds: exists
          ? current.locationIds.filter((id) => id !== locationId)
          : [...current.locationIds, locationId],
      };
    });
  };

  const handleAdminLogout = () => {
    clearAdmin();
    setMessage({ tone: "info", text: "Админ горимоос гарлаа." });
    router.push("/auth");
  };

  const handleFullLogout = () => {
    logout();
    router.push("/auth");
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12 sm:py-16">
        <header className="flex flex-col gap-2 text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500">Yuki Admin</p>
          <h1 className="text-3xl font-semibold tracking-tight">Салон удирдлагын самбар</h1>
          <p className="text-sm text-neutral-400">Салон, артист, цагийн слот болон гүйцэтгэлийн статистикийг нэг дороос удирдаарай.</p>
        </header>

        {message && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur transition ${
              message.tone === "success"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : message.tone === "error"
                ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                : "border-sky-500/30 bg-sky-500/10 text-sky-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1 text-sm text-neutral-200">
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Админ хэрэглэгч</span>
              <span className="text-lg font-semibold text-neutral-100">{adminProfile?.name ?? "Тодорхойгүй"}</span>
              <span className="text-xs text-neutral-400">{adminProfile?.phone ?? "Утасны мэдээлэл алга"}</span>
            </div>
            <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-3">
              <button
                className="rounded-2xl border border-white/10 px-4 py-2 text-neutral-200 transition hover:border-white/30 hover:bg-white/10"
                onClick={() => router.push("/booking")}
              >
                Хэрэглэгчийн урсгал руу очих
              </button>
              <button
                className="rounded-2xl border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sky-100 transition hover:border-sky-300 hover:bg-sky-500/20"
                onClick={handleAdminLogout}
              >
                Админ гарах
              </button>
              <button
                className="rounded-2xl border border-white/10 px-4 py-2 text-neutral-200 transition hover:border-white/30 hover:bg-white/10"
                onClick={handleFullLogout}
              >
                Бүх сессийг дуусгах
              </button>
            </div>
          </div>
        </section>

        <nav className="flex gap-3">
          {TABS.map((tab) => {
            const active = adminTab === tab;
            return (
              <button
                key={tab}
                className={`rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  active ? "bg-white text-neutral-900" : "border border-white/10 text-neutral-300 hover:border-white/30"
                }`}
                onClick={() => setAdminTab(tab)}
                disabled={adminLoading}
              >
                {tabLabels[tab]}
              </button>
            );
          })}
        </nav>

        {adminTab === "locations" && (
          <section className="grid gap-6 md:grid-cols-2">
            <form className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6" onSubmit={handleLocationSubmit}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
                {locationFormMode === "create" ? "Шинэ салон нэмэх" : "Салон засварлах"}
              </h2>

              <label className="flex flex-col gap-1 text-xs">
                <span className="text-neutral-400">Салоны нэр</span>
                <input
                  required
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                  value={locationForm.name}
                  onChange={(event) => setLocationForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-neutral-400">Хот</span>
                  <input
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                    value={locationForm.city}
                    onChange={(event) => setLocationForm((current) => ({ ...current, city: event.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-neutral-400">Дүүрэг</span>
                  <input
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                    value={locationForm.district}
                    onChange={(event) => setLocationForm((current) => ({ ...current, district: event.target.value }))}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1 text-xs">
                <span className="text-neutral-400">Хаяг</span>
                <input
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                  value={locationForm.address}
                  onChange={(event) => setLocationForm((current) => ({ ...current, address: event.target.value }))}
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-neutral-400">Утас</span>
                  <input
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                    value={locationForm.phone}
                    onChange={(event) => setLocationForm((current) => ({ ...current, phone: event.target.value }))}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs">
                  <span className="text-neutral-400">Ажлын цаг</span>
                  <input
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                    value={locationForm.workingHours}
                    onChange={(event) => setLocationForm((current) => ({ ...current, workingHours: event.target.value }))}
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={locationForm.active}
                  onChange={(event) => setLocationForm((current) => ({ ...current, active: event.target.checked }))}
                />
                Идэвхтэй салон
              </label>

              <label className="flex flex-col gap-1 text-xs">
                <span className="text-neutral-400">Тайлбар</span>
                <textarea
                  rows={3}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                  value={locationForm.description}
                  onChange={(event) => setLocationForm((current) => ({ ...current, description: event.target.value }))}
                />
              </label>

              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="submit"
                  className="rounded-2xl bg-white px-4 py-3 font-semibold text-neutral-900 transition hover:bg-neutral-200"
                >
                  {locationFormMode === "create" ? "Салон нэмэх" : "Салон хадгалах"}
                </button>
                {locationFormMode === "edit" && (
                  <button
                    type="button"
                    className="rounded-2xl border border-white/10 px-3 py-2 text-neutral-200 transition hover:border-white/30 hover:bg-white/10"
                    onClick={resetLocationForm}
                  >
                    Цэвэрлэх
                  </button>
                )}
              </div>
            </form>

            <div className="flex flex-col gap-3">
              {adminLocations.length ? (
                adminLocations.map((location) => (
                  <div key={location.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-200">
                    <div className="flex flex-col gap-1">
                      <span className="text-neutral-100">{location.name}</span>
                      {location.address && <span className="text-xs text-neutral-400">{location.address}</span>}
                      <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                        {location.active ? "Идэвхтэй" : "Идэвхгүй"}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2 text-xs">
                      <button
                        className="rounded-2xl border border-white/10 px-3 py-2 text-neutral-200 transition hover:border-white/30 hover:bg-white/10"
                        onClick={() => handleEditLocation(location)}
                      >
                        Засах
                      </button>
                      <button
                        className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-rose-200 transition hover:border-rose-400/60 hover:bg-rose-500/20"
                        onClick={() => handleDeleteLocation(location.id)}
                      >
                        Устгах
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-xs text-neutral-400">
                  Салон бүртгэлгүй байна.
                </p>
              )}
            </div>
          </section>
        )}

        {adminTab === "artists" && (
          <section className="grid gap-6 md:grid-cols-2">
            <form className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6" onSubmit={handleArtistSubmit}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
                {artistFormMode === "create" ? "Шинэ артист нэмэх" : "Артист засварлах"}
              </h2>

              <label className="flex flex-col gap-1 text-xs">
                <span className="text-neutral-400">Нэр</span>
                <input
                  required
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                  value={artistForm.name}
                  onChange={(event) => setArtistForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>

              <label className="flex flex-col gap-1 text-xs">
                <span className="text-neutral-400">Био</span>
                <textarea
                  rows={3}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                  value={artistForm.bio}
                  onChange={(event) => setArtistForm((current) => ({ ...current, bio: event.target.value }))}
                />
              </label>

              <label className="flex flex-col gap-1 text-xs">
                <span className="text-neutral-400">Мэргэшил (таслалаар тусгаарлана)</span>
                <input
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                  value={artistForm.specialtiesText}
                  onChange={(event) => setArtistForm((current) => ({ ...current, specialtiesText: event.target.value }))}
                />
              </label>

              <label className="flex flex-col gap-1 text-xs">
                <span className="text-neutral-400">Зураг (URL)</span>
                <input
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-100 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30"
                  value={artistForm.avatarUrl}
                  onChange={(event) => setArtistForm((current) => ({ ...current, avatarUrl: event.target.value }))}
                />
              </label>

              <label className="flex items-center gap-2 text-xs text-neutral-300">
                <input
                  type="checkbox"
                  checked={artistForm.active}
                  onChange={(event) => setArtistForm((current) => ({ ...current, active: event.target.checked }))}
                />
                Идэвхтэй артист
              </label>

              <div className="flex flex-col gap-2 text-xs text-neutral-300">
                <span className="text-neutral-400">Харьяалагдах салон</span>
                <div className="flex flex-wrap gap-2">
                  {adminLocations.map((location) => {
                    const selected = artistForm.locationIds.includes(location.id);
                    return (
                      <button
                        key={location.id}
                        type="button"
                        className={`rounded-full border px-3 py-1 transition ${
                          selected ? "border-white bg-white text-neutral-900" : "border-white/10 text-neutral-300 hover:border-white/30"
                        }`}
                        onClick={() => handleArtistLocationToggle(location.id)}
                      >
                        {location.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  type="submit"
                  className="rounded-2xl bg-white px-4 py-3 font-semibold text-neutral-900 transition hover:bg-neutral-200"
                >
                  {artistFormMode === "create" ? "Артист нэмэх" : "Артист хадгалах"}
                </button>
                {artistFormMode === "edit" && (
                  <button
                    type="button"
                    className="rounded-2xl border border-white/10 px-3 py-2 text-neutral-200 transition hover:border-white/30 hover:bg-white/10"
                    onClick={resetArtistForm}
                  >
                    Цэвэрлэх
                  </button>
                )}
              </div>
            </form>

            <div className="flex flex-col gap-3">
              {adminArtists.length ? (
                adminArtists.map((artist) => (
                  <div key={artist.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-200">
                    <div className="flex flex-col gap-1">
                      <span className="text-neutral-100">{artist.name}</span>
                      {artist.specialties.length > 0 && (
                        <span className="text-xs text-neutral-400">{artist.specialties.join(", ")}</span>
                      )}
                      <span className="text-[11px] uppercase tracking-[0.2em] text-neutral-500">
                        {artist.active ? "Идэвхтэй" : "Идэвхгүй"}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {artist.locations.length
                          ? artist.locations.map((location) => location.name).join(", ")
                          : "Салон тохируулаагүй"}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2 text-xs">
                      <button
                        className="rounded-2xl border border-white/10 px-3 py-2 text-neutral-200 transition hover:border-white/30 hover:bg-white/10"
                        onClick={() => handleEditArtist(artist)}
                      >
                        Засах
                      </button>
                      <button
                        className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-rose-200 transition hover:border-rose-400/60 hover:bg-rose-500/20"
                        onClick={() => handleDeleteArtist(artist.id)}
                      >
                        Устгах
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-xs text-neutral-400">
                  Артист бүртгэлгүй байна.
                </p>
              )}
            </div>
          </section>
        )}

        {adminTab === "analytics" && (
          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">Артистын гүйцэтгэл</h2>
            {adminStats.length ? (
              <div className="flex flex-col gap-3">
                {adminStats.map((stat) => (
                  <div key={stat.id} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-neutral-200">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-neutral-100">{stat.name}</span>
                        <span className="text-xs text-neutral-400">Нийт захиалга: {stat.totalBookings}</span>
                      </div>
                      {stat.latestBooking && (
                        <span className="text-[11px] text-neutral-500">Сүүлд: {new Date(stat.latestBooking).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-xs text-neutral-400">
                Статистик одоогоор алга байна.
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

export default AdminPage;
