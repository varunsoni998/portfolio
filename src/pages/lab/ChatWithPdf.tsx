import { useRef, useState } from "react";
import AIToolLayout from "@/components/AIToolLayout";
import { getToolBySlug } from "@/data/aiLabTools";
import { AI_LAB_CONFIG } from "@/data/aiLabConfig";

const tool = getToolBySlug("pdf")!;

export default function ChatWithPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [tooLarge, setTooLarge] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File | null) {
    if (!f) return;
    const sizeMb = f.size / (1024 * 1024);
    if (sizeMb > AI_LAB_CONFIG.MAX_PDF_SIZE_MB) {
      setTooLarge(true);
      setFile(null);
      return;
    }
    setTooLarge(false);
    setFile(f);
  }

  return (
    <AIToolLayout tool={tool}>
      <div className="max-w-2xl">
        <label className="micro-label" htmlFor="pdf-upload">
          Upload a PDF
        </label>
        <div className="mt-2 flex items-center gap-4 rounded-2xl border border-dashed border-border-2 bg-surface-2 px-5 py-6">
          <input
            ref={inputRef}
            id="pdf-upload"
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary">
            Choose File
          </button>
          {file ? (
            <span className="text-sm text-muted">
              {file.name} — {(file.size / (1024 * 1024)).toFixed(1)} MB
            </span>
          ) : (
            <span className="text-sm text-muted-2">No file selected. Max {AI_LAB_CONFIG.MAX_PDF_SIZE_MB} MB.</span>
          )}
        </div>
        {tooLarge && (
          <p className="mt-2 text-sm text-danger">File is too large. Max {AI_LAB_CONFIG.MAX_PDF_SIZE_MB} MB.</p>
        )}

        <div className="mt-8 rounded-2xl border border-border bg-surface-2 px-6 py-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">Backend Integration Coming Soon</p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            This tool isn't wired to a real retrieval pipeline yet. Rather than fabricate an answer,
            it stays honest about that — the upload above works, but asking questions is disabled
            until the extraction, embedding, and vector-search backend described below actually
            exists.
          </p>
        </div>
      </div>
    </AIToolLayout>
  );
}
