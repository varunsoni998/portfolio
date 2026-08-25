import { useState, useRef, useEffect, Fragment } from "react";
import type { FormEvent } from "react";
import AIToolLayout from "@/components/AIToolLayout";
import DemoBadge from "@/components/DemoBadge";
import { getToolBySlug } from "@/data/aiLabTools";
import { AI_LAB_CONFIG } from "@/data/aiLabConfig";
import { sendChatMessage, AiLabError, type ChatMessage } from "@/services/aiLab";

const tool = getToolBySlug("chat")!;

/** Minimal, dependency-free rendering for ```code blocks``` and `inline code` — enough for demo chat output. */
function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const code = part.replace(/^```\w*\n?/, "").replace(/```$/, "");
          return <CodeBlock key={i} code={code} />;
        }
        return (
          <span key={i} className="whitespace-pre-wrap">
            {part.split(/(`[^`]+`)/g).map((seg, j) =>
              seg.startsWith("`") && seg.endsWith("`") ? (
                <code key={j} className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[13px]">
                  {seg.slice(1, -1)}
                </code>
              ) : (
                <Fragment key={j}>{seg}</Fragment>
              )
            )}
          </span>
        );
      })}
    </>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-2 overflow-hidden rounded-xl border border-border">
      <div className="flex items-center justify-between border-b border-border bg-surface-2 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-2">Code</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="font-mono text-[10px] uppercase tracking-[0.1em] text-accent hover:underline"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-2 font-mono text-[13px] text-text">{code}</pre>
    </div>
  );
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastWasDemo, setLastWasDemo] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await sendChatMessage(next);
      setMessages([...next, res.message]);
      setLastWasDemo(res.isDemo);
    } catch (err) {
      setError(err instanceof AiLabError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AIToolLayout tool={tool}>
      <div className="flex max-w-2xl flex-col">
        <div className="flex items-center justify-between">
          {lastWasDemo && messages.length > 0 ? <DemoBadge /> : <span />}
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setMessages([]);
                setError(null);
              }}
              className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-2 hover:text-accent"
            >
              Clear conversation
            </button>
          )}
        </div>

        <div className="mt-4 flex max-h-[28rem] min-h-[10rem] flex-col gap-4 overflow-y-auto rounded-2xl border border-border bg-surface-2 p-5">
          {messages.length === 0 && <p className="text-sm text-muted-2">Ask something to get started.</p>}
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
              <span className="micro-label mb-1">{m.role === "user" ? "You" : "Assistant"}</span>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user" ? "bg-text text-surface" : "border border-border bg-surface text-text"
                }`}
              >
                <MessageContent content={m.content} />
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-muted-2">
              <span className="h-1.5 w-1.5 animate-pulse-node rounded-full bg-accent" aria-hidden="true" />
              <span className="font-mono text-xs uppercase tracking-[0.1em]">Thinking…</span>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {error && <p className="mt-3 rounded-2xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>}

        <form onSubmit={handleSend} className="mt-4 flex gap-3">
          <input
            value={input}
            onChange={(e) => e.target.value.length <= AI_LAB_CONFIG.MAX_PROMPT_LENGTH && setInput(e.target.value)}
            placeholder="Ask something…"
            className="flex-1 rounded-full border border-border bg-surface-2 px-4 py-2.5 text-sm text-text outline-none focus:border-accent"
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
            Send
          </button>
        </form>
      </div>
    </AIToolLayout>
  );
}
