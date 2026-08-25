export type ToolInfra = "LOCAL GPU" | "API POWERED";

export interface AiLabTool {
  slug: string; // used in the route, e.g. "image" -> /lab/image
  path: string;
  title: string;
  shortDescription: string; // used in cards / previews
  description: string; // used on the tool's own page
  infra: ToolInfra;
  /** Whether the tool actually does something right now (even in mock mode).
   *  false means the page shows an honest "coming soon" state — never a
   *  faked result. See PDF below: faking RAG is explicitly not allowed. */
  available: boolean;
  architecture: { label: string; detail?: string }[];
  featuredOnHome: boolean;
}

export const aiLabTools: AiLabTool[] = [
  {
    slug: "image",
    path: "/lab/image",
    title: "AI Image Generator",
    shortDescription: "Generate images using my locally hosted AI generation server.",
    description:
      "Generate images using my locally hosted AI generation server. Requests never touch the generation machine directly — everything routes through a backend service.",
    infra: "LOCAL GPU",
    available: true,
    architecture: [
      { label: "User", detail: "Prompt submitted here" },
      { label: "My Backend", detail: "Auth, queueing, validation" },
      { label: "ComfyUI", detail: "Workflow execution" },
      { label: "Local GPU", detail: "Inference" },
      { label: "Image", detail: "Returned to the browser" },
    ],
    featuredOnHome: true,
  },
  {
    slug: "video",
    path: "/lab/video",
    title: "AI Video Generator",
    shortDescription: "Generate short AI videos using my locally hosted ComfyUI workflows.",
    description:
      "Generate short AI videos using my locally hosted ComfyUI workflows. Video generation runs as an asynchronous job — submit a prompt, then poll for status rather than holding a request open.",
    infra: "LOCAL GPU",
    available: true,
    architecture: [
      { label: "User", detail: "Prompt + optional image" },
      { label: "My Backend", detail: "Creates a job" },
      { label: "Job Queue", detail: "Async processing" },
      { label: "ComfyUI", detail: "Workflow execution" },
      { label: "Local GPU", detail: "Inference" },
      { label: "Video", detail: "Polled until complete" },
    ],
    featuredOnHome: true,
  },
  {
    slug: "chat",
    path: "/lab/chat",
    title: "AI Chat",
    shortDescription: "Chat with an AI assistant powered by an external LLM API.",
    description:
      "Chat with an AI assistant powered by an external LLM API (OpenRouter on the backend — the model can change without a frontend change). The API key never reaches the browser.",
    infra: "API POWERED",
    available: true,
    architecture: [
      { label: "User", detail: "Sends a message" },
      { label: "My Backend", detail: "Holds the API key" },
      { label: "OpenRouter", detail: "Routes to an LLM" },
      { label: "My Backend", detail: "Returns the response" },
      { label: "User", detail: "Sees the reply" },
    ],
    featuredOnHome: true,
  },
  {
    slug: "pdf",
    path: "/lab/pdf",
    title: "Chat With PDF",
    shortDescription: "Upload a document and ask questions about its contents.",
    description:
      "Upload a document and ask questions about its contents, grounded in the document via retrieval — not the model guessing. This one isn't wired to a real backend yet, so it's honestly marked as coming soon rather than faking an answer.",
    infra: "API POWERED",
    available: false,
    architecture: [
      { label: "PDF", detail: "Uploaded document" },
      { label: "Text Extraction", detail: "Parse to plain text" },
      { label: "Chunking", detail: "Split into passages" },
      { label: "Embeddings", detail: "Vectorize each chunk" },
      { label: "Vector Search", detail: "Find relevant passages" },
      { label: "LLM", detail: "Answer grounded in context" },
    ],
    featuredOnHome: true,
  },
  {
    slug: "business-card",
    path: "/lab/business-card",
    title: "Business Card Scanner",
    shortDescription: "Extract structured contact information from a business card.",
    description:
      "Extract structured contact information — name, company, title, phone, email, website, address — from a photo of a business card, and export it as a .vcf contact.",
    infra: "API POWERED",
    available: true,
    architecture: [
      { label: "Business Card", detail: "Photo or scan" },
      { label: "OCR / Vision", detail: "Field extraction" },
      { label: "Structured JSON", detail: "Normalized fields" },
      { label: "Contact", detail: "Copy or download .vcf" },
    ],
    featuredOnHome: true,
  },
  {
    slug: "content",
    path: "/lab/content",
    title: "AI Content Generator",
    shortDescription: "Generate useful marketing and business content with AI.",
    description:
      "Generate marketing and business copy — LinkedIn posts, captions, product descriptions, ad copy, emails, blog outlines — from a topic, tone, and length.",
    infra: "API POWERED",
    available: true,
    architecture: [
      { label: "User", detail: "Topic, tone, length" },
      { label: "My Backend", detail: "Holds the API key" },
      { label: "OpenRouter", detail: "Routes to an LLM" },
      { label: "Response", detail: "Returned to the browser" },
    ],
    featuredOnHome: false,
  },
];

// To add "Resume Analyzer" (optional 7th tool) later: add an entry here
// with slug "resume", create src/pages/lab/ResumeAnalyzer.tsx following
// the same pattern as the other tool pages, add its route in src/App.tsx,
// and add its service functions to src/services/aiLab.ts. The lab grid,
// homepage preview, and SEO all read from this array automatically —
// no other changes needed.

export function getToolBySlug(slug: string | undefined) {
  return aiLabTools.find((t) => t.slug === slug);
}
