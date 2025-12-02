"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { apiRequest, isSuccess } from "@/lib/api-client";

type Branch = { id: string; name: string; address: string; openingHours: string };

export default function BranchesAdminPage() {
  const router = useRouter();
  const { adminToken, hydrated } = useAuthContext();
  const headers = useMemo(() => (adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined), [adminToken]);
  const [items, setItems] = useState<Branch[]>([]);
  const [form, setForm] = useState<Partial<Branch>>({ name: "", address: "", openingHours: "09:00-18:00" });
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!adminToken) { router.replace("/salon-admin/login"); return; }
    void load();
  }, [adminToken, hydrated, router]);

  const load = async () => {
    const res = await apiRequest<{ branches: Branch[] }>("/api/branches");
    if (isSuccess(res)) setItems(res.branches || []);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!headers) return;
    if (!form.name) { setError("Name required"); return; }
    if (editId) {
      const res = await apiRequest<{ branch: Branch }>(`/api/admin/branches/${editId}`, { method: "PUT", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (isSuccess(res)) { setForm({ name: "", address: "", openingHours: "09:00-18:00" }); setEditId(null); void load(); }
      else setError(res.error || "Update failed");
    } else {
      const res = await apiRequest<{ branch: Branch }>(`/api/admin/branches`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (isSuccess(res)) { setForm({ name: "", address: "", openingHours: "09:00-18:00" }); void load(); }
      else setError(res.error || "Create failed");
    }
  };

  const remove = async (id: string) => {
    if (!headers) return;
    const res = await apiRequest(`/api/admin/branches/${id}`, { method: "DELETE", headers });
    if (isSuccess(res)) void load();
  };

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-xl font-semibold">Branches</h1>

      {error && <div className="rounded border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">{error}</div>}

      <form onSubmit={submit} className="space-y-2 rounded border p-4">
        <input className="w-full rounded border px-3 py-2" placeholder="Name" value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <input className="w-full rounded border px-3 py-2" placeholder="Address" value={form.address || ""} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        <input className="w-full rounded border px-3 py-2" placeholder="Opening hours (e.g., 09:00-18:00)" value={form.openingHours || ""} onChange={(e) => setForm((f) => ({ ...f, openingHours: e.target.value }))} />
        <div className="flex gap-2">
          <button className="rounded bg-black px-4 py-2 text-white">{editId ? "Save" : "Add"}</button>
          {editId && <button type="button" className="rounded border px-4 py-2" onClick={() => { setEditId(null); setForm({ name: "", address: "", openingHours: "09:00-18:00" }); }}>Cancel</button>}
        </div>
      </form>

      <div className="overflow-hidden rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Address</th>
              <th className="px-3 py-2 text-left">Hours</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((b) => (
              <tr key={b.id} className="odd:bg-white even:bg-neutral-50">
                <td className="px-3 py-2">{b.name}</td>
                <td className="px-3 py-2">{b.address}</td>
                <td className="px-3 py-2">{b.openingHours}</td>
                <td className="px-3 py-2 text-right">
                  <button className="mr-2 rounded border px-3 py-1" onClick={() => { setEditId(b.id); setForm(b); }}>Edit</button>
                  <button className="rounded border border-rose-300 bg-rose-50 px-3 py-1 text-rose-900" onClick={() => remove(b.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

