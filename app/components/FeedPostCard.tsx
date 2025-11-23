"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { MdiCamera, MdiDotsHorizontal } from "@/app/components/icons";
import { useAuthContext } from "@/contexts/auth-context";
import { BASE_URL, UPLOADS_URL } from "../../lib/config";
import { ADMIN_PHONE } from "@/lib/constants";

type User = { _id?: string; id?: string; name?: string; phone?: string; avatarUrl?: string };
type Reply = { _id: string; user?: User; content: string };
type Comment = { _id: string; user?: User; content: string; replies?: Reply[] };
export type Post = {
  _id: string;
  user?: User;
  content: string;
  image?: string;
  category?: "General" | "News" | "Tools" | "Tasks";
  likes: (string | User)[];
  comments?: Comment[];
  shares?: number;
  createdAt: string;
  sharedFrom?: Post;
};

type Props = {
  post: Post;
  onDelete?: (id: string) => void;
  onShareAdd?: (p: Post) => void;
};

const getUserId = (u: unknown): string => {
  if (!u || typeof u !== "object") return "";
  const obj = u as Record<string, unknown>;
  const id = obj.id;
  const _id = obj._id;
  if (typeof id === "string") return id;
  if (typeof _id === "string") return _id;
  return "";
};

export default function FeedPostCard({ post, onDelete, onShareAdd }: Props) {
  const { token, user } = useAuthContext();
  const [state, setState] = useState<Post>(post);
  const [openComments, setOpenComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [shared, setShared] = useState(false);

  const display = state.sharedFrom || state;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const moreBtnRef = useRef<HTMLButtonElement | null>(null);
  const currentUserId = getUserId(user);

  const likeCount = state.likes?.length || 0;
  const commentCount = state.comments?.length || 0;
  const shareCount = state.shares || 0;

  const ownerId = getUserId(state.user);
  const isOwner = ownerId && currentUserId && ownerId === currentUserId;

  const isSuperAdmin = (user?.phone && user.phone === ADMIN_PHONE) || false;

  const hasLiked = useMemo(() => {
    const me = currentUserId;
    if (!me) return false;
    return (state.likes || []).some((l: string | User) => (typeof l === "string" ? l === me : getUserId(l) === me));
  }, [currentUserId, state.likes]);

  const handleLike = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${state._id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data?.likes) setState((p) => ({ ...p, likes: data.likes }));
    } catch (err) {
      console.warn("Like error", err);
    }
  };

  const handleComment = async () => {
    if (!token || !commentText.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${state._id}/comment`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      });
      const data = await res.json();
      if (res.ok && data?.comments) {
        setState((p) => ({ ...p, comments: data.comments }));
        setCommentText("");
      }
    } catch (err) {
      console.warn("Comment error", err);
    }
  };

  const handleReply = async (commentId: string) => {
    const text = replyTexts[commentId];
    if (!token || !text?.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${state._id}/comment/${commentId}/reply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (res.ok && data?.comments) {
        setState((p) => ({ ...p, comments: data.comments }));
        setReplyTexts((prev) => ({ ...prev, [commentId]: "" }));
      }
    } catch (err) {
      console.warn("Reply error", err);
    }
  };

  const handleShare = async () => {
    if (!token || shared) return;
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${state._id}/share`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setShared(true);
        if (typeof data?.shares === "number") setState((p) => ({ ...p, shares: data.shares }));
        if (data?.newPost) onShareAdd?.(data.newPost);
      }
    } catch (err) {
      console.warn("Share error", err);
    }
  };

  // edit disabled in current UI

  const handleDelete = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${state._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onDelete?.(state._id);
    } catch (err) {
      console.warn("Delete error", err);
    }
  };

  const letter = (state.user?.name || state.user?.phone || "U").slice(0, 1).toUpperCase();

  const formatUtc = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getUTCFullYear();
    const mm = pad(d.getUTCMonth() + 1);
    const dd = pad(d.getUTCDate());
    const hh = pad(d.getUTCHours());
    const mi = pad(d.getUTCMinutes());
    const ss = pad(d.getUTCSeconds());
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} UTC`;
  };

  const username = (state.user?.name || state.user?.phone || "user").toString().slice(-6);
  const timeAgo = (iso: string) => {
    const d = new Date(iso).getTime();
    const s = Math.max(0, Math.floor((Date.now() - d) / 1000));
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const days = Math.floor(h / 24);
    return `${days}d`;
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!menuOpen) return;
      const target = e.target as Node | null;
      if (menuRef.current && target && !menuRef.current.contains(target) && moreBtnRef.current && !moreBtnRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const handleReport = () => {
    setMenuOpen(false);
    alert("Reported. Thanks for the feedback.");
  };

  return (
    <article className="relative w-full border-b border-neutral-800 py-5 mb-6 transition-all duration-200">
      <header className="flex items-start gap-3">
        {/* Avatar */}
        {state.user?.avatarUrl ? (
          <Image
            src={state.user.avatarUrl as string}
            alt="avatar"
            width={40}
            height={40}
            className="rounded-full object-cover"
            unoptimized
          />
        ) : (
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-semibold text-white">
            {letter}
          </div>
        )}

        <div className="flex-1">
          {/* Name + actions */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-white leading-none">{state.user?.name || state.user?.phone || "User"}</p>
              <p className="text-[13px] text-neutral-500">@{username} · {timeAgo(state.createdAt)}</p>
            </div>
            <button
              ref={moreBtnRef}
              className="text-neutral-500 hover:text-white transition"
              aria-label="More"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MdiDotsHorizontal className="h-5 w-5" />
            </button>

            {menuOpen && (
              <div
                ref={menuRef}
                role="menu"
                className="absolute right-0 z-20 mt-8 w-40 overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 py-1 text-sm shadow-xl"
              >
                {(isSuperAdmin || isOwner) && (
                  <button
                    className="block w-full px-3 py-2 text-left text-red-400 hover:bg-neutral-800"
                    onClick={() => { setMenuOpen(false); handleDelete(); }}
                  >
                    Устгах
                  </button>
                )}
                <button
                  className="block w-full px-3 py-2 text-left text-neutral-200 hover:bg-neutral-800"
                  onClick={handleReport}
                >
                  Report
                </button>
              </div>
            )}
          </div>

          {/* Text */}
          {display.content && (
            <p className="mt-2 whitespace-pre-line text-[15px] leading-6 text-white">{display.content}</p>
          )}

          {/* Images */}
          {display.image && (
          <div className="mt-3 grid grid-cols-1 gap-2">
            <div className="aspect-square w-full overflow-hidden rounded-xl">
              <Image
                src={`${UPLOADS_URL}/${display.image}`}
                alt="post image"
                width={600}
                height={600}
                className="h-full w-full object-cover"
                unoptimized
              />
            </div>
          </div>
        )}

          {/* Actions */}
          <div className="mt-3 flex items-center gap-6 text-[15px] text-neutral-500">
            <button onClick={handleLike} className={`group flex items-center gap-1 transition ${hasLiked ? "text-red-400" : "hover:text-white"}`}>
              {/* invert to make dark SVG visible on dark bg */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/heart.svg" alt="like" className={`h-5 w-5 invert ${hasLiked ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`} />
              <span>Like {likeCount ? `(${likeCount})` : ""}</span>
            </button>
            <button onClick={() => setOpenComments((o) => !o)} className="group flex items-center gap-1 hover:text-white transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/comment.svg" alt="reply" className="h-5 w-5 invert opacity-60 group-hover:opacity-100" />
              <span>Reply {commentCount ? `(${commentCount})` : ""}</span>
            </button>
            <button onClick={handleShare} className={`group flex items-center gap-1 hover:text-white transition ${shared ? "text-blue-400" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/share.svg" alt="repost" className="h-5 w-5 invert opacity-60 group-hover:opacity-100" />
              <span>Repost {shareCount ? `(${shareCount})` : ""}</span>
            </button>
            <button className="group flex items-center gap-1 hover:text-white transition" onClick={() => { /* future share menu */ }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icons/share.svg" alt="share" className="h-5 w-5 invert opacity-60 group-hover:opacity-100" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      {openComments && (
        <section className="grid gap-2 pt-2">
          {(state.comments || []).map((c) => (
            <div key={c._id} className="text-sm">
              <div className="font-semibold">{c.user?.name || c.user?.phone || "User"}</div>
              <div className="text-[13px]">{c.content}</div>
              {(c.replies || []).map((r) => (
                <div key={r._id} className="ml-4 text-xs mt-1">
                  <div className="font-semibold">{r.user?.name || r.user?.phone || "User"}</div>
                  <div>{r.content}</div>
                </div>
              ))}
              <div className="mt-2 flex items-center gap-2">
                {/* small avatar placeholder */}
                <div className="h-6 w-6 rounded-full bg-neutral-800" />
                <div className="flex-1 rounded-full bg-[#1b1b1b] px-3 py-2 text-xs text-neutral-200 shadow-inner">
                  <input
                    value={replyTexts[c._id] || ""}
                    onChange={(e) => setReplyTexts((s) => ({ ...s, [c._id]: e.target.value }))}
                    className="w-full bg-transparent outline-none placeholder:text-neutral-500"
                    placeholder="Write a reply…"
                  />
                </div>
                <button className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white" onClick={() => handleReply(c._id)} aria-label="Send reply">
                  <MdiSend className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <div className="mt-1 flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-neutral-800" />
            <div className="flex-1 rounded-full bg-[#1b1b1b] px-3 py-2 text-sm text-neutral-200 shadow-inner">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full bg-transparent outline-none placeholder:text-neutral-500"
                placeholder="Write a comment…"
              />
            </div>
            <button className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white" onClick={handleComment} aria-label="Send comment">
              <MdiSend className="h-5 w-5" />
            </button>
          </div>
        </section>
      )}
      {/* Delete moved to more menu (hidden in main level) */}
    </article>
  );
}
