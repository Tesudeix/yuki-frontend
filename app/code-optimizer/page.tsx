"use client";

import React from "react";

export default function CodeOptimizerPage() {
  const [apiKey, setApiKey] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const [language, setLanguage] = React.useState("javascript");
  const [goals, setGoals] = React.useState("performance, readability, safety");
  const [code, setCode] = React.useState("// Paste your code here\nfunction add(a,b){return a+b}");
  const [status, setStatus] = React.useState("");
  const [optimized, setOptimized] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("openai_api_key");
      if (saved) {
        setApiKey(saved);
        setRemember(true);
      }
    } catch {}
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Optimizing...");
    setOptimized("");
    setNotes("");
    try {
      const res = await fetch("/api-proxy/ai/optimize-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, language, goals, code, model: "gpt-4o-mini" }),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        setStatus(json?.error || `Failed (${res.status})`);
        return;
      }
      setOptimized(json.optimizedCode || "");
      setNotes(json.notes || "");
      setStatus("Done.");
    } catch (err: any) {
      setStatus(err?.message || "Request failed");
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Optimize Code (OpenAI)</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="Language (e.g., javascript, python)"
            style={{ flex: 1, minWidth: 240, padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
          />
          <input
            type="text"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="Goals (e.g., performance, readability)"
            style={{ flex: 2, minWidth: 320, padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
          />
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={10}
          style={{ width: "100%", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", padding: 10, border: "1px solid #ddd", borderRadius: 6 }}
        />
        <div>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              const v = e.target.value;
              setApiKey(v);
              try { if (remember) localStorage.setItem("openai_api_key", v); } catch {}
            }}
            placeholder="OpenAI API Key (sk-... or sk-proj-...)"
            style={{ width: "100%", maxWidth: 460, padding: 8, border: "1px solid #ddd", borderRadius: 6 }}
          />
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => {
                const c = e.target.checked;
                setRemember(c);
                try {
                  if (c) localStorage.setItem("openai_api_key", apiKey || "");
                  else localStorage.removeItem("openai_api_key");
                } catch {}
              }}
            />
            Remember API key (browser localStorage)
          </label>
        </div>
        <div>
          <button type="submit" style={{ padding: "8px 14px" }}>Optimize Code</button>
        </div>
      </form>

      {status && (
        <p style={{ marginTop: 10, color: status.toLowerCase().includes("fail") || status.toLowerCase().includes("error") ? "#b00020" : undefined }}>{status}</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Optimized Code</div>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 10, borderRadius: 6, border: "1px solid #eee" }}>{optimized || "No output yet."}</pre>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Notes</div>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 10, borderRadius: 6, border: "1px solid #eee" }}>{notes || ""}</pre>
        </div>
      </div>
    </div>
  );
}

