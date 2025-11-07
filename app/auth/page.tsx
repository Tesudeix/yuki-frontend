"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthContext } from "@/contexts/auth-context";
import { ADMIN_PHONE, PASSWORD_MIN_LENGTH } from "@/lib/constants";
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

// Accent color (note: provided as #1080CAz; using #1080CA assuming typo)
const ACCENT = "#1080CA";
const FOCUS = "#e93b68"; // subtle glow for focus state

const cardClass = "rounded-sm border border-black/70 bg-black/95 shadow-[0_18px_48px_-24px_rgba(15,23,42,0.35)] backdrop-blur";
const baseInputClass =
  `w-full rounded-sm border bg-black/80 px-4 py-3 text-base text-white outline-none transition focus:ring-4`;
const pillButtonClass =
  "rounded-sm px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/40";

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
    // fetchProfile,
    logout,
  } = useAuthContext();

  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "processing">("idle");
  const [message, setMessage] = useState<MessageDescriptor | null>(null);

  // Field interaction states for inline validation feedback
  const [touchedPhone, setTouchedPhone] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);

  useEffect(() => {
    setMessage(null);
    setPassword("");
    setConfirmPassword("");
    setStatus("idle");
  }, [authMode]);

  useEffect(() => {
    router.prefetch("/feed");
    router.prefetch("/profile");
    router.prefetch("/admin");
  }, [router]);

  const isBusy = status !== "idle";

  // Derived timestamps can be shown in session UI when needed
  // const lastVerifiedLabel = formatDateTime(user?.lastVerifiedAt);
  // const lastLoginLabel = formatDateTime(user?.lastLoginAt);
  // const lastPasswordResetLabel = formatDateTime(user?.lastPasswordResetAt);

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

    if (authMode === "register" && !inviteCode.trim()) {
      return false;
    }

    return true;
  }, [authMode, confirmPassword, isBusy, password, phone, inviteCode]);

  // Inline error messages
  const phoneError = !isValidPhoneInput(phone) ? "Утасны дугаарыг зөв оруулна уу." : "";
  const passwordError = password.trim().length < PASSWORD_MIN_LENGTH ? `Нууц үг хамгийн багадаа ${PASSWORD_MIN_LENGTH} тэмдэгт.` : "";
  const confirmError = authMode === "register" && password.trim() !== confirmPassword.trim() ? "Нууц үгийн баталгаажуулалт тохирохгүй." : "";

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

    if (!inviteCode.trim()) {
      setMessage({ tone: "error", text: "Invite код шаардлагатай." });
      return;
    }

    setStatus("submitting");
    setMessage(null);

    const result = await registerUser({ phone: normalizedPhone, password: password.trim(), name: name.trim() || undefined, inviteCode: inviteCode.trim() });
    setStatus("idle");

    if (result.ok) {
      setMessage({ tone: "success", text: "Бүртгэл амжилттай. Feed рүү шилжиж байна." });
      router.push("/feed");
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
      router.push("/feed");
    } else {
      setMessage({ tone: "error", text: result.error });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // show errors if invalid
    setTouchedPhone(true);
    setTouchedPassword(true);
    setTouchedConfirm(true);
    if (!canSubmit) return;

    if (authMode === "register") {
      void handleRegistration();
    } else {
      void handleLogin();
    }
  };

  // Uncomment to expose a manual profile refresh action in the UI
  // const handleFetchProfile = async () => {
  //   setStatus("processing");
  //   const result = await fetchProfile();
  //   setStatus("idle");
  //   if (result.ok) setMessage({ tone: "success", text: "Профайл шинэчлэгдлээ." });
  //   else setMessage({ tone: "error", text: result.error });
  // };

  const handleLogout = () => {
    logout();
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setMessage({ tone: "info", text: "Сесс дууслаа." });
  };

  return (
    <main className="min-h-screen bg-[#161618] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[400px] flex-col justify-center px-6 py-12 sm:px-8">
        <header className="space-y-4">
          <h1 className="text-white font-extrabold uppercase" style={{ color: "white", letterSpacing: "0.06em" }}>
            <span className="text-2xl sm:text-3xl tracking-wide">TESUDEIX</span>
          </h1>
          <p className="text-sm text-white/90 pb-10 ">One phone. One password.</p>
        </header>

        {message && (
          <div className={`rounded-sm border px-4 py-3 text-sm ${messageStyles[message.tone]}`}>
            {message.text}
          </div>
        )}

        {(token || adminToken) && (
            <section className="flex flex-col gap-2">
              <div className="text-xs uppercase tracking-[0.34em] text-white">Active Session</div>
              <section className={`${cardClass} p-6 space-y-5 border-black`}>
                <div className="space-y-3">
                  {token && user && (
                      <div className="space-y-2">
                        {/* ...user info... */}
                      </div>
                  )}

                  {adminToken && adminProfile && (
                      <div className="space-y-2 rounded-sm border border-black bg-black p-4">
                        {/* ...admin info... */}
                      </div>
                  )}
                </div>

                <button
                    className={`${pillButtonClass} w-full border border-neutral-300 bg-black text-white hover:border-neutral-500`}
                    onClick={handleLogout}
                >
                  Гарах
                </button>
              </section>
            </section>
          )}


        <section className={`${cardClass} p-5 space-y-6`}>
          <nav className="flex gap-2 rounded-sm border border-black bg-black p-1 text-sm text-white">
            {authModes.map((mode) => {
              const active = authMode === mode;
              return (
                <button
                  key={mode}
                  className={`${pillButtonClass} flex-1 border ${active ? "border-transparent" : "border-black hover:bg-black"}`}
                  onClick={() => setAuthMode(mode)}
                  disabled={active || isBusy}
                  type="button"
                  style={active ? { backgroundColor: ACCENT, color: "#fff" } : undefined}
                >
                  {MODE_LABELS[mode]}
                </button>
              );
            })}
          </nav>

          <form onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-white">Утасны дугаар</span>
              <input
                autoComplete="tel"
                className={`${baseInputClass} ${touchedPhone && phoneError ? "border-rose-500 focus:ring-rose-500/30" : "border-black/80 focus:border-[var(--focus)]"}`}
                style={{
                  // focus glow color
                  // expose CSS var for Tailwind-less custom shade
                  ['--focus']: FOCUS,
                } as React.CSSProperties}
                placeholder="99112233"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                onBlur={() => setTouchedPhone(true)}
                disabled={isBusy}
                inputMode="numeric"
              />
              {touchedPhone && phoneError ? (
                <span className="mt-1 block text-xs text-rose-600">{phoneError}</span>
              ) : (
                <span className="mt-1 block text-xs text-white">Олон улсын код нэмэх шаардлагагүй.</span>
              )}
            </label>

            {authMode === "register" && (
              <div className="grid gap-2">
                <label className="block">
                  <span className="text-sm font-medium text-white">Invite код</span>
                  <input
                    className={`${baseInputClass} border-black/80 focus:border-[var(--focus)]`}
                    style={{ ['--focus']: FOCUS } as React.CSSProperties}
                    placeholder="Invite code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    disabled={isBusy}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const url = process.env.NEXT_PUBLIC_PAYMENT_URL || "/payment";
                    window.location.href = url;
                  }}
                  className="w-full rounded-sm border border-black bg-black px-4 py-2 text-sm text-white hover:border-neutral-700"
                >
                  Invite код авах
                </button>
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-white">Нууц үг</span>
              <input
                type="password"
                autoComplete={authMode === "register" ? "new-password" : "current-password"}
                className={`${baseInputClass} ${touchedPassword && passwordError ? "border-rose-500 focus:ring-rose-500/30" : "border-black/80 focus:border-[var(--focus)]"}`}
                style={{ ['--focus']: FOCUS } as React.CSSProperties}
                placeholder="••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onBlur={() => setTouchedPassword(true)}
                disabled={isBusy}
              />
              {touchedPassword && passwordError ? (
                <span className="mt-1 block text-xs text-rose-600">{passwordError}</span>
              ) : (
                <span className="mt-1 block text-xs text-white">Багадаа {PASSWORD_MIN_LENGTH} тэмдэгт.</span>
              )}
            </label>

            {authMode === "register" && (
              <>
                <label className="block">
                  <span className="text-sm font-medium text-white">Нууц үг баталгаажуулах</span>
                  <input
                    type="password"
                    autoComplete="new-password"
                    className={`${baseInputClass} ${touchedConfirm && confirmError ? "border-rose-500 focus:ring-rose-500/30" : "border-black/80 focus:border-[var(--focus)]"}`}
                    style={{ ['--focus']: FOCUS } as React.CSSProperties}
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    onBlur={() => setTouchedConfirm(true)}
                    disabled={isBusy}
                  />
                  {touchedConfirm && confirmError && (
                    <span className="mt-1 block text-xs text-rose-600">{confirmError}</span>
                  )}
                </label>

                <label className="block pb-4">
                  <span className="text-sm font-medium text-white">Нэр (сонголтоор)</span>
                  <input
                    className={`${baseInputClass} border-black/80 focus:border-[var(--focus)]`}
                    style={{ ['--focus']: FOCUS } as React.CSSProperties}
                    placeholder="Нэрээ оруулна уу"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={isBusy}
                  />
                </label>
              </>
            )}

            <button
              className="group relative w-full overflow-hidden rounded-sm px-5 py-3 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-4 disabled:opacity-60"
              type="submit"
              disabled={!canSubmit}
              style={{ backgroundColor: ACCENT, boxShadow: "0 10px 24px -14px rgba(16,128,202,0.8)" }}
            >
              <span className="relative z-10">{status === "submitting" ? (authMode === "register" ? "Бүртгэл үүсгэж байна" : "Нэвтэрч байна") : primaryLabel}</span>
              <span className="absolute inset-0 translate-y-full bg-black/20 transition group-hover:translate-y-0"/>
            </button>

            <div className="text-center">
              <a href="#" className="mt-2 inline-block text-sm" style={{ color: ACCENT }}>
                Нууц үг мартсан уу?
              </a>
            </div>
          </form>

          {authMode === "login" && (
            <p className="text-xs text-white"></p>
          )}
        </section>
      </div>
    </main>
  );
};

export default AuthPage;
