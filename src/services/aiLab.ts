/**
 * AI Lab service layer.
 *
 * Every AI Lab network call lives in this file — components never call
 * fetch() directly. Two things this buys:
 *
 * 1. The frontend never touches the real infrastructure. It always talks
 *    to `${AI_LAB_API_BASE}/api/ai/...` — a backend Varun controls. It
 *    never calls ComfyUI or OpenRouter directly, and never holds an
 *    OpenRouter API key, ComfyUI credentials, or any other secret. VITE_
 *    env variables are public (bundled into client JS), so only a public
 *    base URL belongs here — see .env.example.
 * 2. Swapping mock mode for a real backend is a one-flag change
 *    (VITE_AI_LAB_MOCK=false) — every function below already has the
 *    real-request shape ready to go; it's what mock mode is standing in
 *    for.
 */

import { AI_LAB_MOCK, AI_LAB_API_BASE } from "@/data/aiLabConfig";

export class AiLabError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "AiLabError";
  }
}

/** Maps HTTP failure codes to messages safe to show a visitor — never a raw server error. */
function friendlyErrorMessage(status: number): string {
  switch (status) {
    case 429:
      return "Usage limit reached. Please try again later.";
    case 413:
      return "File is too large.";
    case 408:
      return "The request timed out. Please try again.";
    case 500:
    default:
      return "Something went wrong. Please try again.";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${AI_LAB_API_BASE}${path}`, init);
  } catch {
    throw new AiLabError("Something went wrong. Please try again.");
  }
  if (!res.ok) {
    throw new AiLabError(friendlyErrorMessage(res.status), res.status);
  }
  return res.json() as Promise<T>;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export type GpuStatus = "GPU ONLINE" | "GPU OFFLINE" | "CHECKING";

/**
 * Reads real status only from a real health endpoint — never guesses.
 * In mock mode this reports ONLINE after a short delay, clearly a demo.
 */
export async function getGenerationServerStatus(): Promise<GpuStatus> {
  if (AI_LAB_MOCK) {
    await sleep(500);
    return "GPU ONLINE";
  }
  try {
    const res = await request<{ online: boolean }>("/api/ai/health");
    return res.online ? "GPU ONLINE" : "GPU OFFLINE";
  } catch {
    return "GPU OFFLINE";
  }
}

// ---------------------------------------------------------------------------
// Image generation
// ---------------------------------------------------------------------------

export interface ImageGenerationResult {
  imageUrl: string;
  isDemo: boolean;
}

export async function generateImage(prompt: string): Promise<ImageGenerationResult> {
  if (AI_LAB_MOCK) {
    await sleep(1800);
    return {
      // A neutral placeholder — never a real generated image in mock mode.
      imageUrl: `https://placehold.co/768x768/EFEBE1/6B4A32?text=Demo+Image`,
      isDemo: true,
    };
  }
  return request<ImageGenerationResult>("/api/ai/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
}

// ---------------------------------------------------------------------------
// Video generation (async job)
// ---------------------------------------------------------------------------

export type VideoJobStatus = "QUEUED" | "GENERATING" | "COMPLETED" | "ERROR";

export interface VideoJob {
  jobId: string;
  status: VideoJobStatus;
  videoUrl?: string;
  isDemo: boolean;
}

export async function generateVideo(
  prompt: string,
  options?: { aspectRatio?: string; durationSeconds?: number }
): Promise<{ jobId: string }> {
  if (AI_LAB_MOCK) {
    await sleep(400);
    return { jobId: `demo-${Date.now()}` };
  }
  return request<{ jobId: string }>("/api/ai/video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, ...options }),
  });
}

const mockVideoJobStart: Record<string, number> = {};

export async function getVideoStatus(jobId: string): Promise<VideoJob> {
  if (AI_LAB_MOCK) {
    const start = mockVideoJobStart[jobId] ?? (mockVideoJobStart[jobId] = Date.now());
    const elapsed = Date.now() - start;
    if (elapsed < 1500) return { jobId, status: "QUEUED", isDemo: true };
    if (elapsed < 4000) return { jobId, status: "GENERATING", isDemo: true };
    return {
      jobId,
      status: "COMPLETED",
      videoUrl: "", // no real demo video file is bundled — UI shows a labeled placeholder instead
      isDemo: true,
    };
  }
  return request<VideoJob>(`/api/ai/video/status/${jobId}`);
}

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  message: ChatMessage;
  isDemo: boolean;
}

export async function sendChatMessage(history: ChatMessage[]): Promise<ChatResponse> {
  if (AI_LAB_MOCK) {
    await sleep(900);
    return {
      message: {
        role: "assistant",
        content:
          "**Demo response.** In production this comes from an LLM via OpenRouter, called from the backend — the API key never reaches the browser. Ask me something once the real backend is connected.\n\n```txt\nmock mode: VITE_AI_LAB_MOCK=true\n```",
      },
      isDemo: true,
    };
  }
  return request<ChatResponse>("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history }),
  });
}

// ---------------------------------------------------------------------------
// Chat with PDF — intentionally NOT mocked with a fake answer. Faking RAG
// output would misrepresent a system that isn't built yet. Both functions
// below only run for real once a backend is connected.
// ---------------------------------------------------------------------------

export interface PdfUploadResult {
  documentId: string;
}

export async function uploadPdf(file: File): Promise<PdfUploadResult> {
  if (AI_LAB_MOCK) {
    throw new AiLabError("Backend integration coming soon.");
  }
  const form = new FormData();
  form.append("file", file);
  return request<PdfUploadResult>("/api/ai/pdf/upload", { method: "POST", body: form });
}

export interface PdfAnswer {
  answer: string;
  sources?: string[];
}

export async function askPdf(documentId: string, question: string): Promise<PdfAnswer> {
  if (AI_LAB_MOCK) {
    throw new AiLabError("Backend integration coming soon.");
  }
  return request<PdfAnswer>("/api/ai/pdf/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentId, question }),
  });
}

// ---------------------------------------------------------------------------
// Business card scanner
// ---------------------------------------------------------------------------

export interface BusinessCardResult {
  name?: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  isDemo: boolean;
}

export async function scanBusinessCard(file: File): Promise<BusinessCardResult> {
  if (AI_LAB_MOCK) {
    await sleep(1400);
    return {
      name: "Demo Contact",
      company: "Example Company",
      jobTitle: "Example Title",
      phone: "+1 555 0100",
      email: "demo@example.com",
      website: "example.com",
      address: "123 Demo Street",
      isDemo: true,
    };
  }
  const form = new FormData();
  form.append("file", file);
  return request<BusinessCardResult>("/api/ai/business-card", { method: "POST", body: form });
}

/** Builds a downloadable .vcf from an extracted contact — pure client-side, no service call needed. */
export function buildVCard(contact: BusinessCardResult): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    contact.name ? `FN:${contact.name}` : "",
    contact.company ? `ORG:${contact.company}` : "",
    contact.jobTitle ? `TITLE:${contact.jobTitle}` : "",
    contact.phone ? `TEL:${contact.phone}` : "",
    contact.email ? `EMAIL:${contact.email}` : "",
    contact.website ? `URL:${contact.website}` : "",
    contact.address ? `ADR:;;${contact.address};;;;` : "",
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Content generator
// ---------------------------------------------------------------------------

export type ContentType =
  | "LinkedIn Post"
  | "Instagram Caption"
  | "Product Description"
  | "Ad Copy"
  | "Email"
  | "Blog Outline";

export interface ContentGenerationInput {
  type: ContentType;
  topic: string;
  tone: string;
  length: string;
  instructions?: string;
}

export interface ContentGenerationResult {
  content: string;
  isDemo: boolean;
}

export async function generateContent(input: ContentGenerationInput): Promise<ContentGenerationResult> {
  if (AI_LAB_MOCK) {
    await sleep(1100);
    return {
      content: `Demo ${input.type.toLowerCase()} about "${input.topic}" (${input.tone}, ${input.length}).\n\nIn production this is generated by an LLM via the backend, using the topic, tone, and length you set above. This placeholder shows the shape of the result, not real generated copy.`,
      isDemo: true,
    };
  }
  return request<ContentGenerationResult>("/api/ai/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
