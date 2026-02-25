/* eslint-disable no-restricted-globals */

import type { DomRefs } from '../shared/types';

const elementById = <TElement extends HTMLElement>(id: string): TElement => {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Required element is missing: #${id}`);
  }
  return element as TElement;
};

export const dom: DomRefs = {
  orgIdInput: elementById<HTMLInputElement>('orgId'),
  scopesInput: elementById<HTMLInputElement>('scopes'),
  googleClientIdInput: elementById<HTMLInputElement>('googleClientId'),
  googleSigninButton: elementById<HTMLDivElement>('google-signin-btn'),

  configToggle: elementById<HTMLButtonElement>('config-toggle'),
  configBody: elementById<HTMLDivElement>('config-body'),

  tabButtons: Array.from(
    document.querySelectorAll<HTMLButtonElement>('.tab-btn'),
  ),
  tabPanels: Array.from(
    document.querySelectorAll<HTMLDivElement>('.tab-panel'),
  ),

  idTokenForProofInput: elementById<HTMLTextAreaElement>(
    'input-id-token-for-proof',
  ),
  createIdentityProofButton: elementById<HTMLButtonElement>(
    'action-create-identity-proof',
  ),
  identityProofOutput: elementById<HTMLPreElement>('output-identity-proof'),

  identityProofForUserInput: elementById<HTMLTextAreaElement>(
    'input-identity-proof-for-user',
  ),
  createUserButton: elementById<HTMLButtonElement>('action-create-user'),
  userResultOutput: elementById<HTMLPreElement>('output-user-result'),

  idTokenForSessionInput: elementById<HTMLTextAreaElement>(
    'input-id-token-for-session',
  ),
  createSessionButton: elementById<HTMLButtonElement>('action-create-session'),
  sessionTokenOutput: elementById<HTMLPreElement>('output-session-token'),

  runFullFlowButton: elementById<HTMLButtonElement>('action-run-full-flow'),
  fullFlowResultOutput: elementById<HTMLPreElement>('output-full-flow-result'),

  idTokenOutput: elementById<HTMLPreElement>('output-id-token'),

  logContainer: elementById<HTMLDivElement>('log'),
  logClearButton: elementById<HTMLButtonElement>('log-clear-btn'),
};
