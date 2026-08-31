/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STELLAR_NETWORK: string;
  readonly VITE_STELLAR_NETWORK_PASSPHRASE: string;
  readonly VITE_HORIZON_URL: string;
  readonly VITE_SOROBAN_RPC_URL: string;
  readonly VITE_FRIENDBOT_URL: string;
  readonly VITE_EXPLORER_BASE_URL: string;
  readonly VITE_CONTRACT_ID: string;
  readonly VITE_PLAUSIBLE_DOMAIN: string;
  readonly VITE_SENTRY_DSN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
