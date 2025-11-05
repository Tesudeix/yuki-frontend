"use client";

import React from "react";

export default function ExtractProductPage() {
  const [apiKey, setApiKey] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const [product, setProduct] = React.useState("kettle");
  const [nbUrl, setNbUrl] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [inputPreview, setInputPreview] = React.useState("");
  const [resultUrl, setResultUrl] = React.useState("");
  const [backendUrl, setBackendUrl] = React.useState("");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("nanobanana_api_key");
      if (saved) { setApiKey(saved); setRemember(true); }
    } catch {}
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { setInputPreview(""); return; }
    setInputPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Processing...");
    setResultUrl("");
    setBackendUrl("");
    const form = e.currentTarget;
    const input = form.elements.namedItem("image") as HTMLInputElement | null;
    if (!input || !input.files || input.files.length === 0) { setStatus("Please choose an image."); return; }
    const data = new FormData();
    data.append("image", input.files[0]);
    if (apiKey) data.append("apiKey", apiKey);
    data.append("product", product || "kettle");
    data.append("provider", "nanobanana");
    if (nbUrl) data.append("nbUrl", nbUrl);
    try {
      const res = await fetch("/api-proxy/ai/extract-product", { method: "POST", body: data });
      const text = await res.text();
      let json: any; try { json = text ? JSON.parse(text) : undefined; } catch {}
      if (!res.ok || !json?.success) { setStatus(json?.error || `Failed (${res.status})`); return; }
      const raw = String(json.downloadUrl || json.file || "");
      try { const u = new URL(raw, window.location.origin); setResultUrl(u.pathname); } catch { setResultUrl(raw); }
      if (json.downloadUrl) setBackendUrl(String(json.downloadUrl));
      setStatus("Done.");
    } catch (err: any) { setStatus(err?.message || "Request failed"); }
  };

  return (
    <div style={{ padding: 16, maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Extract Product to Pure White</h1>
      <div style={{ marginBottom: 8, fontSize: 14, color: "#555" }}>Provider: Nano Banana (fixed)</div>
      <form onSubmit={onSubmit} encType="multipart/form-data">
        <input type="file" name="image" accept="image/*" onChange={onFileChange} required />
        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="Product (e.g., kettle)"
            style={{ padding: 8, border: "1px solid #ddd", borderRadius: 6, minWidth: 220 }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <input
            type="text"
            value={nbUrl}
            onChange={(e) => setNbUrl(e.target.value)}
            placeholder="Nano Banana Endpoint (full URL)"
            style={{ width: "100%", maxWidth: 420, padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => { const v = e.target.value; setApiKey(v); try { if (remember) localStorage.setItem("nanobanana_api_key", v); } catch {} }}
            placeholder={"Nano Banana API Key"}
            style={{ width: "100%", maxWidth: 420, padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
          />
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <input type="checkbox" checked={remember} onChange={(e) => { const c = e.target.checked; setRemember(c); try { if (c) localStorage.setItem("nanobanana_api_key", apiKey || ""); else localStorage.removeItem("nanobanana_api_key"); } catch {} }} />
            Remember API key (browser localStorage)
          </label>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" style={{ padding: "8px 14px" }}>Extract Product (Nano Banana)</button>
        </div>
      </form>

      {status && <p style={{ marginTop: 10, color: status.toLowerCase().includes("fail") || status.toLowerCase().includes("error") ? "#b00020" : undefined }}>{status}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div style={{ border: "1px solid #eee", borderRadius: 6, padding: 10 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Input</div>
          {inputPreview ? <img src={inputPreview} alt="input" style={{ maxWidth: "100%", height: "auto" }} /> : <div style={{ color: "#666" }}>No image selected.</div>}
        </div>
        <div style={{ border: "1px solid #eee", borderRadius: 6, padding: 10 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Result</div>
          {resultUrl ? (
            <>
              <a href={resultUrl} target="_blank" rel="noreferrer"><img src={resultUrl} alt="result" style={{ maxWidth: "100%", height: "auto" }} /></a>
              {backendUrl && backendUrl !== resultUrl && (
                <div style={{ marginTop: 8, fontSize: 13 }}>Backend link: <a href={backendUrl} target="_blank" rel="noreferrer">{backendUrl}</a></div>
              )}
            </>
          ) : <div style={{ color: "#666" }}>No result yet.</div>}
        </div>
      </div>
    </div>
  );
}
