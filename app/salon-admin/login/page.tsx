"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";

export default function SalonAdminLoginPage() {
  const router = useRouter();
  const { adminLogin } = useAuthContext();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    const res = await adminLogin({ phone, password });
    setStatus("idle");
    if (res.ok) {
      router.push("/salon-admin");
    } else {
      setError(res.error);
    }
  };

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-xl font-semibold">Admin Login</h1>
      {error && <div className="mb-3 rounded border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <div className="text-sm">Phone</div>
          <input className="w-full rounded border px-3 py-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+976..." />
        </label>
        <label className="block">
          <div className="text-sm">Password</div>
          <input className="w-full rounded border px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button className="w-full rounded bg-black px-4 py-2 font-medium text-white disabled:opacity-60" disabled={status === "submitting"}>
          {status === "submitting" ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}

