/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_LAB_MOCK?: string;
  readonly VITE_AI_LAB_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
