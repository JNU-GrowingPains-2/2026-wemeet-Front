/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_MOCK?: string;
  readonly VITE_MOCK_FAIL_RATE?: string;
  readonly VITE_SIGNUP_CLOSED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
