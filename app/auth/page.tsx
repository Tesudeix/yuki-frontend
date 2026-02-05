"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthContext } from "@/contexts/auth-context";
import { BASE_URL } from "@/lib/config";
import { ADMIN_PHONE, PASSWORD_MIN_LENGTH, TOKEN_STORAGE_KEY } from "@/lib/constants";
import { isValidPhoneInput, normalizePhoneForE164 } from "@/lib/phone";
import type { AuthMode, MessageDescriptor } from "@/lib/types";

const authModes: AuthMode[] = ["login", "register"];

const MODE_LABELS: Record<AuthMode, string> = {
  login: "Нэвтрэх",
  register: "Бүртгүүлэх",
};

const messageStyles: Record<MessageDescriptor["tone"], string> = {
  success: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
  error: "border-rose-400/40 bg-rose-500/10 text-rose-200",
  info: "border-[#1400FF]/30 bg-[#1400FF]/10 text-[#b4b0ff]",
};

// Brand accent
const ACCENT = "#1400FF";
const FOCUS = "#1400FF"; // subtle glow for focus state

const cardClass = "rounded-sm border border-white/10 bg-black/75 shadow-[0_24px_60px_-36px_rgba(20,0,255,0.35)] backdrop-blur";
const baseInputClass =
  `w-full rounded-sm border border-white/10 bg-black/70 px-4 py-3 text-base text-white outline-none transition focus:ring-4`;
const baseInputWithIconClass = `${baseInputClass} pl-11`;
const pillButtonClass =
  "rounded-sm px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/10";

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
    updateUserLocal,
  } = useAuthContext();

  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  // Invite removed from signup flow
  const [status, setStatus] = useState<"idle" | "submitting" | "processing">("idle");
  const [message, setMessage] = useState<MessageDescriptor | null>(null);

  // Field interaction states for inline validation feedback
  const [touchedName, setTouchedName] = useState(false);
  const [touchedPhone, setTouchedPhone] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMessage(null);
    setName("");
    setPassword("");
    setConfirmPassword("");
    setStatus("idle");
    setAvatarFile(null);
    setAvatarPreview(null);
    setTouchedName(false);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  }, [authMode]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  useEffect(() => {
    router.prefetch("/community");
    router.prefetch("/profile");
    router.prefetch("/admin");
    router.prefetch("/payment");
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

    if (authMode === "register" && name.trim().length < 2) {
      return false;
    }

    if (password.trim().length < PASSWORD_MIN_LENGTH) {
      return false;
    }

    if (authMode === "register" && password.trim() !== confirmPassword.trim()) {
      return false;
    }

    // No invite required

    return true;
  }, [authMode, confirmPassword, isBusy, name, password, phone]);

  // Inline error messages
  const nameError = authMode === "register" && name.trim().length < 2 ? "Нэрээ оруулна уу." : "";
  const phoneError = !isValidPhoneInput(phone) ? "Утасны дугаарыг зөв оруулна уу." : "";
  const passwordError = password.trim().length < PASSWORD_MIN_LENGTH ? `Нууц үг хамгийн багадаа ${PASSWORD_MIN_LENGTH} тэмдэгт.` : "";
  const confirmError = authMode === "register" && password.trim() !== confirmPassword.trim() ? "Нууц үгийн баталгаажуулалт тохирохгүй." : "";

  const primaryLabel = authMode === "register" ? "Бүртгүүлэх" : "Нэвтрэх";

  const getNormalizedPhone = (raw: string): string => normalizePhoneForE164(raw);

  const getUserId = (value: unknown): string => {
    if (!value || typeof value !== "object") return "";
    const obj = value as { id?: string; _id?: string };
    return obj.id || obj._id || "";
  };

  const handleRegistration = async () => {
    const trimmedPhone = phone.trim();
    const normalizedPhone = getNormalizedPhone(trimmedPhone);
    const trimmedName = name.trim();

    if (!isValidPhoneInput(trimmedPhone) || !normalizedPhone) {
      setMessage({ tone: "error", text: "Утасны дугаарыг зөв оруулна уу." });
      return;
    }

    if (trimmedName.length < 2) {
      setMessage({ tone: "error", text: "Нэрээ оруулна уу." });
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

    const result = await registerUser({ phone: normalizedPhone, password: password.trim(), name: trimmedName });

    if (!result.ok) {
      setStatus("idle");
      setMessage({ tone: "error", text: result.error });
      return;
    }

    updateUserLocal({ name: trimmedName });

    if (avatarFile) {
      setStatus("processing");
      try {
        const form = new FormData();
        form.append("file", avatarFile);
        const upRes = await fetch(`${BASE_URL}/upload`, { method: "POST", body: form });
        const upJson = (await upRes.json().catch(() => ({}))) as { downloadUrl?: string };
        if (upRes.ok && upJson.downloadUrl) {
          updateUserLocal({ avatarUrl: upJson.downloadUrl });
          const userId = getUserId(result.data);
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          const storedToken = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_STORAGE_KEY) : null;
          const authToken = storedToken || token;
          if (authToken) headers.Authorization = `Bearer ${authToken}`;
          if (userId) headers["X-User-Id"] = userId;
          try {
            const patchRes = await fetch(`${BASE_URL}/api/users/profile/avatar`, {
              method: "PATCH",
              headers,
              body: JSON.stringify({ avatarUrl: upJson.downloadUrl }),
            });
            await patchRes.json().catch(() => ({}));
          } catch (err) {
            console.warn("Avatar profile update failed", err);
          }
        }
      } catch (err) {
        console.warn("Avatar upload failed", err);
      }
    }

    setStatus("idle");
    setMessage({ tone: "success", text: "Бүртгэл амжилттай. Төлбөрийн хэсэг рүү шилжиж байна." });
    router.push("/payment");
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

      if (adminResult.ok) {
        const userResult = await loginUser({ phone: normalizedPhone, password: password.trim() });
        setStatus("idle");
        if (userResult.ok) {
          setMessage({ tone: "success", text: "Суперадмин нэвтэрлээ." });
          router.push("/community");
          return;
        }
        setMessage({ tone: "info", text: "Админ нэвтэрсэн боловч хэрэглэгчийн сесс үүссэнгүй." });
        router.push("/admin");
        return;
      }

      const fallbackUser = await loginUser({ phone: normalizedPhone, password: password.trim() });
      setStatus("idle");
      if (fallbackUser.ok) {
        setMessage({ tone: "success", text: "Амжилттай нэвтэрлээ." });
        router.push("/community");
        return;
      }

      setMessage({ tone: "error", text: adminResult.error });
      return;
    }

    const result = await loginUser({ phone: normalizedPhone, password: password.trim() });
    setStatus("idle");

    if (result.ok) {
      setMessage({ tone: "success", text: "Амжилттай нэвтэрлээ." });
      router.push("/community");
    } else {
      setMessage({ tone: "error", text: result.error });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // show errors if invalid
    setTouchedName(true);
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
    setName("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
    setMessage({ tone: "info", text: "Сесс дууслаа." });
  };

  return (
    <main className="relative min-h-screen w-full bg-black text-white">
      {/* Background image */}
      <div className="absolute inset-0 -z-10 opacity-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/ai-clan-bg.jpg" alt="AI Clan Background" className="h-full w-full object-cover" />
      </div>
      {/* Dark overlay */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/80 via-black/70 to-black/90" />

      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col justify-center px-6 py-16 sm:px-8 md:justify-start md:py-0 md:pt-32">
        <h1 className="mb-6 text-3xl font-bold">Нэвтрэх / Бүртгүүлэх</h1>

        {message && (
          <div className={`rounded-sm border px-4 py-3 text-sm ${messageStyles[message.tone]}`}>
            {message.text}
          </div>
        )}

        {(token || adminToken) && (
            <section className="flex flex-col gap-2">
              <div className="text-xs uppercase tracking-[0.34em] text-white">Active Session</div>
              <section className={`${cardClass} p-6 space-y-5`}>
                <div className="space-y-3">
                  {token && user && (
                      <div className="space-y-2">
                        {/* ...user info... */}
                      </div>
                  )}

                  {adminToken && adminProfile && (
                      <div className="space-y-2 rounded-sm border border-white/10 bg-black/80 p-4">
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
          <nav className="flex gap-2 rounded-sm border border-white/10 bg-black/70 p-1 text-sm text-white">
            {authModes.map((mode) => {
              const active = authMode === mode;
              return (
                <button
                  key={mode}
                  className={`${pillButtonClass} flex-1 border ${active ? "border-transparent" : "border-white/10 hover:bg-white/5"}`}
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

          {authMode === "register" && (
            <div className="rounded-sm border border-white/10 bg-black/60 px-3 py-2 text-xs text-neutral-300">
              Алхам 1/2 — Бүртгэлээ үүсгээд дараагийн алхамд төлбөрөө хийнэ.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {authMode === "register" && (
              <label className="block">
                <span className="text-sm font-medium text-white">Нэр</span>
                <div className="relative mt-2 group">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6f7496] transition-colors group-focus-within:text-[#1400FF]">
                    <UserIcon className="h-4 w-4" />
                  </span>
                  <input
                    autoComplete="name"
                    className={`${baseInputWithIconClass} ${touchedName && nameError ? "border-rose-500 focus:ring-rose-500/30" : "border-white/10 focus:border-[var(--focus)]"}`}
                    style={{ ['--focus']: FOCUS } as React.CSSProperties}
                    placeholder="Нэрээ оруулна уу"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    onBlur={() => setTouchedName(true)}
                    disabled={isBusy}
                  />
                </div>
                {touchedName && nameError && (
                  <span className="mt-1 block text-xs text-rose-600">{nameError}</span>
                )}
              </label>
            )}

            <label className="block">
              <span className="text-sm font-medium text-white">Утасны дугаар</span>
              <div className="relative mt-2 group">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6f7496] transition-colors group-focus-within:text-[#1400FF]">
                  <PhoneIcon className="h-4 w-4" />
                </span>
                <input
                  autoComplete="tel"
                  className={`${baseInputWithIconClass} ${touchedPhone && phoneError ? "border-rose-500 focus:ring-rose-500/30" : "border-white/10 focus:border-[var(--focus)]"}`}
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
              </div>
              {touchedPhone && phoneError && (
                <span className="mt-1 block text-xs text-rose-600">{phoneError}</span>
              )}
            </label>

            {/* Invite entry removed — free signup first */}

            <label className="block">
              <span className="text-sm font-medium text-white">Нууц үг</span>
              <div className="relative mt-2 group">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6f7496] transition-colors group-focus-within:text-[#1400FF]">
                  <LockIcon className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  autoComplete={authMode === "register" ? "new-password" : "current-password"}
                  className={`${baseInputWithIconClass} ${touchedPassword && passwordError ? "border-rose-500 focus:ring-rose-500/30" : "border-white/10 focus:border-[var(--focus)]"}`}
                  style={{ ['--focus']: FOCUS } as React.CSSProperties}
                  placeholder="••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onBlur={() => setTouchedPassword(true)}
                  disabled={isBusy}
                />
              </div>
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
                  <div className="relative mt-2 group">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6f7496] transition-colors group-focus-within:text-[#1400FF]">
                      <ShieldIcon className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      className={`${baseInputWithIconClass} ${touchedConfirm && confirmError ? "border-rose-500 focus:ring-rose-500/30" : "border-white/10 focus:border-[var(--focus)]"}`}
                      style={{ ['--focus']: FOCUS } as React.CSSProperties}
                      placeholder="••••••"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      onBlur={() => setTouchedConfirm(true)}
                      disabled={isBusy}
                    />
                  </div>
                  {touchedConfirm && confirmError && (
                    <span className="mt-1 block text-xs text-rose-600">{confirmError}</span>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-white">Профайл зураг (сонголтоор)</span>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <label className="group inline-flex items-center gap-2 rounded-sm border border-white/10 bg-black/70 px-3 py-2 text-xs font-semibold text-white transition hover:border-[#1400FF]/50">
                      <ImageIcon className="h-4 w-4 text-[#6f7496] transition-colors group-hover:text-[#1400FF]" />
                      Зураг сонгох
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                        disabled={isBusy}
                      />
                    </label>
                    <span className="text-xs text-neutral-400">
                      {avatarFile ? avatarFile.name : "PNG/JPG, 5MB хүртэл"}
                    </span>
                  </div>
                  {avatarPreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="Avatar preview" className="mt-3 h-24 w-24 rounded-full object-cover" />
                  )}
                  {!avatarPreview && (
                    <p className="mt-2 text-xs text-neutral-400">Энд оруулсан зураг бүх профайлд харагдана.</p>
                  )}
                </label>
              </>
            )}

            <button
              className="group relative w-full overflow-hidden rounded-sm px-5 py-3 text-sm font-semibold text-white transition focus-visible:outline-none focus-visible:ring-4 disabled:opacity-60"
              type="submit"
              disabled={!canSubmit}
              style={{ backgroundColor: ACCENT, boxShadow: "0 12px 26px -16px rgba(20,0,255,0.6)" }}
            >
              <span className="relative z-10">
                {status === "submitting"
                  ? (authMode === "register" ? "Бүртгэл үүсгэж байна" : "Нэвтэрч байна")
                  : status === "processing" && authMode === "register"
                    ? "Зураг хадгалж байна"
                    : primaryLabel}
              </span>
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

function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 12a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 12 12z" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}

function PhoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M6 4h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M9 17h2" />
    </svg>
  );
}

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" />
      <path d="M9.5 12.5l2 2 3-3" />
    </svg>
  );
}

function ImageIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 13l2.5-2.5 3 3 2-2 2.5 2.5" />
      <circle cx="9" cy="9" r="1.2" />
    </svg>
  );
}

export default AuthPage;
