import { useState, useRef, useEffect } from "react";
import type { FormEvent } from "react";
import AIToolLayout from "@/components/AIToolLayout";
import DemoBadge from "@/components/DemoBadge";
import { getToolBySlug } from "@/data/aiLabTools";
import { AI_LAB_CONFIG } from "@/data/aiLabConfig";
import { generateVideo, getVideoStatus, getGenerationServerStatus, AiLabError, type VideoJob, type GpuStatus } from "@/services/aiLab";

const tool = getToolBySlug("video")!;
const ASPECT_RATIOS = ["16:9", "9:16", "1:1"];

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [duration, setDuration] = useState(4);
  const [job, setJob] = useState<VideoJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gpuStatus, setGpuStatus] = useState<GpuStatus>("CHECKING");
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getGenerationServerStatus().then(setGpuStatus);
  }, []);

  function stopPolling() {
    if (pollRef.current) clearTimeout(pollRef.current);
  }

  async function poll(jobId: string) {
    try {
      const status = await getVideoStatus(jobId);
      setJob(status);
      if (status.status === "QUEUED" || status.status === "GENERATING") {
        pollRef.current = setTimeout(() => poll(jobId), 1200);
      }
    } catch (err) {
      setError(err instanceof AiLabError ? err.message : "Something went wrong. Please try again.");
      setJob((j) => (j ? { ...j, status: "ERROR" } : j));
    }
  }

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    stopPolling();
    setError(null);
    setJob(null);
    try {
      const { jobId } = await generateVideo(prompt.trim(), { aspectRatio, durationSeconds: duration });
      setJob({ jobId, status: "QUEUED", isDemo: true });
      poll(jobId);
    } catch (err) {
      setError(err instanceof AiLabError ? err.message : "Something went wrong. Please try again.");
    }
  }

  const busy = job?.status === "QUEUED" || job?.status === "GENERATING";

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
        <label htmlFor="video-prompt" className="micro-label">
          Prompt
        </label>
        <textarea
          id="video-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, AI_LAB_CONFIG.MAX_PROMPT_LENGTH))}
          rows={3}
          placeholder="Slow pan across a quiet studio at dusk"
          className="mt-2 w-full resize-none rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm text-text outline-none focus:border-accent"
        />

        <div className="mt-4 flex flex-wrap gap-8">
          <div>
            <p className="micro-label">Aspect Ratio</p>
            <div className="mt-2 flex gap-2">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar}
                  type="button"
                  onClick={() => setAspectRatio(ar)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-xs ${
                    aspectRatio === ar ? "border-accent text-accent" : "border-border-2 text-muted"
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="duration" className="micro-label">
              Duration — {duration}s
            </label>
            <input
              id="duration"
              type="range"
              min={2}
              max={AI_LAB_CONFIG.MAX_VIDEO_DURATION_SECONDS}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-3 w-40 accent-[hsl(var(--accent))]"
            />
          </div>
        </div>

        <button type="submit" disabled={busy || !prompt.trim()} className="btn-primary mt-6 disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? "Working…" : "Generate"}
        </button>
      </form>

      <div className="mt-10 max-w-2xl">
        {!job && !error && <p className="text-sm text-muted-2">Result will appear here.</p>}

        {error && <p className="rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>}

        {job && job.status !== "ERROR" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span
                className={`h-1.5 w-1.5 rounded-full ${busy ? "animate-pulse-node bg-accent" : "bg-accent"}`}
                aria-hidden="true"
              />
              <span className="font-mono text-xs uppercase tracking-[0.1em] text-muted">{job.status}</span>
            </div>

            {busy && (
              <div className="flex aspect-video w-full max-w-md animate-pulse items-center justify-center rounded-2xl border border-border bg-surface-2">
                <p className="micro-label">{job.status === "QUEUED" ? "Queued…" : "Generating…"}</p>
              </div>
            )}

            {job.status === "COMPLETED" && (
              <div className="flex w-full max-w-md animate-fade-in flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-6">
                <p className="text-sm text-muted">
                  No demo video file is bundled with mock mode — in production this panel shows the
                  finished video with a download link.
                </p>
                {job.isDemo && <DemoBadge />}
              </div>
            )}
          </div>
        )}
      </div>
    </AIToolLayout>
  );
}
