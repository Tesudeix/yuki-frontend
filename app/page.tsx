"use client";

import { useCallback, useEffect, useState } from "react";

import { apiRequest, getApiBase, isSuccess } from "../lib/api-client";

type AuthenticatedUser = {
  phone: string;
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  age?: number | null;
  lastVerifiedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  [key: string]: unknown;
};

type MessageState = { tone: "info" | "success" | "error"; text: string } | null;

type TwilioStatusSnapshot = {
  ok: boolean;
  service?: {
    friendlyName?: string;
    sid?: string;
    codeLength?: number;
    customCodeEnabled?: boolean;
  };
  error?: { message?: string; code?: number } | string;
  checkedAt?: number;
};

type MongoStatusSnapshot = {
  connected: boolean;
  status: string;
  database?: string | null;
};

const PHONE_REGEX = /^\+\d{9,15}$/;

export default function Home() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [message, setMessage] = useState<MessageState>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "verifying" | "fetching">("idle");
  const [statusState, setStatusState] = useState<"checking" | "ready" | "degraded" | "unavailable">("checking");
  const [statusError, setStatusError] = useState<string | null>(null);
  const [twilioStatus, setTwilioStatus] = useState<TwilioStatusSnapshot | null>(null);
  const [mongoStatus, setMongoStatus] = useState<MongoStatusSnapshot | null>(null);
  const [apiBase, setApiBase] = useState("");

  useEffect(() => {
    setApiBase(getApiBase());
  }, []);

  const resolveError = useCallback(
    (payload: { error?: string; message?: string; details?: unknown }, fallback: string) => {
      if (payload.error) {
        return payload.error;
      }
      if (payload.message) {
        return payload.message;
      }
      if (typeof payload.details === "string") {
        return payload.details;
      }
      if (payload.details && typeof payload.details === "object" && "message" in payload.details) {
        const maybeMessage = (payload.details as { message?: unknown }).message;
        if (typeof maybeMessage === "string") {
          return maybeMessage;
        }
      }
      return fallback;
    },
    [],
  );

  const refreshSystemStatus = useCallback(async () => {
    const response = await apiRequest<{ twilio?: TwilioStatusSnapshot; mongo?: MongoStatusSnapshot }>(
      "/users/status",
      {
        method: "GET",
      },
    );

    if (isSuccess(response)) {
      const twilioSnapshot = response.twilio ?? null;
      const mongoSnapshot = response.mongo ?? null;

      setTwilioStatus(twilioSnapshot);
      setMongoStatus(mongoSnapshot);

      const twilioOk = twilioSnapshot?.ok ?? false;
      const mongoOk = mongoSnapshot?.connected ?? false;

      const twilioErrorMessage = !twilioOk
        ? twilioSnapshot
          ? typeof twilioSnapshot.error === "string"
            ? twilioSnapshot.error
            : twilioSnapshot.error?.message || "Twilio Verify үйлчилгээ бэлэн биш байна."
          : "Twilio Verify мэдээлэл олдсонгүй."
        : null;

      const mongoErrorMessage = !mongoOk
        ? mongoSnapshot
          ? `MongoDB (${mongoSnapshot.status}) холболт идэвхгүй байна.`
          : "MongoDB холболтын мэдээлэл олдсонгүй."
        : null;

      if (twilioOk && mongoOk) {
        setStatusState("ready");
        setStatusError(null);
        return;
      }

      if (!twilioOk && !mongoOk) {
        setStatusState("unavailable");
        setStatusError(
          `${twilioErrorMessage ?? "Twilio Verify үйлчилгээ бэлэн биш байна."} / ${
            mongoErrorMessage ?? "MongoDB холболт идэвхгүй байна."
          }`,
        );
        return;
      }

      setStatusState("degraded");
      setStatusError(twilioErrorMessage ?? mongoErrorMessage ?? "Үйлчилгээний бэлэн байдлыг шалгана уу.");
    } else {
      const errorMessage = resolveError(response, "Системийн байдлыг шалгахад алдаа гарлаа.");
      setStatusState("unavailable");
      setStatusError(errorMessage);
      setTwilioStatus(null);
      setMongoStatus(null);
    }
  }, [resolveError]);

  useEffect(() => {
    refreshSystemStatus();
  }, [refreshSystemStatus]);

  useEffect(() => {
    if ((statusState === "degraded" || statusState === "unavailable") && statusError) {
      setMessage((current) => current ?? { tone: "error", text: statusError });
    }
  }, [statusState, statusError]);

  const serviceReady = (twilioStatus?.ok ?? false) && (mongoStatus?.connected ?? false);

  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleString();
  };

  const fetchProfileWithToken = useCallback(
    async (authToken: string) => {
      const response = await apiRequest<{ user: AuthenticatedUser }>("/users/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (isSuccess(response)) {
        setUser(response.user);
        return { ok: true as const };
      }

      return {
        ok: false as const,
        error: resolveError(response, "Профайл татаж чадсангүй."),
      };
    },
    [resolveError],
  );

  const sendOtp = async () => {
    const trimmed = phone.trim();
    if (!PHONE_REGEX.test(trimmed)) {
      setMessage({ tone: "error", text: "Утасны дугаарыг + тэмдэгтэйгээр (E.164 формат) оруулна уу." });
      return;
    }

    if (!serviceReady) {
      setMessage({ tone: "error", text: "Twilio болон MongoDB үйлчилгээ бэлэн болмогц дахин оролдоно уу." });
      await refreshSystemStatus();
      return;
    }

    setStatus("sending");
    setMessage(null);

    const response = await apiRequest<Record<string, never>>("/users/otp/send", {
      method: "POST",
      body: JSON.stringify({ phone: trimmed }),
    });

    if (isSuccess(response)) {
      setMessage({ tone: "success", text: "OTP амжилттай илгээгдлээ." });
      setCode("");
    } else {
      setMessage({
        tone: "error",
        text: resolveError(response, "OTP илгээхэд алдаа гарлаа."),
      });
    }

    setStatus("idle");
  };

  const verifyOtp = async () => {
    const trimmed = phone.trim();
    if (!PHONE_REGEX.test(trimmed)) {
      setMessage({ tone: "error", text: "Утасны дугаарыг дахин шалгаарай." });
      return;
    }
    if (!code.trim()) {
      setMessage({ tone: "error", text: "Ирсэн OTP кодоо оруулна уу." });
      return;
    }

    if (!serviceReady) {
      setMessage({ tone: "error", text: "Twilio болон MongoDB үйлчилгээ бэлэн болмогц дахин оролдоно уу." });
      await refreshSystemStatus();
      return;
    }

    setStatus("verifying");
    setMessage(null);

    const response = await apiRequest<{ token: string; user: AuthenticatedUser }>("/users/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone: trimmed, code: code.trim() }),
    });

    if (isSuccess(response)) {
      const newToken = response.token;
      setToken(newToken);

      if (response.user) {
        setUser(response.user);
      }

      let profileResult: { ok: boolean; error?: string } | null = null;

      if (newToken) {
        profileResult = await fetchProfileWithToken(newToken);
      }

      if (profileResult && !profileResult.ok) {
        setMessage({
          tone: "error",
          text: `OTP баталгаажсан ч MongoDB-с уншихад алдаа гарлаа: ${profileResult.error}`,
        });
      } else {
        setMessage({
          tone: "success",
          text: "Амжилттай баталгаажлаа. Хэрэглэгч MongoDB-д хадгалагдсан.",
        });
      }

      await refreshSystemStatus();
    } else {
      setMessage({
        tone: "error",
        text: resolveError(response, "OTP баталгаажуулахад алдаа гарлаа."),
      });
    }

    setStatus("idle");
  };

  const fetchProfile = async () => {
    if (!token) {
      setMessage({ tone: "error", text: "Token байхгүй байна." });
      return;
    }

    setStatus("fetching");

    const result = await fetchProfileWithToken(token);

    if (result.ok) {
      setMessage({ tone: "success", text: "Профайл шинэчлэгдлээ." });
    } else {
      setMessage({ tone: "error", text: result.error });
    }

    setStatus("idle");
  };

  const sendDisabled = status === "sending" || status === "verifying" || !serviceReady;
  const verifyDisabled = status === "sending" || status === "verifying" || !serviceReady;
  const disableFetch = status === "fetching";

  const twilioLineClass = twilioStatus
    ? twilioStatus.ok
      ? "text-green-700"
      : "text-red-700"
    : statusState === "checking"
      ? "text-blue-700"
      : "text-red-700";

  const mongoLineClass = mongoStatus
    ? mongoStatus.connected
      ? "text-green-700"
      : "text-red-700"
    : statusState === "checking"
      ? "text-blue-700"
      : "text-red-700";

  const twilioLineText = twilioStatus
    ? twilioStatus.ok
      ? twilioStatus.service?.friendlyName || "Бэлэн"
      : typeof twilioStatus.error === "string"
        ? twilioStatus.error
        : twilioStatus.error?.message || "Идэвхгүй"
    : statusState === "checking"
      ? "Шалгаж байна..."
      : "Мэдээлэл алга";

  const mongoLineText = mongoStatus
    ? mongoStatus.connected
      ? `Холбогдсон${mongoStatus.database ? ` (${mongoStatus.database})` : ""}`
      : `Идэвхгүй (${mongoStatus.status})`
    : statusState === "checking"
      ? "Шалгаж байна..."
      : "Мэдээлэл алга";

  const lastVerifiedLabel = formatDateTime(user?.lastVerifiedAt ?? null);

  return (
      <main className="flex min-h-screen flex-col gap-4 p-10">
        <h1 className="text-3xl font-bold">Yuki + Twilio</h1>

        <section className="flex flex-col gap-1 text-sm text-gray-600">
          <span>
            API үндэс:
            <span className="ml-1 font-medium text-gray-800">{apiBase || "Тохируулаагүй"}</span>
          </span>
          <span className={twilioLineClass}>Twilio Verify: {twilioLineText}</span>
          <span className={mongoLineClass}>MongoDB: {mongoLineText}</span>
        </section>

        {message && (
            <div
                className={
                  message.tone === "success"
                      ? "rounded border border-green-300 bg-green-50 px-3 py-2 text-green-800"
                      : message.tone === "error"
                          ? "rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700"
                          : "rounded border border-blue-300 bg-blue-50 px-3 py-2 text-blue-700"
                }
            >
              {message.text}
            </div>
        )}

        {!token ? (
            <section className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">Утасны дугаар</span>
                <input
                    autoComplete="tel"
                    className="border px-3 py-2 rounded"
                    placeholder="+97699112233"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    disabled={status === "verifying"}
                />
              </label>

              <button
                  className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
                  onClick={sendOtp}
                  disabled={sendDisabled}
              >
                {status === "sending" ? "Илгээж байна..." : "OTP илгээх"}
              </button>

              <label className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">OTP код</span>
                <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="border px-3 py-2 rounded"
                    placeholder="123456"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    disabled={status === "sending"}
                />
              </label>

              <button
                  className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-60"
                  onClick={verifyOtp}
                  disabled={verifyDisabled}
              >
                {status === "verifying" ? "Баталгаажуулж байна..." : "OTP баталгаажуулах"}
              </button>
            </section>
        ) : (
            <section className="flex flex-col gap-3">
              <div className="rounded border border-gray-200 bg-slate-50 px-3 py-2">
                <p className="text-sm text-gray-600">Нэвтэрсэн хэрэглэгч</p>
                <p className="font-medium">{user?.phone ?? phone}</p>
                {lastVerifiedLabel && (
                    <p className="text-xs text-gray-500">Сүүлд баталгаажсан: {lastVerifiedLabel}</p>
                )}
              </div>

              <button
                  className="bg-gray-700 text-white px-4 py-2 rounded disabled:opacity-60"
                  onClick={fetchProfile}
                  disabled={disableFetch}
              >
                {status === "fetching" ? "Шинэчилж байна..." : "Профайл шинэчлэх"}
              </button>
            </section>
        )}
      </main>
  );
}
