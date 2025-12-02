"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { apiRequest, isSuccess } from "@/lib/api-client";

type Branch = { id: string; name: string };
type Booking = { id: string; userId: string; branchId: string; serviceId?: string | null; date: string; timeStart: string; status: string };

export default function SalonAdminHome() {
  const router = useRouter();
  const { adminToken, hydrated } = useAuthContext();
  const headers = useMemo(() => (adminToken ? { Authorization: `Bearer ${adminToken}` } : undefined), [adminToken]);
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!adminToken) {
      router.replace("/salon-admin/login");
      return;
    }
    void fetchBranches();
  }, [adminToken, hydrated, router]);

  const fetchBookings = async () => {
    if (!headers) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.set("date", date);
    if (branchId) params.set("branchId", branchId);
    const res = await apiRequest<{ bookings: Booking[] }>(`/api/admin/bookings?${params.toString()}`, { headers });
    if (isSuccess(res)) setBookings(res.bookings || []);
    setLoading(false);
  };

  const fetchBookingsCb = useCallback(fetchBookings, [headers, date, branchId]);

  useEffect(() => { void fetchBookingsCb(); }, [fetchBookingsCb]);

  const fetchBranches = async () => {
    const res = await apiRequest<{ branches: Branch[] }>("/api/branches");
    if (isSuccess(res)) setBranches(res.branches || []);
  };

  // fetchBookings moved above and memoized as fetchBookingsCb

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-xl font-semibold">Today’s Overview</h1>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input type="date" className="rounded border px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
        <select className="rounded border px-3 py-2" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
          <option value="">All branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-3 text-sm text-neutral-600">Bookings: {bookings.length}</div>

      <div className="overflow-hidden rounded border">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-3 py-2 text-left">Time</th>
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Branch</th>
              <th className="px-3 py-2 text-left">Service</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {!loading && bookings.map((b) => (
              <tr key={b.id} className="odd:bg-white even:bg-neutral-50">
                <td className="px-3 py-2">{b.date} {b.timeStart}</td>
                <td className="px-3 py-2">{b.userId}</td>
                <td className="px-3 py-2">{b.branchId}</td>
                <td className="px-3 py-2">{b.serviceId || "-"}</td>
                <td className="px-3 py-2">{b.status}</td>
              </tr>
            ))}
            {loading && (
              <tr><td className="px-3 py-3" colSpan={5}>Loading...</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
