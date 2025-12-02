"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { apiRequest, isSuccess } from "@/lib/api-client";

type Branch = { id: string; name: string };
type Service = { id: string; name: string; durationMinutes: number; price?: number | null; branchIds: string[] };

export default function ServicesAdminPage() {
  const router = useRouter();
  const { adminToken, hydrated } = useAuthContext();
  const headers = useMemo(() => (adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined), [adminToken]);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [items, setItems] = useState<Service[]>([]);
  const [form, setForm] = useState<Partial<Service>>({ name: "", durationMinutes: 60, price: null, branchIds: [] });
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!adminToken) { router.replace("/salon-admin/login"); return; }
    void Promise.all([loadBranches(), load()]);
  }, [adminToken, hydrated, router]);

  const loadBranches = async () => {
    const res = await apiRequest<{ branches: Branch[] }>("/api/branches");
    if (isSuccess(res)) setBranches(res.branches || []);
  };
  const load = async () => {
    const res = await apiRequest<{ services: Service[] }>("/api/services");
    if (isSuccess(res)) setItems(res.services || []);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!headers) return;
    if (!form.name) { setError("Name required"); return; }
    if (editId) {
      const res = await apiRequest<{ service: Service }>(`/api/admin/services/${editId}`, { method: "PUT", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (isSuccess(res)) { setForm({ name: "", durationMinutes: 60, price: null, branchIds: [] }); setEditId(null); void load(); }
      else setError(res.error || "Update failed");
    } else {
      const res = await apiRequest<{ service: Service }>(`/api/admin/services`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (isSuccess(res)) { setForm({ name: "", durationMinutes: 60, price: null, branchIds: [] }); void load(); }
      else setError(res.error || "Create failed");
    }
  };

  const remove = async (id: string) => {
    if (!headers) return;
    const res = await apiRequest(`/api/admin/services/${id}`, { method: "DELETE", headers });
    if (isSuccess(res)) void load();
  };

  const toggleBranch = (id: string) => {
    setForm((f) => ({ ...f, branchIds: (f.branchIds || []).includes(id) ? (f.branchIds || []).filter((x) => x !== id) : [...(f.branchIds || []), id] }));
  };

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-xl font-semibold">Services</h1>

      {error && <div className="rounded border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">{error}</div>}

      <form onSubmit={submit} className="space-y-2 rounded border p-4">
        <input className="w-full rounded border px-3 py-2" placeholder="Name" value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <div className="flex gap-2">
          <input className="w-full rounded border px-3 py-2" placeholder="Duration (min)" type="number" value={form.durationMinutes || 60} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))} />
          <input className="w-full rounded border px-3 py-2" placeholder="Price (optional)" type="number" value={form.price ?? ""} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} />
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {branches.map((b) => {
            const selected = (form.branchIds || []).includes(b.id);
            return (
              <button key={b.id} type="button" className={`rounded-full border px-3 py-1 ${selected ? "border-black bg-black text-white" : "border-neutral-300"}`} onClick={() => toggleBranch(b.id)}>
                {b.name}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <button className="rounded bg-black px-4 py-2 text-white">{editId ? "Save" : "Add"}</button>
          {editId && <button type="button" className="rounded border px-4 py-2" onClick={() => { setEditId(null); setForm({ name: "", durationMinutes: 60, price: null, branchIds: [] }); }}>Cancel</button>}
        </div>
      </form>

      <div className="overflow-hidden rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Duration</th>
              <th className="px-3 py-2 text-left">Branches</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="odd:bg-white even:bg-neutral-50">
                <td className="px-3 py-2">{s.name}</td>
                <td className="px-3 py-2">{s.durationMinutes} min</td>
                <td className="px-3 py-2">{s.branchIds.length}</td>
                <td className="px-3 py-2 text-right">
                  <button className="mr-2 rounded border px-3 py-1" onClick={() => { setEditId(s.id); setForm(s); }}>Edit</button>
                  <button className="rounded border border-rose-300 bg-rose-50 px-3 py-1 text-rose-900" onClick={() => remove(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

