"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthContext } from "@/contexts/auth-context";
import { ADMIN_PHONE, PASSWORD_MIN_LENGTH } from "@/lib/constants";
import { formatDateTime } from "@/lib/date-format";
import { isValidPhoneInput, normalizePhoneForE164 } from "@/lib/phone";
import type { AuthMode, MessageDescriptor } from "@/lib/types";

const authModes: AuthMode[] = ["login", "register"];

const MODE_LABELS: Record<AuthMode, string> = {
  login: "Нэвтрэх",
  register: "Бүртгүүлэх",
};

const messageStyles: Record<MessageDescriptor["tone"], string> = {
  success: "border-emerald-400/40 bg-emerald-500/10 text-emerald-950",
  error: "border-rose-400/40 bg-rose-500/10 text-rose-950",
  info: "border-sky-400/40 bg-sky-500/10 text-sky-950",
};

const cardClass = "rounded-[24px] border border-neutral-200/70 bg-white/95 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)] backdrop-blur";
const inputClass =
  "w-full rounded-2xl border border-neutral-200/80 bg-white/80 px-4 py-3 text-base text-neutral-900 outline-none transition focus:border-black focus:ring-4 focus:ring-neutral-900/10";
const pillButtonClass =
  "rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40";

const AuthPage = () => {
  const router = useRouter();
  const {
    token,
    user,
    adminToken,
    adminProfile,
    register: registerUser,
    login: loginUser,
    adminLogin,
    fetchProfile,
    logout,
  } = useAuthContext();

  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "processing">("idle");
  const [message, setMessage] = useState<MessageDescriptor | null>(null);

  useEffect(() => {
    setMessage(null);
    setPassword("");
    setConfirmPassword("");
    setStatus("idle");
  }, [authMode]);

  useEffect(() => {
    router.prefetch("/booking");
    router.prefetch("/admin");
  }, [router]);

  const isBusy = status !== "idle";

  const lastVerifiedLabel = formatDateTime(user?.lastVerifiedAt);
  const lastLoginLabel = formatDateTime(user?.lastLoginAt);
  const lastPasswordResetLabel = formatDateTime(user?.lastPasswordResetAt);

  const canSubmit = useMemo(() => {
    if (isBusy) {
      return false;
    }

    if (!isValidPhoneInput(phone)) {
      return false;
    }

    if (password.trim().length < PASSWORD_MIN_LENGTH) {
      return false;
    }

    if (authMode === "register" && password.trim() !== confirmPassword.trim()) {
      return false;
    }

    return true;
  }, [authMode, confirmPassword, isBusy, password, phone]);

  const primaryLabel = authMode === "register" ? "Бүртгүүлэх" : "Нэвтрэх";

  const getNormalizedPhone = (raw: string): string => normalizePhoneForE164(raw);

  const handleRegistration = async () => {
    const trimmedPhone = phone.trim();
    const normalizedPhone = getNormalizedPhone(trimmedPhone);

    if (!isValidPhoneInput(trimmedPhone) || !normalizedPhone) {
      setMessage({ tone: "error", text: "Утасны дугаарыг зөв оруулна уу." });
      return;
    }

    if (password.trim().length < PASSWORD_MIN_LENGTH) {
      setMessage({ tone: "error", text: `Нууц үг хамгийн багадаа ${PASSWORD_MIN_LENGTH} тэмдэгт байх ёстой.` });
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      setMessage({ tone: "error", text: "Нууц үгийн баталгаажуулалт тохирохгүй байна." });
      return;
    }

    setStatus("submitting");
    setMessage(null);

    const result = await registerUser({ phone: normalizedPhone, password: password.trim(), name: name.trim() || undefined });
    setStatus("idle");

    if (result.ok) {
      setMessage({ tone: "success", text: "Бүртгэл амжилттай. Захиалга руу шилжиж байна." });
      router.push("/booking");
    } else {
      setMessage({ tone: "error", text: result.error });
    }
  };

  const handleLogin = async () => {
    const trimmedPhone = phone.trim();
    const normalizedPhone = getNormalizedPhone(trimmedPhone);

    if (!isValidPhoneInput(trimmedPhone) || !normalizedPhone) {
      setMessage({ tone: "error", text: "Утасны дугаарыг дахин шалгаарай." });
      return;
    }

    if (password.trim().length < PASSWORD_MIN_LENGTH) {
      setMessage({ tone: "error", text: `Нууц үг хамгийн багадаа ${PASSWORD_MIN_LENGTH} тэмдэгт байх ёстой.` });
      return;
    }

    setStatus("submitting");
    setMessage(null);

    if (normalizedPhone === ADMIN_PHONE) {
      const adminResult = await adminLogin({ phone: normalizedPhone, password: password.trim() });
      setStatus("idle");

      if (adminResult.ok) {
        setMessage({ tone: "success", text: "Админ эрхээр нэвтэрлээ." });
        router.push("/admin");
      } else {
        setMessage({ tone: "error", text: adminResult.error });
      }
      return;
    }

    const result = await loginUser({ phone: normalizedPhone, password: password.trim() });
    setStatus("idle");

    if (result.ok) {
      setMessage({ tone: "success", text: "Амжилттай нэвтэрлээ." });
      router.push("/booking");
    } else {
      setMessage({ tone: "error", text: result.error });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }

    if (authMode === "register") {
      void handleRegistration();
    } else {
      void handleLogin();
    }
  };

  const handleFetchProfile = async () => {
    setStatus("processing");
    const result = await fetchProfile();
    setStatus("idle");

    if (result.ok) {
      setMessage({ tone: "success", text: "Профайл шинэчлэгдлээ." });
    } else {
      setMessage({ tone: "error", text: result.error });
    }
  };

  const handleLogout = () => {
    logout();
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setMessage({ tone: "info", text: "Сесс дууслаа." });
  };

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <div className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center gap-6 px-6 py-12 sm:max-w-md sm:px-8">
        <header className="space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.42em] text-neutral-400">Yuki Studio //</p>
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">Flow into your next session</h1>
          <p className="text-sm text-neutral-500">One phone. One password. Booking in under a minute.</p>
        </header>

        {message && (
          <div className={`rounded-xl border px-4 py-3 text-sm ${messageStyles[message.tone]}`}>
            {message.text}
          </div>
        )}

        {(token || adminToken) && (
            <section className="flex flex-col gap-4">
              <div className="text-xs uppercase tracking-[0.34em] text-neutral-400">Active Session</div>
              <section className={`${cardClass} p-6 space-y-5 border-neutral-200/60`}>
                <div className="space-y-3">
                  {token && user && (
                      <div className="space-y-2">
                        {/* ...user info... */}
                      </div>
                  )}

                  {adminToken && adminProfile && (
                      <div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                        {/* ...admin info... */}
                      </div>
                  )}
                </div>

                <button
                    className={`${pillButtonClass} w-full border border-neutral-300 bg-neutral-100 text-neutral-800 hover:border-neutral-500`}
                    onClick={handleLogout}
                >
                  Гарах
                </button>
              </section>
            </section>
          )}


        <section className={`${cardClass} p-5 space-y-6`}>
          <nav className="flex gap-2 rounded-full border border-neutral-200 bg-neutral-100 p-1 text-sm text-neutral-500">
            {authModes.map((mode) => {
              const active = authMode === mode;
              return (
                <button
                  key={mode}
                  className={`${pillButtonClass} flex-1 ${active ? "bg-neutral-900 text-white shadow-[0_8px_16px_-12px_rgba(15,23,42,0.45)]" : "hover:bg-white/80"}`}
                  onClick={() => setAuthMode(mode)}
                  disabled={active || isBusy}
                  type="button"
                >
                  {MODE_LABELS[mode]}
                </button>
              );
            })}
          </nav>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-neutral-600">Утасны дугаар</span>
              <input
                autoComplete="tel"
                className={inputClass}
                placeholder="99112233"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={isBusy}
                inputMode="numeric"
              />
              <span className="text-xs text-neutral-400">Олон улсын код нэмэх шаардлагагүй.</span>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-neutral-600">Нууц үг</span>
              <input
                type="password"
                autoComplete={authMode === "register" ? "new-password" : "current-password"}
                className={inputClass}
                placeholder="••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isBusy}
              />
              <span className="text-xs text-neutral-400">Багадаа {PASSWORD_MIN_LENGTH} тэмдэгт.</span>
            </label>

            {authMode === "register" && (
              <>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-neutral-600">Нууц үг баталгаажуулах</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className={inputClass}
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={isBusy}
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-neutral-600">Нэр (сонголтоор)</span>
                  <input
                    className={inputClass}
                    placeholder="Нэрээ оруулна уу"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={isBusy}
                  />
                </label>
              </>
            )}

            <button
              className="group relative w-full overflow-hidden rounded-full bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40 disabled:bg-neutral-300 disabled:text-neutral-500"
              type="submit"
              disabled={!canSubmit}
            >
              <span className="relative z-10">{status === "submitting" ? (authMode === "register" ? "Бүртгэл үүсгэж байна" : "Нэвтэрч байна") : primaryLabel}</span>
              <span className="absolute inset-0 translate-y-full bg-white/20 transition group-hover:translate-y-0"/>
            </button>
          </form>

          {authMode === "login" && (
            <p className="text-xs text-neutral-400">Нууц үгээ мартсан бол студийн ажилтнаас шинэ шуудан үүсгүүлэх боломжтой.</p>
          )}
        </section>
      </div>
    </main>
  );
};

export default AuthPage;
