"use client";
import React, { useMemo, useState } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { BASE_URL, UPLOADS_URL } from "../../lib/config";

type User = { _id?: string; id?: string; name?: string; phone?: string };
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [shared, setShared] = useState(false);

  const display = state.sharedFrom || state;
  const ownerId = getUserId(state.user);
  const currentUserId = getUserId(user);

  const likeCount = state.likes?.length || 0;
  const commentCount = state.comments?.length || 0;
  const shareCount = state.shares || 0;

  const isOwner = useMemo(() => {
    if (!currentUserId || !ownerId) return false;
    return currentUserId === ownerId;
  }, [currentUserId, ownerId]);

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

  const handleEdit = async () => {
    if (!token) return;
    const next = window.prompt("Edit post", state.content);
    if (next === null) return;
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${state._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ content: next }),
      });
      const data = await res.json();
      if (res.ok && data?.post) {
        setState((p) => ({ ...p, content: data.post.content }));
        setMenuOpen(false);
      }
    } catch (err) {
      console.warn("Edit error", err);
    }
  };

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

  return (
    <article className="bg-[#111111] rounded-xl p-4 grid gap-3">
      <header className="grid grid-cols-[auto,1fr,auto] gap-3 items-start">
        <div className="w-10 h-10 rounded-md bg-neutral-800 text-white grid place-items-center text-sm font-semibold">
          {letter}
        </div>
        <div className="grid">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {state.user?.name || state.user?.phone || "User"}
            </span>
            <span className="text-xs text-neutral-400">
              {new Date(state.createdAt).toLocaleString()}
            </span>
          </div>
          {state.sharedFrom && (
            <div className="text-xs text-neutral-400">Shared from {state.sharedFrom.user?.name || state.sharedFrom.user?.phone}</div>
          )}
        </div>
        {isOwner && (
          <div className="relative">
            <button className="px-2 py-1 text-xs text-neutral-300" onClick={() => setMenuOpen((o) => !o)} aria-label="Post options">
              •••
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 bg-[#1b1b1b] border border-neutral-700 rounded-md shadow overflow-hidden">
                <button className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-700" onClick={handleEdit}>Edit</button>
                <button className="block w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-neutral-700" onClick={handleDelete}>Delete</button>
              </div>
            )}
          </div>
        )}
      </header>

      {display.content && (
        <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{display.content}</div>
      )}

      {display.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt="post"
          src={`${UPLOADS_URL}/${display.image}`}
          className="rounded-lg w-full h-auto object-cover"
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
                  placeholder="Reply..."
                />
                <button className="text-xs underline" onClick={() => handleReply(c._id)}>Reply</button>
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 p-2 bg-[#1b1b1b] rounded"
              placeholder="Add a comment..."
            />
            <button className="underline text-sm" onClick={handleComment}>Post</button>
          </div>
        </section>
      )}
    </article>
  );
}
