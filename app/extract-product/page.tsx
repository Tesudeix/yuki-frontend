"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Download, Image as ImageIcon, Loader2, Upload } from "lucide-react";

export default function
    HomePage() {
  // Simple invite-code gate for this agent page
  const ALLOWED_CODES = useMemo(() => ["1fs5", "vdf4"], []);
  const STORAGE_KEY = "yuki.invite.extractProduct";
  const [hasAccess, setHasAccess] = useState(false);
  const [invite, setInvite] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // query param support: ?invite=code
    const params = new URLSearchParams(window.location.search);
    const q = (params.get("invite") || "").trim().toLowerCase();
    const stored = (localStorage.getItem(STORAGE_KEY) || "").trim().toLowerCase();
    const candidate = q || stored;
    if (candidate && ALLOWED_CODES.includes(candidate)) {
      setHasAccess(true);
      localStorage.setItem(STORAGE_KEY, candidate);
    }
  }, [ALLOWED_CODES]);

  const tryEnter = () => {
    const code = invite.trim().toLowerCase();
    if (!/^[a-z0-9]{4}$/.test(code)) {
      setInviteError("4 тэмдэгтийн код оруулна уу");
      return;
    }
    if (!ALLOWED_CODES.includes(code)) {
      setInviteError("Код буруу байна");
      return;
    }
    setHasAccess(true);
    setInviteError(null);
    try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  };

  const [file, setFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [resultMimeType, setResultMimeType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOriginalImage(URL.createObjectURL(selectedFile));
      setProcessedImage(null);
      setResultMimeType(null);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setOriginalImage(URL.createObjectURL(droppedFile));
      setProcessedImage(null);
      setResultMimeType(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAccess) {
      setInviteError("Энэ агентыг ашиглахын тулд код шаардлагатай");
      return;
    }
    if (!file) {
      setError("Эхлээд зураг сонгоно уу");
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessedImage(null);
    setResultMimeType(null);

    const formData = new FormData();
    formData.append("image", file);
    try {
      const savedCode = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) || invite;
      if (savedCode) formData.append("inviteCode", savedCode);
    } catch {}

    try {
      const res = await fetch("/api/extract-product", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData: unknown = await res.json().catch(() => null);
        let message = "Ажиллагаа амжилтгүй боллоо";
        if (typeof errData === "object" && errData && "error" in errData) {
          const val = (errData as Record<string, unknown>).error;
          if (typeof val === "string") message = val;
        }
        throw new Error(message);
      }

      const data = await res.json();
      const mime = data.mimeType || "image/png";

      const newImageUrl = `data:${mime};base64,${data.base64}`;
      setProcessedImage(newImageUrl);
      setResultMimeType(mime);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Тодорхойгүй алдаа гарлаа.");
      } finally {
      setIsLoading(false);
    }
  };

  const resultExtension = useMemo(() => {
    if (!resultMimeType) return "png";
    if (resultMimeType.includes("png")) return "png";
    if (resultMimeType.includes("jpeg") || resultMimeType.includes("jpg")) return "jpg";
    if (resultMimeType.includes("webp")) return "webp";
    return "png";
  }, [resultMimeType]);

  const handleDownload = () => {
    if (!processedImage) return;
    const baseName = file?.name?.replace(/\.[^/.]+$/, "") || "image";
    const a = document.createElement("a");
    a.href = processedImage;
    a.download = `extracted-${baseName}.${resultExtension}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="relative mx-auto max-w-4xl px-4 py-10 text-white">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Бүтээгдэхүүн ялгах</h1>
        <p className="text-sm text-white">
          Бүтээгдэхүүний зургаа байршуулаад цэвэр дэвсгэр дээр тусгаарлаарай.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <label
          htmlFor="file"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="relative flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neutral-700/60 bg-black p-8 text-center transition-colors hover:border-neutral-500/80 hover:bg-black"
        >
          <input
            id="file"
            ref={inputRef}
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
            className="sr-only"
          />

          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-black p-3 text-white">
              <Upload size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">Дарж зураг байршуулах</p>
              <p className="text-xs text-white">эсвэл PNG/JPG чирж оруулна уу</p>
            </div>
          </div>

          {file && (
            <div className="mt-4 max-w-full truncate text-xs text-white">
              Сонгосон: <span className="text-white">{file.name}</span>
            </div>
          )}
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isLoading || !file}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: "#1080CA", boxShadow: "0 10px 24px -14px rgba(16,128,202,0.8)" }}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Боловсруулж байна
              </>
            ) : (
              <>
                <ImageIcon size={16} /> Бүтээгдэхүүн ялгах
              </>
            )}
          </button>

          {processedImage && (
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-black px-4 py-2 text-sm font-medium text-white transition hover:border-neutral-500"
            >
              <Download size={16} /> Татах
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="mt-6 rounded-lg border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {originalImage && (
          <div className="rounded-xl border border-neutral-800 bg-black p-4">
            <h3 className="mb-3 text-sm font-medium text-white">Эх зураг</h3>
            <div className="overflow-hidden rounded-lg bg-black">
              <div className="relative h-[360px] w-full">
                <Image
                  src={originalImage}
                  alt="Эх зураг"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-neutral-800 bg-black p-4">
          <h3 className="mb-3 text-sm font-medium text-white">Үр дүн</h3>
          <div className="relative overflow-hidden rounded-lg bg-black">
            {isLoading && (
              <div className="absolute inset-0 z-10 grid place-items-center bg-black">
                <Loader2 className="animate-spin text-white" size={24} />
              </div>
            )}
            {processedImage ? (
              <div className="relative h-[360px] w-full">
                <Image
                  src={processedImage}
                  alt="Боловсруулсан зураг"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div className="grid h-[360px] place-items-center text-neutral-400">
                <div className="flex items-center gap-2 text-sm">
                  <ImageIcon size={16} /> Одоогоор зураг алга
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Invite modal overlay */}
      {!hasAccess && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-950 p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-white">Invite код шаардлагатай</h2>
            <p className="mt-1 text-sm text-neutral-300">Зөвшөөрөгдсөн 4 тэмдэгтийн код оруулна уу.</p>
            <div className="mt-4 grid gap-3">
              <input
                type="text"
                inputMode="text"
                pattern="[A-Za-z0-9]{4}"
                maxLength={4}
                value={invite}
                onChange={(e) => {
                  setInvite(e.target.value.replace(/\s+/g, "").slice(0, 4));
                  setInviteError(null);
                }}
                placeholder="____"
                className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-center text-lg tracking-[0.3em] outline-none focus:border-sky-500"
              />
              {inviteError && (
                <div className="text-xs text-rose-400">{inviteError}</div>
              )}
              <button
                type="button"
                onClick={tryEnter}
                className="rounded-md bg-[#1080CA] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Үргэлжлүүлэх
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
