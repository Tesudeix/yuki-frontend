"use client";
import React, { useRef, useState, useEffect } from "react";
import { useAuthContext } from "@/contexts/auth-context";
import { BASE_URL } from "@/lib/config";

type Props = { onPost?: (post: any) => void };

export default function PostInput({ onPost }: Props) {
  const { token, hydrated } = useAuthContext();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!imageFile) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const submit = async () => {
    if (!hydrated || !token) return;
    if (!content.trim() && !imageFile) return;
    try {
      setPosting(true);
      const fd = new FormData();
      fd.append("content", content);
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

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="grid gap-2 bg-[#111111] p-4 rounded">
      <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
      <textarea
        placeholder="What's happening?"
        className="w-full p-2 rounded bg-[#1b1b1b] text-white"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
      />
      {previewUrl && (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="preview" className="rounded max-h-64 object-cover" />
          <button className="absolute top-1 right-1 bg-black/60 text-white rounded px-2" type="button" onClick={() => setImageFile(null)}>×</button>
        </div>
      )}
      <div className="flex items-center gap-2 justify-end">
        <button type="button" className="px-3 py-1 border rounded" onClick={() => fileRef.current?.click()}>Add image</button>
        <button type="submit" disabled={posting || (!content.trim() && !imageFile)} className="px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50">Post</button>
      </div>
    </form>
  );
}

