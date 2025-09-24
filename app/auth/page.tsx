"use client";

import { useEffect, useState } from "react";
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
    changePassword,
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

  const validatePhone = (value: string) => PHONE_REGEX.test(value.trim());

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

  const handlePrimaryAction = () => {
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

  const handleQuickPasswordReset = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      setMessage({ tone: "error", text: "Шинэ нууц үгийг бөглөнө үү." });
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      setMessage({ tone: "error", text: "Нууц үгийн баталгаажуулалт тохирохгүй байна." });
      return;
    }

    setStatus("processing");
    const result = await changePassword({ currentPassword: "", newPassword: password.trim() });
    setStatus("idle");

    if (result.ok) {
      setMessage({ tone: "success", text: "Нууц үг шинэчлэгдлээ." });
    } else {
      setMessage({ tone: "error", text: result.error });
    }
  };

  const disablePrimary = isBusy;

  return (
    <main className="min-h-screen bg-black text-neutral-100">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-5 py-16">
        <header className="flex flex-col gap-3">
          <span className="text-[11px] uppercase tracking-[0.38em] text-neutral-500">Yuki Studio</span>
          <h1 className="text-3xl font-semibold tracking-tight">Нэг дугаараар бүх захиалга</h1>
          <p className="text-sm text-neutral-500">Утас + нууц үг. Илүү ажиллагаа хэрэггүй.</p>
        </header>

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

        {(token || adminToken) ? (
          <section className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            {token && user && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-neutral-500">
                  <span>Хэрэглэгч</span>
                  <span>{user.phone}</span>
                </div>
                <div className="space-y-1 text-xs text-neutral-400">
                  {lastLoginLabel && <p>Сүүлд нэвтэрсэн: {lastLoginLabel}</p>}
                  {lastVerifiedLabel && <p>Сүүлд баталгаажсан: {lastVerifiedLabel}</p>}
                  {lastPasswordResetLabel && <p>Сүүлд нууц үг шинэчилсэн: {lastPasswordResetLabel}</p>}
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    className="rounded-full border border-white/10 px-4 py-2 transition hover:border-white/30 hover:bg-white/10"
                    onClick={() => router.push("/booking")}
                  >
                    Захиалга руу
                  </button>
                  <button
                    className="rounded-full border border-white/10 px-4 py-2 transition hover:border-white/30 hover:bg-white/10 disabled:border-white/5 disabled:text-neutral-500"
                    onClick={handleFetchProfile}
                    disabled={isBusy}
                  >
                    Профайл шинэчлэх
                  </button>
                </div>
              </div>
            )}

            {adminToken && adminProfile && (
              <div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-neutral-300">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-neutral-500">
                  <span>Админ</span>
                  <span>{adminProfile.phone}</span>
                </div>
                {adminProfile.name && <p className="text-neutral-100">{adminProfile.name}</p>}
                <button
                  className="w-full rounded-full border border-white/10 px-4 py-2 text-xs transition hover:border-white/30 hover:bg-white/10"
                  onClick={() => router.push("/admin")}
                >
                  Админ самбар
                </button>
              </div>
            )}

            <button
              className="w-full rounded-full border border-white/15 px-4 py-3 text-sm font-medium text-neutral-100 transition hover:border-white/40 hover:bg-white/10"
              onClick={logout}
            >
              Сэссийг дуусгах
            </button>
          </section>
        ) : (
          <section className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <nav className="inline-flex items-center gap-2 rounded-full bg-white/5 p-1 text-xs text-neutral-400">
              {authModes.map((mode) => {
                const active = authMode === mode;
                return (
                  <button
                    key={mode}
                    className={`rounded-full px-4 py-2 transition ${active ? "bg-white text-black" : "hover:bg-white/10"}`}
                    onClick={() => setAuthMode(mode)}
                    disabled={active || isBusy}
                  >
                    {MODE_LABELS[mode]}
                  </button>
                );
              })}
            </nav>

            <div className="space-y-4">
              <label className="flex flex-col gap-2 text-xs">
                <span className="uppercase tracking-[0.3em] text-neutral-500">Утасны дугаар</span>
                <input
                  autoComplete="tel"
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                  placeholder="+976XXXXXXXX"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={isBusy}
                />
              </label>

              <label className="flex flex-col gap-2 text-xs">
                <span className="uppercase tracking-[0.3em] text-neutral-500">Нууц үг</span>
                <input
                  type="password"
                  autoComplete={authMode === "register" ? "new-password" : "current-password"}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                  placeholder="••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isBusy}
                />
                <span className="text-[11px] text-neutral-500">Багадаа {PASSWORD_MIN_LENGTH} тэмдэгт.</span>
              </label>

              {authMode === "register" && (
                <>
                  <label className="flex flex-col gap-2 text-xs">
                    <span className="uppercase tracking-[0.3em] text-neutral-500">Нууц үг баталгаажуулах</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                      placeholder="••••••"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      disabled={isBusy}
                    />
                  </label>

                  <label className="flex flex-col gap-2 text-xs">
                    <span className="uppercase tracking-[0.3em] text-neutral-500">Нэр (сонголтоор)</span>
                    <input
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-neutral-100 outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/10"
                      placeholder="Жишээ: Нараа"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      disabled={isBusy}
                    />
                  </label>
                </>
              )}

              <button
                className="w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200 disabled:bg-white/40 disabled:text-neutral-500"
                onClick={handlePrimaryAction}
                disabled={disablePrimary}
              >
                {status === "submitting"
                  ? authMode === "register"
                    ? "Бүртгэл үүсгэж байна"
                    : "Нэвтэрч байна"
                  : authMode === "register"
                    ? "Бүртгүүлэх"
                    : "Нэвтрэх"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default AuthPage;
