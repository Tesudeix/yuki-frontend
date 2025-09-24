"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthContext } from "@/contexts/auth-context";
import { ADMIN_PHONE, PASSWORD_MIN_LENGTH, PHONE_REGEX } from "@/lib/constants";
import { formatDateTime } from "@/lib/date-format";
import type { AuthMode, MessageDescriptor } from "@/lib/types";

const authModes: AuthMode[] = ["login", "register"];

const MODE_LABELS: Record<AuthMode, string> = {
  login: "Нэвтрэх",
  register: "Бүртгүүлэх",
};

const messageColors: Record<MessageDescriptor["tone"], string> = {
  success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
  error: "border-rose-500/40 bg-rose-500/10 text-rose-100",
  info: "border-sky-500/40 bg-sky-500/10 text-sky-100",
};

const cardClass =
  "rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_32px_-20px_rgba(255,255,255,0.6)] backdrop-blur";
const inputClass =
  "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10";
const pillButtonClass =
  "rounded-full px-4 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

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
    hydrated,
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

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (token) {
      router.prefetch("/booking");
    }
    if (adminToken) {
      router.prefetch("/admin");
    }
  }, [adminToken, hydrated, router, token]);

  const isBusy = status !== "idle";

  const lastVerifiedLabel = formatDateTime(user?.lastVerifiedAt);
  const lastLoginLabel = formatDateTime(user?.lastLoginAt);
  const lastPasswordResetLabel = formatDateTime(user?.lastPasswordResetAt);

  const validatePhone = (value: string) => PHONE_REGEX.test(value.trim());

  const canSubmit = useMemo(() => {
    if (isBusy) {
      return false;
    }

    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    if (!validatePhone(trimmedPhone) || trimmedPassword.length < PASSWORD_MIN_LENGTH) {
      return false;
    }

    if (authMode === "register") {
      return trimmedPassword === confirmPassword.trim();
    }

    return true;
  }, [authMode, confirmPassword, isBusy, password, phone]);

  const primaryLabel = authMode === "register" ? "Бүртгүүлэх" : "Нэвтрэх";

  const handleRegistration = async () => {
    const trimmedPhone = phone.trim();
    const trimmedPassword = password.trim();

    if (!validatePhone(trimmedPhone)) {
      setMessage({ tone: "error", text: "Утасны дугаарыг зөв оруулна уу." });
      return;
    }

    if (trimmedPassword.length < PASSWORD_MIN_LENGTH) {
      setMessage({ tone: "error", text: `Нууц үг хамгийн багадаа ${PASSWORD_MIN_LENGTH} тэмдэгт байх ёстой.` });
      return;
    }

    if (trimmedPassword !== confirmPassword.trim()) {
      setMessage({ tone: "error", text: "Нууц үгийн баталгаажуулалт тохирохгүй байна." });
      return;
    }

    setStatus("submitting");
    setMessage(null);

    const result = await registerUser({ phone: trimmedPhone, password: trimmedPassword, name: name.trim() || undefined });
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
    const trimmedPassword = password.trim();

    if (!validatePhone(trimmedPhone)) {
      setMessage({ tone: "error", text: "Утасны дугаарыг дахин шалгаарай." });
      return;
    }

    if (trimmedPassword.length < PASSWORD_MIN_LENGTH) {
      setMessage({ tone: "error", text: `Нууц үг хамгийн багадаа ${PASSWORD_MIN_LENGTH} тэмдэгт байх ёстой.` });
      return;
    }

    setStatus("submitting");
    setMessage(null);

    if (trimmedPhone === ADMIN_PHONE) {
      const adminResult = await adminLogin({ phone: trimmedPhone, password: trimmedPassword });
      setStatus("idle");

      if (adminResult.ok) {
        setMessage({ tone: "success", text: "Админ эрхээр нэвтэрлээ." });
        router.push("/admin");
      } else {
        setMessage({ tone: "error", text: adminResult.error });
      }
      return;
    }

    const result = await loginUser({ phone: trimmedPhone, password: trimmedPassword });
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
    setMessage({ tone: "info", text: "Амжилттай гарлаа." });
  };

  return (
    <main className="min-h-screen bg-black text-neutral-100">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-8 px-5 py-16">
        <header className="space-y-2 text-center sm:text-left">
          <span className="text-[11px] uppercase tracking-[0.36em] text-neutral-500">Yuki Studio</span>
          <h1 className="text-3xl font-semibold tracking-tight">Нэг дугаараар бүх захиалга</h1>
          <p className="text-sm text-neutral-500">Утас + нууц үг. Илүү ажиллагаа хэрэггүй.</p>
        </header>

        {message && (
          <div className={`${cardClass} border-dashed p-4 text-sm ${messageColors[message.tone]}`}>
            {message.text}
          </div>
        )}

        {(token || adminToken) && (
          <section className={`${cardClass} p-6 space-y-6`}>
            {token && user && (
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Идэвхтэй хэрэглэгч</p>
                <p className="text-lg font-semibold">{user.phone}</p>
                <dl className="space-y-1 text-xs text-neutral-400">
                  {lastLoginLabel && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-neutral-500">Сүүлд нэвтэрсэн</dt>
                      <dd className="text-right text-neutral-300">{lastLoginLabel}</dd>
                    </div>
                  )}
                  {lastVerifiedLabel && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-neutral-500">Сүүлд баталгаажсан</dt>
                      <dd className="text-right text-neutral-300">{lastVerifiedLabel}</dd>
                    </div>
                  )}
                  {lastPasswordResetLabel && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-neutral-500">Сүүлд нууц үг шинэчилсэн</dt>
                      <dd className="text-right text-neutral-300">{lastPasswordResetLabel}</dd>
                    </div>
                  )}
                </dl>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button className={`${pillButtonClass} border border-white/10 hover:border-white/30 hover:bg-white/10`} onClick={() => router.push("/booking")}>
                    Захиалга руу
                  </button>
                  <button
                    className={`${pillButtonClass} border border-white/10 hover:border-white/30 hover:bg-white/10 disabled:border-white/5 disabled:text-neutral-500`}
                    onClick={handleFetchProfile}
                    disabled={isBusy}
                  >
                    Профайл шинэчлэх
                  </button>
                </div>
              </div>
            )}

            {adminToken && adminProfile && (
              <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4 text-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Админ</p>
                <p className="font-semibold text-neutral-100">{adminProfile.phone}</p>
                {adminProfile.name && <p className="text-neutral-300">{adminProfile.name}</p>}
                <button className={`${pillButtonClass} w-full border border-white/10 hover:border-white/30 hover:bg-white/10`} onClick={() => router.push("/admin")}>
                  Админ самбар
                </button>
              </div>
            )}

            <button className={`${pillButtonClass} w-full border border-white/15 py-3 text-sm font-semibold hover:border-white/30 hover:bg-white/10`} onClick={handleLogout}>
              Сэссийг дуусгах
            </button>
          </section>
        )}

        <section className={`${cardClass} p-6 space-y-6`}>
          <nav className="inline-flex gap-2 rounded-full bg-white/5 p-1 text-xs text-neutral-400">
            {authModes.map((mode) => {
              const active = authMode === mode;
              return (
                <button
                  key={mode}
                  className={`${pillButtonClass} ${active ? "bg-white text-black" : "hover:bg-white/10"}`}
                  onClick={() => setAuthMode(mode)}
                  disabled={active || isBusy}
                  type="button"
                >
                  {MODE_LABELS[mode]}
                </button>
              );
            })}
          </nav>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2 text-xs">
              <span className="uppercase tracking-[0.3em] text-neutral-500">Утасны дугаар</span>
              <input
                autoComplete="tel"
                className={inputClass}
                placeholder="+976XXXXXXXX"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                disabled={isBusy}
                inputMode="tel"
              />
            </label>

            <label className="block space-y-2 text-xs">
              <span className="uppercase tracking-[0.3em] text-neutral-500">Нууц үг</span>
              <input
                type="password"
                autoComplete={authMode === "register" ? "new-password" : "current-password"}
                className={inputClass}
                placeholder="••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isBusy}
              />
              <span className="text-[11px] text-neutral-500">Багадаа {PASSWORD_MIN_LENGTH} тэмдэгт.</span>
            </label>

            {authMode === "register" && (
              <>
                <label className="block space-y-2 text-xs">
                  <span className="uppercase tracking-[0.3em] text-neutral-500">Нууц үг баталгаажуулах</span>
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

                <label className="block space-y-2 text-xs">
                  <span className="uppercase tracking-[0.3em] text-neutral-500">Нэр (сонголтоор)</span>
                  <input
                    className={inputClass}
                    placeholder="Жишээ: Нараа"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={isBusy}
                  />
                </label>
              </>
            )}

            <button
              className="w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:bg-white/30 disabled:text-neutral-500"
              type="submit"
              disabled={!canSubmit}
            >
              {status === "submitting"
                ? authMode === "register"
                  ? "Бүртгэл үүсгэж байна"
                  : "Нэвтэрч байна"
                : primaryLabel}
            </button>
          </form>

          {authMode === "login" && (
            <p className="text-[11px] text-neutral-500">
              Нууц үгээ мартсан уу? Түр хугацаанд студийн ажилтанд хандаж сессийг шинэчилж өгнө.
            </p>
          )}
        </section>
      </div>
    </main>
  );
};

export default AuthPage;
