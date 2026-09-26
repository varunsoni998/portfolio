import { useRef, useState } from "react";
import AIToolLayout from "@/components/AIToolLayout";
import DemoBadge from "@/components/DemoBadge";
import { getToolBySlug } from "@/data/aiLabTools";
import { AI_LAB_CONFIG } from "@/data/aiLabConfig";
import { scanBusinessCard, buildVCard, AiLabError, type BusinessCardResult } from "@/services/aiLab";

const tool = getToolBySlug("business-card")!;

const FIELD_LABELS: { key: keyof BusinessCardResult; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "company", label: "Company" },
  { key: "jobTitle", label: "Job Title" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "website", label: "Website" },
  { key: "address", label: "Address" },
];

type State = "idle" | "scanning" | "completed" | "error";

export default function BusinessCardScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<BusinessCardResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(f: File | null) {
    if (!f) return;
    const sizeMb = f.size / (1024 * 1024);
    if (sizeMb > AI_LAB_CONFIG.MAX_IMAGE_SIZE_MB) {
      setError(`File is too large. Max ${AI_LAB_CONFIG.MAX_IMAGE_SIZE_MB} MB.`);
      return;
    }
    setError(null);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setResult(null);
    setState("idle");
  }

  async function handleScan() {
    if (!file) return;
    setState("scanning");
    setError(null);
    try {
      const res = await scanBusinessCard(file);
      setResult(res);
      setState("completed");
    } catch (err) {
      setError(err instanceof AiLabError ? err.message : "Something went wrong. Please try again.");
      setState("error");
    }
  }

  function contactText(r: BusinessCardResult) {
    return FIELD_LABELS.map(({ key, label }) => (r[key] ? `${label}: ${r[key]}` : null))
      .filter(Boolean)
      .join("\n");
  }

  function downloadVCard(r: BusinessCardResult) {
    const blob = new Blob([buildVCard(r)], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.name?.replace(/\s+/g, "-") || "contact"}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AIToolLayout tool={tool}>
      <div className="max-w-2xl">
        <label className="micro-label" htmlFor="card-upload">
          Upload a business card
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-border-2 bg-surface-2 px-5 py-6">
          <input
            ref={inputRef}
            id="card-upload"
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
          <button type="button" onClick={() => inputRef.current?.click()} className="btn-secondary">
            Choose Image
          </button>
          {file ? (
            <span className="text-sm text-muted">{file.name}</span>
          ) : (
            <span className="text-sm text-muted-2">No image selected. Max {AI_LAB_CONFIG.MAX_IMAGE_SIZE_MB} MB.</span>
          )}
        </div>

        {previewUrl && (
          <div className="mt-4 flex items-center gap-4">
            <img src={previewUrl} alt="Business card preview" className="h-24 w-auto rounded-xl border border-border object-cover" />
            <button type="button" onClick={handleScan} disabled={state === "scanning"} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
              {state === "scanning" ? "Scanning…" : "Scan"}
            </button>
          </div>
        )}

        {error && <p className="mt-4 rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>}

        {state === "completed" && result && (
          <div className="mt-8 animate-fade-in rounded-2xl border border-border bg-surface-2 p-6">
            <div className="flex items-center justify-between">
              <p className="micro-label">Extracted Contact</p>
              {result.isDemo && <DemoBadge />}
            </div>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {FIELD_LABELS.map(({ key, label }) =>
                result[key] ? (
                  <div key={key}>
                    <dt className="micro-label">{label}</dt>
                    <dd className="mt-0.5 text-sm text-text">{result[key]}</dd>
                  </div>
                ) : null
              )}
            </dl>
            <div className="mt-6 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(contactText(result));
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="font-mono text-xs uppercase tracking-[0.1em] text-accent hover:underline"
              >
                {copied ? "Copied" : "Copy Contact"}
              </button>
              <button
                type="button"
                onClick={() => downloadVCard(result)}
                className="font-mono text-xs uppercase tracking-[0.1em] text-accent hover:underline"
              >
                Download Contact (.vcf)
              </button>
            </div>
          </div>
        )}
      </div>
    </AIToolLayout>
  );
}
