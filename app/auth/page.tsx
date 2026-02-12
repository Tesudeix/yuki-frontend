"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthContext } from "@/contexts/auth-context";

export default function AuthPage() {
  const router = useRouter();
  const { adminLogin, adminToken, adminProfile } = useAuthContext();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const result = await adminLogin({ phone: phone.trim(), password: password.trim() });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/shop");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <section className="rounded-[4px] border border-black/20 bg-white p-5">
        <h1 className="text-lg font-semibold text-black">Admin Login</h1>
        <p className="mt-1 text-sm text-black/70">Login to add and manage products for YukiMobile.</p>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-xs text-black">
            <span>Phone</span>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+976..."
              className="rounded-[4px] border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
            />
          </label>

          <label className="grid gap-1 text-xs text-black">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-[4px] border border-black/20 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
            />
          </label>

          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy || !phone.trim() || !password.trim()}
            className="rounded-[4px] border border-black bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>

          {error ? (
            <p className="rounded-[4px] border border-black/20 bg-white px-3 py-2 text-xs text-black">{error}</p>
          ) : null}

          {adminToken ? (
            <div className="rounded-[4px] border border-black/20 bg-white px-3 py-2 text-xs text-black">
              Logged in as: {adminProfile?.phone || "admin"}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
