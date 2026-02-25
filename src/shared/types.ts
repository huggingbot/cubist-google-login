/* eslint-disable no-restricted-globals */

import type { Scope } from '@cubist-labs/cubesigner-sdk';
import type { ProviderRegistrationPayload } from '@metamask/mfa-wallet-recovery';

export type LogLevel = 'info' | 'success' | 'error';

export type AppConfig = {
  orgId: string;
  scopes: Scope[];
  googleClientId: string;
};

export type FlowMode = 'manual' | 'fullFlow';

export type SessionExchangeResult = {
  orgId: string;
  sessionId: string;
  sessionToken: string;
  refreshToken: string;
  authTokenExp: number | null;
  refreshTokenExp: number | null;
  sessionExp: number | null;
};

export type AppState = {
  pendingGoogleFlow: FlowMode | null;
};

export type DomRefs = {
  orgIdInput: HTMLInputElement;
  scopesInput: HTMLInputElement;
  googleClientIdInput: HTMLInputElement;
  googleSigninButton: HTMLDivElement;

  configToggle: HTMLButtonElement;
  configBody: HTMLDivElement;

  tabButtons: HTMLButtonElement[];
  tabPanels: HTMLDivElement[];

  // Tab 2: Identity Proof
  idTokenForProofInput: HTMLTextAreaElement;
  createIdentityProofButton: HTMLButtonElement;
  identityProofOutput: HTMLPreElement;

  // Tab 3: Create User
  identityProofForUserInput: HTMLTextAreaElement;
  createUserButton: HTMLButtonElement;
  userResultOutput: HTMLPreElement;

  // Tab 4: Session Token
  idTokenForSessionInput: HTMLTextAreaElement;
  createSessionButton: HTMLButtonElement;
  sessionTokenOutput: HTMLPreElement;

  // Tab 5: Full Flow
  runFullFlowButton: HTMLButtonElement;
  fullFlowResultOutput: HTMLPreElement;

  // Tab 1: Google Login
  idTokenOutput: HTMLPreElement;

  logContainer: HTMLDivElement;
  logClearButton: HTMLButtonElement;
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
          disableAutoSelect?: () => void;
        };
      };
    };
  }
}
