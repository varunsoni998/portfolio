// Centralized AI Lab limits and config — read from here, never re-declared
// inline in a component. Bump these in one place if backend limits change.

export const AI_LAB_CONFIG = {
  MAX_PDF_SIZE_MB: 15,
  MAX_IMAGE_SIZE_MB: 8,
  MAX_VIDEO_DURATION_SECONDS: 8,
  MAX_PROMPT_LENGTH: 600,
} as const;

/**
 * When true, every function in src/services/aiLab.ts simulates a response
 * instead of calling a real backend — see .env.example. Every mock result
 * is labeled DEMO in the UI so it's never mistaken for a live result.
 */
export const AI_LAB_MOCK = import.meta.env.VITE_AI_LAB_MOCK !== "false";

/**
 * Public backend base URL — safe to expose (it's just where requests go).
 * Nothing secret belongs in a VITE_ variable; see src/services/aiLab.ts
 * header comment for why.
 */
export const AI_LAB_API_BASE = import.meta.env.VITE_AI_LAB_API_BASE ?? "";
