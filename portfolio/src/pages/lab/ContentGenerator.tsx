import { useState } from "react";
import AIToolLayout from "@/components/AIToolLayout";
import DemoBadge from "@/components/DemoBadge";
import { getToolBySlug } from "@/data/aiLabTools";
import { generateContent, AiLabError, type ContentType, type ContentGenerationResult } from "@/services/aiLab";

const tool = getToolBySlug("content")!;

const CONTENT_TYPES: ContentType[] = [
  "LinkedIn Post",
  "Instagram Caption",
  "Product Description",
  "Ad Copy",
  "Email",
  "Blog Outline",
];
const TONES = ["Professional", "Casual", "Persuasive", "Friendly"];
const LENGTHS = ["Short", "Medium", "Long"];

export default function ContentGenerator() {
  const [type, setType] = useState<ContentType>(CONTENT_TYPES[0]);
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [length, setLength] = useState(LENGTHS[0]);
  const [instructions, setInstructions] = useState("");
  const [result, setResult] = useState<ContentGenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generateContent({ type, topic: topic.trim(), tone, length, instructions: instructions.trim() || undefined });
      setResult(res);
    } catch (err) {
      setError(err instanceof AiLabError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AIToolLayout tool={tool}>
      <div className="grid max-w-3xl gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-5">
          <div>
            <p className="micro-label">Content Type</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CONTENT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-[11px] ${
                    type === t ? "border-accent text-accent" : "border-border-2 text-muted"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="topic" className="micro-label">
              Topic
            </label>
            <input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Launching a new feature"
              className="mt-2 w-full rounded-2xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-text outline-none focus:border-accent"
            />
          </div>

          <div className="flex gap-6">
            <div>
              <p className="micro-label">Tone</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTone(t)}
                    className={`rounded-full border px-3 py-1.5 font-mono text-[11px] ${
                      tone === t ? "border-accent text-accent" : "border-border-2 text-muted"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="micro-label">Length</p>
            <div className="mt-2 flex gap-2">
              {LENGTHS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLength(l)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-[11px] ${
                    length === l ? "border-accent text-accent" : "border-border-2 text-muted"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="instructions" className="micro-label">
              Additional Instructions (optional)
            </label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              className="mt-2 w-full resize-none rounded-2xl border border-border bg-surface-2 px-4 py-2.5 text-sm text-text outline-none focus:border-accent"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="btn-primary self-start disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating…" : result ? "Regenerate" : "Generate"}
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="micro-label">Output</p>
            {result?.isDemo && <DemoBadge />}
          </div>

          <div className="mt-2 min-h-[14rem] rounded-2xl border border-border bg-surface-2 p-5">
            {error && <p className="text-sm text-danger">{error}</p>}
            {!error && !result && !loading && <p className="text-sm text-muted-2">Generated content will appear here.</p>}
            {loading && (
              <div className="flex items-center gap-2 text-muted-2">
                <span className="h-1.5 w-1.5 animate-pulse-node rounded-full bg-accent" aria-hidden="true" />
                <span className="font-mono text-xs uppercase tracking-[0.1em]">Generating…</span>
              </div>
            )}
            {result && !loading && <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">{result.content}</p>}
          </div>

          {result && (
            <div className="mt-4 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(result.content);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="font-mono text-xs uppercase tracking-[0.1em] text-accent hover:underline"
              >
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="font-mono text-xs uppercase tracking-[0.1em] text-muted-2 hover:text-accent"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
    </AIToolLayout>
  );
}
