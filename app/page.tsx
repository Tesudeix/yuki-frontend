"use client";

import { useEffect, useState } from "react";

import { apiRequest, getApiBase, isSuccess } from "../lib/api-client";

type AuthenticatedUser = {
  phone: string;
  [key: string]: unknown;
};

type MessageState = { tone: "info" | "success" | "error"; text: string } | null;

const PHONE_REGEX = /^\+\d{9,15}$/;

export default function Home() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [message, setMessage] = useState<MessageState>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "verifying" | "fetching">("idle");
  const [serviceStatus, setServiceStatus] = useState<"checking" | "ready" | "unavailable">("checking");
  const [serviceDetails, setServiceDetails] = useState<{ friendlyName?: string } | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [apiBase, setApiBase] = useState("");

  useEffect(() => {
    setApiBase(getApiBase());
  }, []);

  const resolveError = (
    payload: { error?: string; message?: string; details?: unknown },
    fallback: string,
  ) => {
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
  };

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      const response = await apiRequest<{ service?: { friendlyName?: string } }>("/users/otp/status", {
        method: "GET",
      });

      if (cancelled) {
        return;
      }

      if (isSuccess(response)) {
        setServiceDetails(response.service ?? null);
        setServiceError(null);
        setServiceStatus("ready");
      } else {
        setServiceDetails(null);
        setServiceError(response.error ?? null);
        setServiceStatus("unavailable");
      }
    };

    fetchStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (serviceStatus === "unavailable") {
      setMessage((current) =>
        current ?? {
          tone: "error",
          text: serviceError
            ? `Twilio Verify үйлчилгээ бэлэн биш байна: ${serviceError}`
            : "Twilio Verify үйлчилгээ бэлэн биш байна.",
        },
      );
    }
  }, [serviceStatus, serviceError]);

  const serviceReady = serviceStatus === "ready";

  const sendOtp = async () => {
    const trimmed = phone.trim();
    if (!PHONE_REGEX.test(trimmed)) {
      setMessage({ tone: "error", text: "Утасны дугаарыг + тэмдэгтэйгээр (E.164 формат) оруулна уу." });
      return;
    }

    if (!serviceReady) {
      setMessage({ tone: "error", text: "Twilio Verify үйлчилгээ бэлэн болмогц дахин оролдоно уу." });
      return;
    }

    setStatus("sending");
    setMessage(null);

    const response = await apiRequest<{}>("/users/otp/send", {
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
      setMessage({ tone: "error", text: "Twilio Verify үйлчилгээ бэлэн болмогц дахин оролдоно уу." });
      return;
    }

    setStatus("verifying");
    setMessage(null);

    const response = await apiRequest<{ token: string; user: AuthenticatedUser }>("/users/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phone: trimmed, code: code.trim() }),
    });

    if (isSuccess(response)) {
      setToken(response.token);
      setUser(response.user);
      setMessage({ tone: "success", text: "Амжилттай баталгаажлаа." });
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

    const response = await apiRequest<{ user: AuthenticatedUser }>("/users/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (isSuccess(response)) {
      setUser(response.user);
      setMessage({ tone: "success", text: "Профайл шинэчлэгдлээ." });
    } else {
      setMessage({
        tone: "error",
        text: resolveError(response, "Профайл татаж чадсангүй."),
      });
    }

    setStatus("idle");
  };

  const sendDisabled = status === "sending" || status === "verifying" || !serviceReady;
  const verifyDisabled = status === "sending" || status === "verifying" || !serviceReady;
  const disableFetch = status === "fetching";

  return (
      <main className="flex min-h-screen flex-col gap-4 p-10">
        <h1 className="text-3xl font-bold">Yuki + Twilio</h1>

        <section className="flex flex-col gap-1 text-sm text-gray-600">
          <span>
            API үндэс:
            <span className="ml-1 font-medium text-gray-800">{apiBase || "Тохируулаагүй"}</span>
          </span>
          <span
              className={
                serviceStatus === "ready"
                  ? "text-green-700"
                  : serviceStatus === "checking"
                      ? "text-blue-700"
                      : "text-red-700"
              }
          >
            Twilio Verify: {serviceStatus === "ready"
              ? serviceDetails?.friendlyName || "Бэлэн"
              : serviceStatus === "checking"
                  ? "Шалгаж байна..."
                  : serviceError || "Идэвхгүй"}
          </span>
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
