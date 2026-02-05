"use client";
import React, { useRef, useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { BASE_URL } from "../../lib/config";
import type { Post } from "./FeedPostCard";

type Props = { onPost?: (post: Post) => void; initialCategory?: "General" | "News" | "Tools" | "Tasks" };

export default function PostInput({ onPost, initialCategory }: Props) {
  const { token, hydrated, user } = useAuthContext();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  // Keep category internal (hidden UI), default to initial or General
  const [category, setCategory] = useState<"General" | "News" | "Tools" | "Tasks">(initialCategory || "General");
  useEffect(() => { if (initialCategory) setCategory(initialCategory); }, [initialCategory]);

  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!imageFile) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const autoGrow = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => { autoGrow(); }, [content]);

  const submit = async () => {
    if (!hydrated || !token) return;
    if (!content.trim() && !imageFile) return;
    try {
      setPosting(true);
      const fd = new FormData();
      fd.append("content", content);
      fd.append("category", category);
      if (imageFile) fd.append("image", imageFile);
      const res = await fetch(`${BASE_URL}/api/posts`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (res.ok && data?.post) {
        setContent("");
        setImageFile(null);
        if (fileRef.current) fileRef.current.value = "";
        onPost?.(data.post);
      } else {
        console.warn("Create post failed", data);
      }
    } finally {
      setPosting(false);
    }
  };

  const avatarUrl = typeof user?.avatarUrl === "string" && user.avatarUrl ? user.avatarUrl : "";
  const initials = (user?.name || user?.phone || "U").toString().slice(0, 2).toUpperCase();

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="w-full rounded-2xl border border-white/10 bg-black/60 p-4 shadow-[0_12px_30px_-24px_rgba(20,0,255,0.35)] backdrop-blur flex gap-3">
      {/* Avatar (left) */}
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#1400FF] via-[#3522FF] to-[#050508] text-xs font-bold text-white">
          {initials}
        </div>
      )}

      {/* Composer (right) */}
      <div className="flex-1">
        <textarea
          ref={taRef}
          placeholder="Юу болж байна?"
          className="w-full bg-transparent text-white placeholder-neutral-500 outline-none resize-none"
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onInput={autoGrow}
        />

        {previewUrl && (
          <div className="relative mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="урьдчилж харах" className="max-h-64 w-auto rounded object-cover" />
            <button className="absolute top-1 right-1 rounded bg-black/60 px-2 text-white" type="button" onClick={() => setImageFile(null)}>×</button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <label className="cursor-pointer text-sm text-neutral-400 hover:text-white">
            Зураг нэмэх
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
          </label>

          <button
            type="submit"
            disabled={posting || (!content.trim() && !imageFile)}
            className="rounded-full bg-[#1400FF] px-5 py-2 font-semibold text-white shadow-[0_6px_18px_-10px_rgba(20,0,255,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-12px_rgba(20,0,255,0.7)] disabled:opacity-50"
          >
            Нийтлэх
          </button>
        </div>
      </div>
    </form>
  );
}
