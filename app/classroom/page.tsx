"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { ADMIN_PHONE } from "@/lib/constants";
import { BASE_URL } from "@/lib/config";

type Lesson = {
  _id: string;
  url: string;
  title: string;
  description?: string;
  folder?: string;
  completed?: boolean;
  author?: { username?: string };
};

const ytIdFromUrl = (url: string) => {
  const re = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  return url.match(re)?.[1] || "";
};

export default function ClassroomPage() {
  const { user, token } = useAuthContext();
  const isAdmin = useMemo(
    () => Boolean((user?.phone && user.phone === ADMIN_PHONE) || (user as any)?.classroomAccess || user?.role === "admin"),
    [user],
  );

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // form state
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newFolder, setNewFolder] = useState("General");
  const [newDesc, setNewDesc] = useState("");

  const canSave = newUrl.trim() && newTitle.trim() && newFolder.trim();

  // Superadmin controls: grant classroom access by phone
  const isSuperAdmin = useMemo(() => Boolean(user?.phone && user.phone === ADMIN_PHONE), [user?.phone]);
  const [grantPhone, setGrantPhone] = useState("");
  const [grantBusy, setGrantBusy] = useState(false);
  const grantAccess = async (access: boolean) => {
    if (!isSuperAdmin || !token) return;
    setGrantBusy(true);
    try {
      const res = await fetch(`${BASE_URL}/users/admin/grant-classroom`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: grantPhone, access }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      alert("Updated classroom access");
    } catch (e) {
      alert(`Failed to update access: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setGrantBusy(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/lessons`, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Lesson[];
        const withFlags = (Array.isArray(data) ? data : []).map((l) => ({ ...l, completed: Boolean(l.completed) }));
        setLessons(withFlags);
        if (withFlags.length) setSelected(withFlags[0]);
      } catch {
        // graceful fallback content
        const sample: Lesson[] = [
          {
            _id: "sample-1",
            title: "Welcome to Classroom",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            description: "Sample lesson. Connect backend /api/lessons to manage real lessons.",
            folder: "General",
          },
        ];
        setLessons(sample);
        setSelected(sample[0]);
      }
    };
    run();
  }, []);

  const folders = useMemo(() => Array.from(new Set(lessons.map((l) => l.folder || "General"))), [lessons]);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({ General: true });

  const resetForm = () => {
    setEditing(null);
    setNewUrl("");
    setNewTitle("");
    setNewFolder("General");
    setNewDesc("");
  };

  const startEdit = (l: Lesson) => {
    setEditing(l);
    setNewUrl(l.url);
    setNewTitle(l.title);
    setNewFolder(l.folder || "General");
    setNewDesc(l.description || "");
  };

  const addLesson = async () => {
    if (!isAdmin || !token || !canSave) return;
    try {
      const res = await fetch(`${BASE_URL}/api/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: newUrl, title: newTitle, description: newDesc, folder: newFolder }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.error || `HTTP ${res.status}`);
      }
      const created = (await res.json()) as Lesson;
      setLessons((prev) => [...prev, created]);
      setSelected(created);
      resetForm();
    } catch (e) {
      alert(`Failed to add lesson: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const saveLesson = async () => {
    if (!isAdmin || !token || !editing || !canSave) return;
    try {
      const res = await fetch(`${BASE_URL}/api/lessons/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: newUrl, title: newTitle, description: newDesc, folder: newFolder }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.error || `HTTP ${res.status}`);
      }
      const updated = (await res.json()) as Lesson;
      setLessons((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
      setSelected((s) => (s && s._id === updated._id ? updated : s));
      resetForm();
    } catch (e) {
      alert(`Failed to save lesson: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const deleteLesson = async (id: string) => {
    if (!isAdmin || !token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/lessons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.error || `HTTP ${res.status}`);
      }
      setLessons((prev) => prev.filter((l) => l._id !== id));
      setSelected((s) => (s && s._id === id ? null : s));
      if (editing && editing._id === id) resetForm();
    } catch (e) {
      alert(`Failed to delete lesson: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-[300px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Хичээл</h2>
            <button
              className="rounded-md border border-neutral-800 px-2 py-1 text-xs hover:bg-neutral-900 md:hidden"
              onClick={() => setSidebarOpen((o) => !o)}
            >
              {sidebarOpen ? "Хаах" : "Нээх"}
            </button>
          </div>

          {isAdmin && (
            <div className="rounded-md border border-neutral-800 bg-neutral-950 p-3">
              <div className="grid gap-2">
                {isSuperAdmin && (
                  <div className="rounded-md border border-neutral-800 bg-neutral-900 p-3">
                    <div className="mb-2 text-sm font-medium">Хичээлийн эрх олгох</div>
                    <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                      <input
                        className="w-full rounded border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm outline-none focus:border-sky-500"
                        placeholder="Утас (жш: 94641031 эсвэл +97694641031)"
                        value={grantPhone}
                        onChange={(e) => setGrantPhone(e.target.value)}
                      />
                      <button
                        disabled={!grantPhone || grantBusy}
                        onClick={() => grantAccess(true)}
                        className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Олгох
                      </button>
                      <button
                        disabled={!grantPhone || grantBusy}
                        onClick={() => grantAccess(false)}
                        className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Цуцлах
                      </button>
                    </div>
                  </div>
                )}
                <input
                  className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  placeholder="YouTube холбоос"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
                <input
                  className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  placeholder="Хичээлийн гарчиг"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <input
                  className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  placeholder="Ангилал (жш, General)"
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                />
                <textarea
                  className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
                  placeholder="Товч тайлбар (заавал биш)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
                {canSave && (
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <img
                      src={`https://img.youtube.com/vi/${ytIdFromUrl(newUrl)}/hqdefault.jpg`}
                      alt="preview"
                      className="h-16 w-24 rounded object-cover"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium text-neutral-200">{newTitle}</div>
                      <div className="truncate text-neutral-400">{newDesc || "Тайлбар байхгүй"}</div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={!canSave}
                    onClick={editing ? saveLesson : addLesson}
                    className="rounded-md bg-[#1080CA] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {editing ? "Хадгалах" : "Нэмэх"}
                  </button>
                  {editing ? (
                    <button onClick={resetForm} className="rounded-md border border-neutral-700 px-3 py-2 text-sm">
                      Болих
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {folders.map((f) => (
              <div key={f} className="overflow-hidden rounded-md border border-neutral-800">
                <button
                  className="flex w-full items-center justify-between bg-neutral-950 px-3 py-2 text-left text-sm"
                  onClick={() => setOpenFolders((o) => ({ ...o, [f]: !o[f] }))}
                >
                  <span className="font-medium">{f}</span>
                  <span className="text-neutral-400">{openFolders[f] ? "−" : "+"}</span>
                </button>
                {openFolders[f] && (
                  <div className="divide-y divide-neutral-900">
                    {lessons
                      .filter((l) => (l.folder || "General") === f)
                      .map((l) => (
                        <div
                          key={l._id}
                          className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-neutral-900 ${
                            selected?._id === l._id ? "bg-neutral-900" : ""
                          }`}
                          onClick={() => setSelected(l)}
                        >
                          <span className="truncate">{l.title}</span>
                          {isAdmin && (
                            <span className="shrink-0 space-x-2">
                              <button
                                className="rounded border border-neutral-700 px-2 py-1 text-xs hover:bg-neutral-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(l);
                                }}
                              >
                                Засах
                              </button>
                              <button
                                className="rounded border border-red-700 px-2 py-1 text-xs text-red-400 hover:bg-red-950"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteLesson(l._id);
                                }}
                              >
                                Устгах
                              </button>
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <section className="min-h-[60vh]">
          {selected ? (
            <div className="space-y-4">
              <h1 className="text-xl font-semibold">{selected.title}</h1>
              <div className="w-full max-w-3xl">
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${ytIdFromUrl(selected.url)}`}
                    className="absolute left-0 top-0 h-full w-full rounded-md border border-neutral-800"
                    allowFullScreen
                  />
                </div>
              </div>
              {selected.description && (
                <p className="max-w-3xl text-sm text-neutral-300">{selected.description}</p>
              )}
              {selected.author?.username && (
                <p className="text-xs text-neutral-500">By {selected.author.username}</p>
              )}
            </div>
          ) : (
            <div className="grid min-h-[40vh] place-items-center text-neutral-400">Select a lesson</div>
          )}
        </section>
      </div>
    </div>
  );
}
