"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
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
  const currentUserId = getUserId(user);

  const likeCount = state.likes?.length || 0;
  const commentCount = state.comments?.length || 0;
  const shareCount = state.shares || 0;

  // owner check not used in UI, but kept for future logic if needed

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

  return (
    <article className="bg-[#111111] rounded-xl p-4 grid gap-3 border border-neutral-800">
      <header className="grid grid-cols-[auto,1fr] gap-3 items-start">
        <div className="w-10 h-10 rounded-full overflow-hidden grid place-items-center bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white text-sm font-semibold">
          {state.user?.avatarUrl ? (
            <Image
              src={state.user.avatarUrl as string}
              alt="avatar"
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <span>{letter}</span>
          )}
        </div>
        <div className="grid">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {state.user?.name || state.user?.phone || "User"}
            </span>
            <span className="text-xs text-neutral-400">
              {formatUtc(state.createdAt)}
            </span>
          </div>
          {state.sharedFrom && (
            <div className="text-xs text-neutral-400">Хуваалцсан: {state.sharedFrom.user?.name || state.sharedFrom.user?.phone}</div>
          )}
        </div>
      </header>

      {display.content && (
        <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{display.content}</div>
      )}

      {display.image && (
        <Image
          alt="post"
          src={`${UPLOADS_URL}/${display.image}`}
          width={1200}
          height={675}
          className="rounded-lg w-full h-auto object-cover"
          unoptimized
        />
      )}

      <nav className="grid grid-cols-3 text-xs text-neutral-400 pt-1">
        <button onClick={handleLike} className={`flex items-center justify-center gap-1 hover:text-white ${hasLiked ? "text-red-400" : ""}`}>
          ❤ <span>{likeCount}</span>
        </button>
        <button onClick={() => setOpenComments((o) => !o)} className="flex items-center justify-center gap-1 hover:text-white">
          💬 <span>{commentCount}</span>
        </button>
        <button onClick={handleShare} className={`flex items-center justify-center gap-1 hover:text-white ${shared ? "text-blue-400" : ""}`}>
          ⤴ <span>{shareCount}</span>
        </button>
      </nav>

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
              <div className="flex gap-2 mt-2">
                <input
                  value={replyTexts[c._id] || ""}
                  onChange={(e) => setReplyTexts((s) => ({ ...s, [c._id]: e.target.value }))}
                  className="flex-1 p-1 bg-[#1b1b1b] rounded"
                  placeholder="Хариу бичих..."
                />
                <button className="text-xs underline" onClick={() => handleReply(c._id)}>Хариулах</button>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 p-2 bg-[#1b1b1b] rounded"
              placeholder="Сэтгэгдэл нэмэх..."
            />
            <button className="underline text-sm" onClick={handleComment}>Илгээх</button>
          </div>
        </section>
      )}
      {isSuperAdmin && (
        <div className="pt-2">
          <button
            onClick={handleDelete}
            className="rounded-md border border-red-700 px-3 py-1 text-xs text-red-400 hover:bg-red-950"
          >
            Постыг устгах
          </button>
        </div>
      )}
    </article>
  );
}
