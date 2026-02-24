/* eslint-disable no-restricted-globals */

import type {
  CubeSignerClient,
  Scope,
  SessionData,
} from '@cubist-labs/cubesigner-sdk';

export type LogLevel = 'info' | 'success' | 'error';

export type AppConfig = {
  orgId: string;
  scopes: Scope[];
  googleClientId: string;
};

export type AppState = {
  googleIdToken: string | null;
  sessionData: SessionData | null;
  client: CubeSignerClient | null;
};

export type DomRefs = {
  orgIdInput: HTMLInputElement;
  scopesInput: HTMLInputElement;
  googleClientIdInput: HTMLInputElement;
  googleSigninButton: HTMLDivElement;
  sessionStatus: HTMLDivElement;
  keysOutput: HTMLPreElement;
  logContainer: HTMLDivElement;
  keyIdInput: HTMLInputElement;
  metadataPayloadInput: HTMLTextAreaElement;
  importKeyTypeSelect: HTMLSelectElement;
  importSecretHexInput: HTMLInputElement;
  getUserButton: HTMLButtonElement;
  listKeysButton: HTMLButtonElement;
  getKeyButton: HTMLButtonElement;
  getMetadataButton: HTMLButtonElement;
  setMetadataButton: HTMLButtonElement;
  clearMetadataButton: HTMLButtonElement;
  disableKeyButton: HTMLButtonElement;
  deleteKeyButton: HTMLButtonElement;
  importSecretButton: HTMLButtonElement;
  initExportButton: HTMLButtonElement;
  getExportStatusButton: HTMLButtonElement;
  completeExportButton: HTMLButtonElement;
  cancelExportButton: HTMLButtonElement;
  manualIdentityProofInput: HTMLTextAreaElement;
  manualIdentityProofSubmitButton: HTMLButtonElement;
};

export type KeySummary = {
  keyId: string;
  materialId: string;
  keyType: string;
  enabled: boolean;
  owner: string | undefined;
  metadata: unknown;
};

export type OidcPayload = {
  iss?: unknown;
  sub?: unknown;
  email?: unknown;
  name?: unknown;
  aud?: unknown;
  iat?: unknown;
  exp?: unknown;
};

/* eslint-disable @typescript-eslint/naming-convention */
export type GoogleCredentialResponse = {
  credential: string;
  select_by: string;
};

export type GoogleIdConfig = {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  itp_support?: boolean;
};

export type GoogleButtonConfig = {
  theme?: string;
  size?: string;
  text?: string;
  shape?: string;
  width?: number;
};
/* eslint-enable @typescript-eslint/naming-convention */

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleIdConfig) => void;
          renderButton: (
            parent: HTMLElement,
            config: GoogleButtonConfig,
          ) => void;
        };
      };
    };
  }
}
