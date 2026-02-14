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
  envSelect: elementById<HTMLSelectElement>('env'),
  scopesInput: elementById<HTMLInputElement>('scopes'),
  googleClientIdInput: elementById<HTMLInputElement>('googleClientId'),
  googleSigninButton: elementById<HTMLDivElement>('google-signin-btn'),
  sessionStatus: elementById<HTMLDivElement>('session-status'),
  keysOutput: elementById<HTMLPreElement>('keys-output'),
  logContainer: elementById<HTMLDivElement>('log'),
  keyIdInput: elementById<HTMLInputElement>('keyId'),
  metadataPayloadInput: elementById<HTMLTextAreaElement>('metadataPayload'),
  importKeyTypeSelect: elementById<HTMLSelectElement>('importKeyType'),
  importSecretHexInput: elementById<HTMLInputElement>('importSecretHex'),
  getUserButton: elementById<HTMLButtonElement>('action-get-user'),
  listKeysButton: elementById<HTMLButtonElement>('action-list-keys'),
  getKeyButton: elementById<HTMLButtonElement>('action-get-key'),
  getMetadataButton: elementById<HTMLButtonElement>('action-get-metadata'),
  setMetadataButton: elementById<HTMLButtonElement>('action-set-metadata'),
  clearMetadataButton: elementById<HTMLButtonElement>('action-clear-metadata'),
  disableKeyButton: elementById<HTMLButtonElement>('action-disable-key'),
  deleteKeyButton: elementById<HTMLButtonElement>('action-delete-key'),
  importSecretButton: elementById<HTMLButtonElement>('action-import-secret'),
  initExportButton: elementById<HTMLButtonElement>('action-init-export'),
  getExportStatusButton: elementById<HTMLButtonElement>('action-get-export-status'),
  completeExportButton: elementById<HTMLButtonElement>('action-complete-export'),
  cancelExportButton: elementById<HTMLButtonElement>('action-cancel-export'),
  manualTokenInput: elementById<HTMLTextAreaElement>('manualToken'),
  manualTokenLoginButton: elementById<HTMLButtonElement>('action-manual-token-login'),
};

export const actionButtons: HTMLButtonElement[] = [
  dom.getUserButton,
  dom.listKeysButton,
  dom.getKeyButton,
  dom.getMetadataButton,
  dom.setMetadataButton,
  dom.clearMetadataButton,
  dom.disableKeyButton,
  dom.deleteKeyButton,
  dom.importSecretButton,
  dom.initExportButton,
  dom.getExportStatusButton,
  dom.completeExportButton,
  dom.cancelExportButton,
];
