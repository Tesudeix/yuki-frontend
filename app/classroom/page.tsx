"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  type?: "youtube" | "file";
};

const ytIdFromUrl = (url: string) => {
  const re = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  return url.match(re)?.[1] || "";
};

export default function ClassroomPage() {
  const { user, token } = useAuthContext();
  const router = useRouter();
  // const isAdmin previously used for broader controls; now superadmin-only actions are enabled

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selected, setSelected] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // form state
  const [editing, setEditing] = useState<Lesson | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newFolder, setNewFolder] = useState("General");
  const [newDesc, setNewDesc] = useState("");
  const [mode, setMode] = useState<"youtube" | "file">("youtube");
  const [file, setFile] = useState<File | null>(null);

  const canSave = (mode === "youtube" ? Boolean(newUrl.trim()) : Boolean(file)) && Boolean(newTitle.trim()) && Boolean(newFolder.trim());

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
      type ApiError = { error?: unknown } & Record<string, unknown>;
      const data = (await res.json().catch(() => ({} as ApiError))) as ApiError;
      const message = typeof data.error === "string" ? data.error : undefined;
      if (!res.ok) throw new Error(message ?? `HTTP ${res.status}`);
      alert("Updated classroom access");
    } catch (e) {
      alert(`Failed to update access: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setGrantBusy(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/auth");
      return;
    }
    const run = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/lessons`, { cache: "no-store", headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401) {
          router.push("/auth");
          return;
        }
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
            type: "youtube",
          },
        ];
        setLessons(sample);
        setSelected(sample[0]);
      }
    };
    run();
  }, [router, token]);

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
    if (!isSuperAdmin || !token || !canSave) return;
    try {
      if (mode === "file") {
        if (!file) throw new Error("Select a video file");
        const form = new FormData();
        form.set("file", file);
        form.set("title", newTitle);
        form.set("description", newDesc);
        form.set("folder", newFolder);
        const res = await fetch(`${BASE_URL}/api/lessons/upload`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        if (!res.ok) {
          type ApiError = { error?: unknown } & Record<string, unknown>;
          const err = (await res.json().catch(() => ({} as ApiError))) as ApiError;
          const message = typeof err.error === "string" ? err.error : undefined;
          throw new Error(message ?? `HTTP ${res.status}`);
        }
        const created = (await res.json()) as Lesson;
        setLessons((prev) => [...prev, created]);
        setSelected(created);
        resetForm();
      } else {
        const res = await fetch(`${BASE_URL}/api/lessons`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ url: newUrl, title: newTitle, description: newDesc, folder: newFolder }),
        });
        if (!res.ok) {
          type ApiError = { error?: unknown } & Record<string, unknown>;
          const err = (await res.json().catch(() => ({} as ApiError))) as ApiError;
          const message = typeof err.error === "string" ? err.error : undefined;
          throw new Error(message ?? `HTTP ${res.status}`);
        }
        const created = (await res.json()) as Lesson;
        setLessons((prev) => [...prev, created]);
        setSelected(created);
        resetForm();
      }
    } catch (e) {
      alert(`Failed to add lesson: ${e instanceof Error ? e.message : "Unknown error"}`);
    }
  };

  const saveLesson = async () => {
    if (!isSuperAdmin || !token || !editing || !canSave) return;
    try {
      const res = await fetch(`${BASE_URL}/api/lessons/${editing._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: newUrl, title: newTitle, description: newDesc, folder: newFolder }),
      });
      if (!res.ok) {
        type ApiError = { error?: unknown } & Record<string, unknown>;
        const err = (await res.json().catch(() => ({} as ApiError))) as ApiError;
        const message = typeof err.error === "string" ? err.error : undefined;
        throw new Error(message ?? `HTTP ${res.status}`);
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
    if (!isSuperAdmin || !token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/lessons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        type ApiError = { error?: unknown } & Record<string, unknown>;
        const err = (await res.json().catch(() => ({} as ApiError))) as ApiError;
        const message = typeof err.error === "string" ? err.error : undefined;
        throw new Error(message ?? `HTTP ${res.status}`);
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
        {/* Paywall banner for non-members */}
        {!user?.classroomAccess && (
          <div className="md:col-span-2 rounded-md border border-[#0D81CA]/20 bg-[#0D81CA]/5 px-4 py-3 text-sm text-neutral-200">
            Classroom нь Clan гишүүдэд нээлттэй. <a href="/payment" className="ml-2 underline decoration-[#0D81CA] hover:text-white">Clan-д нэгдэх — ₮25,000</a>
          </div>
        )}
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

          {isSuperAdmin && (
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
                <div className="flex items-center gap-2 text-xs">
                  <button
                    className={`rounded px-2 py-1 ${mode === "youtube" ? "bg-[#1080CA] text-white" : "border border-neutral-700"}`}
                    onClick={() => setMode("youtube")}
                  >
                    YouTube
                  </button>
                  <button
                    className={`rounded px-2 py-1 ${mode === "file" ? "bg-[#1080CA] text-white" : "border border-neutral-700"}`}
                    onClick={() => setMode("file")}
                  >
                    Upload File
                  </button>
                </div>
                {mode === "youtube" ? (
                  <input
                    className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
                    placeholder="YouTube холбоос"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                ) : (
                  <input
                    className="w-full rounded border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
                    type="file"
                    accept="video/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                )}
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
                {canSave && mode === "youtube" && (
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <Image
                      src={`https://img.youtube.com/vi/${ytIdFromUrl(newUrl)}/hqdefault.jpg`}
                      alt="preview"
                      width={240}
                      height={160}
                      className="h-16 w-24 rounded object-cover"
                      unoptimized
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
                          {isSuperAdmin && (
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
                {selected.type === "file" || selected.url.includes("/api/lessons/") ? (
                  <video
                    src={`${selected.url}${selected.url.includes("?") ? "&" : "?"}token=${encodeURIComponent(token || "")}`}
                    className="h-auto w-full rounded-md border border-neutral-800"
                    controls
                    preload="metadata"
                  />
                ) : (
                  <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${ytIdFromUrl(selected.url)}`}
                      className="absolute left-0 top-0 h-full w-full rounded-md border border-neutral-800"
                      allowFullScreen
                    />
                  </div>
                )}
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
