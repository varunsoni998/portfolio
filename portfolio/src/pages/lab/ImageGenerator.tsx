import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import AIToolLayout from "@/components/AIToolLayout";
import DemoBadge from "@/components/DemoBadge";
import { getToolBySlug } from "@/data/aiLabTools";
import { AI_LAB_CONFIG } from "@/data/aiLabConfig";
import { generateImage, getGenerationServerStatus, AiLabError, type ImageGenerationResult, type GpuStatus } from "@/services/aiLab";

const tool = getToolBySlug("image")!;

type GenState = "idle" | "generating" | "completed" | "error";

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [state, setState] = useState<GenState>("idle");
  const [result, setResult] = useState<ImageGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gpuStatus, setGpuStatus] = useState<GpuStatus>("CHECKING");

  useEffect(() => {
    getGenerationServerStatus().then(setGpuStatus);
  }, []);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setState("generating");
    setError(null);
    try {
      const res = await generateImage(prompt.trim());
      setResult(res);
      setState("completed");
    } catch (err) {
      setError(err instanceof AiLabError ? err.message : "Something went wrong. Please try again.");
      setState("error");
    }
  }

  return (
    <AIToolLayout
      tool={tool}
      statusSlot={
        <span className="rounded-full border border-border-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          {gpuStatus}
        </span>
      }
    >
      <form onSubmit={handleGenerate} className="max-w-2xl">
        <label htmlFor="prompt" className="micro-label">
          Prompt
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, AI_LAB_CONFIG.MAX_PROMPT_LENGTH))}
          rows={3}
          placeholder="A quiet workshop, natural light, minimal composition"
          className="mt-2 w-full resize-none rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm text-text outline-none focus:border-accent"
        />
        <div className="mt-1 flex justify-end">
          <span className="font-mono text-[10px] text-muted-2">
            {prompt.length} / {AI_LAB_CONFIG.MAX_PROMPT_LENGTH}
          </span>
        </div>

        <button type="submit" disabled={state === "generating" || !prompt.trim()} className="btn-primary mt-4 disabled:cursor-not-allowed disabled:opacity-50">
          {state === "generating" ? "Generating…" : "Generate"}
        </button>
      </form>

      <div className="mt-10 max-w-2xl">
        {state === "idle" && <p className="text-sm text-muted-2">Result will appear here.</p>}

        {state === "generating" && (
          <div className="flex aspect-square w-full max-w-sm animate-pulse items-center justify-center rounded-2xl border border-border bg-surface-2">
            <p className="micro-label">Generating…</p>
          </div>
        )}

        {state === "error" && (
          <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>
        )}

        {state === "completed" && result && (
          <figure className="w-full max-w-sm animate-fade-in overflow-hidden rounded-2xl border border-border">
            <img src={result.imageUrl} alt={`Generated result for: ${prompt}`} className="w-full" />
            <figcaption className="flex items-center justify-between border-t border-border px-4 py-3">
              {result.isDemo ? <DemoBadge /> : <span />}
              <a
                href={result.imageUrl}
                download
                className="font-mono text-[11px] uppercase tracking-[0.1em] text-accent hover:underline"
              >
                Download
              </a>
            </figcaption>
          </figure>
        )}
      </div>
    </AIToolLayout>
  );
}
