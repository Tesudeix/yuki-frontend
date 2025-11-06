"use client";

import React from "react";
import Image from "next/image";

export default function RemoveBgPage() {
  const ENV_NB_KEY = process.env.NEXT_PUBLIC_NB_API_KEY || "";
  const ENV_NB_ENDPOINT = process.env.NEXT_PUBLIC_NB_ENDPOINT || "";
  const provider = "nanobanana" as const;

  const [status, setStatus] = React.useState<string>("");
  const [inputPreview, setInputPreview] = React.useState<string>("");
  const [resultUrl, setResultUrl] = React.useState<string>("");
  const [backendUrl, setBackendUrl] = React.useState<string>("");
  const [apiKey, setApiKey] = React.useState<string>(ENV_NB_KEY);
  const product = "kettle";
  const [nbUrl, setNbUrl] = React.useState<string>(ENV_NB_ENDPOINT);
  const [remember, setRemember] = React.useState<boolean>(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("nanobanana_api_key") || "";
      if (!ENV_NB_KEY && saved) { setApiKey(saved); setRemember(true); }
    } catch {}
  }, [ENV_NB_KEY]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setInputPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setInputPreview(url);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Processing...");
    setResultUrl("");
    setBackendUrl("");

    const form = e.currentTarget;
    const input = form.elements.namedItem("image") as HTMLInputElement | null;
    if (!input || !input.files || input.files.length === 0) {
      setStatus("Please choose an image.");
      return;
    }

    const data = new FormData();
    data.append("image", input.files[0]);
    if (apiKey) data.append("apiKey", apiKey);
    data.append("provider", provider);
    data.append("product", product || "kettle");
    if (nbUrl) data.append("nbUrl", nbUrl);

    try {
      const res = await fetch(`/api-proxy/image/remove-background`, { method: "POST", body: data });
      const text = await res.text();
      let json: unknown = undefined;
      try { json = text ? JSON.parse(text) : undefined; } catch {}
      const payload = (json && typeof json === "object" ? (json as Record<string, unknown>) : undefined) || undefined;
      if (!res.ok || !(payload?.success as boolean | undefined)) {
        const errMsg = (payload?.error as string | undefined) || (payload?.message as string | undefined) || `Failed (${res.status})`;
        setStatus(errMsg);
        return;
      }
      const raw = String((payload?.downloadUrl as string | undefined) || (payload?.file as string | undefined) || "");
      try {
        const u = new URL(raw, window.location.origin);
        setResultUrl(u.pathname);
      } catch {
        setResultUrl(raw);
      }
      if (payload?.downloadUrl && typeof payload.downloadUrl === "string") setBackendUrl(String(payload.downloadUrl));
      setStatus("Done.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      setStatus(msg);
    }
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: 900 }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>Remove Background</h1>
      <form onSubmit={onSubmit} encType="multipart/form-data">
        <input type="file" name="image" accept="image/*" onChange={onFileChange} required />
        <div style={{ marginTop: 12, fontSize: 14, color: "#555" }}>Provider: Nano Banana (fixed)</div>
        {!ENV_NB_ENDPOINT && (
          <div style={{ marginTop: 12 }}>
            <input
              type="text"
              placeholder="Nano Banana Endpoint (full URL)"
              value={nbUrl}
              onChange={(e) => setNbUrl(e.target.value)}
              style={{ width: "100%", maxWidth: 520, padding: "0.5rem", border: "1px solid #ddd", borderRadius: 6 }}
            />
          </div>
        )}
        {/* Product field kept for future providers; hidden by default */}
        <div style={{ marginTop: 12 }}>
          {!ENV_NB_KEY && (
            <>
              <input
                type="password"
                placeholder="Nano Banana API Key"
                value={apiKey}
                onChange={(e) => {
                  const v = e.target.value;
                  setApiKey(v);
                  try { if (remember) localStorage.setItem("nanobanana_api_key", v); } catch {}
                }}
                style={{ width: "100%", maxWidth: 420, padding: "0.5rem", border: "1px solid #ddd", borderRadius: 6 }}
              />
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setRemember(checked);
                    try {
                      if (checked) localStorage.setItem("nanobanana_api_key", apiKey || "");
                      else localStorage.removeItem("nanobanana_api_key");
                    } catch {}
                  }}
                />
                Remember API key (stores locally in this browser)
              </label>
            </>
          )}
        </div>
        <div style={{ marginTop: "1rem" }}>
          <button type="submit" style={{ padding: "0.5rem 1rem" }}>Extract Product (Nano Banana)</button>
          <button type="button" onClick={() => { setResultUrl(""); setStatus(""); }} style={{ padding: "0.5rem 1rem", marginLeft: 8 }}>Reset</button>
        </div>
      </form>

      {status && <p style={{ marginTop: "1rem", color: status.toLowerCase().includes("fail") || status.toLowerCase().includes("error") ? "#b00020" : undefined }}>{status}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Input</div>
          {inputPreview ? (
            <Image src={inputPreview} alt="input" width={600} height={400} style={{ width: "100%", height: "auto" }} unoptimized />
          ) : (
            <div style={{ color: "#666" }}>No image selected.</div>
          )}
        </div>
        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 8 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Result</div>
          {resultUrl ? (
            <>
              <a href={resultUrl} target="_blank" rel="noreferrer">
                <Image src={resultUrl} alt="result" width={600} height={400} style={{ width: "100%", height: "auto" }} unoptimized />
              </a>
              {backendUrl && backendUrl !== resultUrl && (
                <div style={{ marginTop: 8, fontSize: "0.9rem" }}>
                  Backend link: <a href={backendUrl} target="_blank" rel="noreferrer">{backendUrl}</a>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: "#666" }}>No result yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
