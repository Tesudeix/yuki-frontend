"use client";

import { useState } from "react";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOriginalImage(URL.createObjectURL(selectedFile));
      setProcessedImage(null); // Clear previous result
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessedImage(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/extract-product", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Something went wrong");
      }

      const data = await res.json();

      // Create a data URL (data:image/png;base64,...)
      const newImageUrl = `data:${data.mimeType};base64,${data.base64}`;
      setProcessedImage(newImageUrl);

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>Product Background Remover</h1>
        <p>Using Gemini 2.5 Flash Image (&quot;Nano Banana&quot;)</p>

        <form onSubmit={handleSubmit}>
          <input type="file" accept="image/png, image/jpeg" onChange={handleFileChange} />
          <button type="submit" disabled={isLoading || !file}>
            {isLoading ? "Processing..." : "Extract Product"}
          </button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          {originalImage && (
              <div>
                <h3>Original</h3>
                <img src={originalImage} alt="Original" style={{ maxWidth: "300px" }} />
              </div>
          )}
          {processedImage && (
              <div>
                <h3>Extracted (White Background)</h3>
                <img src={processedImage} alt="Processed" style={{ maxWidth: "300px", border: "1px solid #ccc" }} />
              </div>
          )}
        </div>
      </div>
  );
}
