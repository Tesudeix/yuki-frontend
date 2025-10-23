"use client";

import React from "react";

export default function UploadPage() {
  const [status, setStatus] = React.useState<string>("");
  const [link, setLink] = React.useState<string>(""); // same-origin link (via Next rewrite)
  const [backendLink, setBackendLink] = React.useState<string>("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Uploading...");
    setLink("");
    setBackendLink("");

    const form = e.currentTarget;
    const input = form.elements.namedItem("file") as HTMLInputElement | null;
    if (!input || !input.files || input.files.length === 0) {
      setStatus("Please choose a file.");
      return;
    }

    const data = new FormData();
    data.append("file", input.files[0]);

    try {
      // Use Next.js rewrite proxy to backend to avoid CORS/env issues
      const res = await fetch(`/api-proxy/upload`, { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok || !json) {
        setStatus(`Upload failed (${res.status})`);
        return;
      }

      if ((json.success && json.downloadUrl) || json.downloadUrl) {
        setStatus("Uploaded successfully.");
        const raw = String(json.downloadUrl);
        try {
          const u = new URL(raw, window.location.origin);
          // Prefer same-origin path so it works on port 3000 via Next rewrite
          setLink(u.pathname);
        } catch {
          setLink(raw);
        }
        setBackendLink(raw);
      } else {
        setStatus(json.error || json.message || "Upload failed.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload error.";
      setStatus(message);
    }
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: 640 }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>Upload a File</h1>
      <form onSubmit={onSubmit} encType="multipart/form-data">
        <input type="file" name="file" required />
        <div style={{ marginTop: "1rem" }}>
          <button type="submit" style={{ padding: "0.5rem 1rem" }}>Upload</button>
        </div>
      </form>
      {status && <p style={{ marginTop: "1rem" }}>{status}</p>}
      {link && (
        <p style={{ marginTop: "0.5rem" }}>
          Direct download: <a href={link} target="_blank" rel="noreferrer">{link}</a>
        </p>
      )}
      {backendLink && backendLink !== link && (
        <p style={{ marginTop: "0.25rem", fontSize: "0.9rem", color: "#555" }}>
          Backend link: <a href={backendLink} target="_blank" rel="noreferrer">{backendLink}</a>
        </p>
      )}
    </div>
  );
}
