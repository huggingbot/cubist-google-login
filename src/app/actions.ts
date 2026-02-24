import {
  userExportDecrypt,
  userExportKeygen,
} from '@cubist-labs/cubesigner-sdk';
import { KeyImporter } from '@cubist-labs/cubesigner-sdk-key-import';

import { appState, updateSessionUi } from './state';
import { readConfigFromDom } from '../config/config';
import { CUBESIGNER_ENV_NAME } from '../config/constants';
import {
  assertNoMfaRequired,
  createIdentityProofFromOidcToken,
  createSessionFromOidcToken,
  ensureClientSession,
  mapKeySummary,
  parseImportKeyType,
} from '../services/cubesigner';
import {
  ensureProviderUserFromIdentityProof,
  parseIdentityProofJson,
  registrationEnsureUserUrl,
} from '../services/registration';
import type { GoogleCredentialResponse } from '../shared/types';
import {
  decodeJwtPayload,
  hexToBytes,
  parseMetadataPayload,
  truncateLongStrings,
} from '../shared/utils';
import { dom } from '../ui/dom';
import {
  appendLog,
  appendLogJson,
  clearLog,
  renderKeysOutput,
} from '../ui/logger';

export type AppActions = {
  handleGoogleLogin: (
    credentialResponse: GoogleCredentialResponse,
  ) => Promise<void>;
  submitManualIdentityProofAction: () => Promise<void>;
  createManualSessionAction: () => Promise<void>;
  getCurrentUserAction: () => Promise<void>;
  listKeysAction: () => Promise<void>;
  getKeyAction: () => Promise<void>;
  getMetadataAction: () => Promise<void>;
  setMetadataAction: () => Promise<void>;
  clearMetadataAction: () => Promise<void>;
  disableKeyAction: () => Promise<void>;
  deleteKeyAction: () => Promise<void>;
  importSecretAction: () => Promise<void>;
  initExportAction: () => Promise<void>;
  getExportStatusAction: () => Promise<void>;
  completeExportAction: () => Promise<void>;
  cancelExportAction: () => Promise<void>;
};

const getActiveKeyId = (): string => {
  const keyId = dom.keyIdInput.value.trim();
  if (!keyId) {
    throw new Error('Provide an active key ID.');
  }
  return keyId;
};

const signInWithGoogleToken = async (idToken: string): Promise<void> => {
  const config = readConfigFromDom();
  appendLog(
    `Creating identity proof for ${config.orgId} on ${CUBESIGNER_ENV_NAME}...`,
  );

  appState.googleIdToken = idToken;
  appState.sessionSummary = null;
  appState.client = null;
  updateSessionUi();

  const identityProof = await createIdentityProofFromOidcToken(
    idToken,
    config,
  );
  appendLog('Identity proof created.', 'success');
  appendLogJson('Identity Proof', identityProof);

  appendLog(
    `Forwarding identity proof to registration service (${registrationEnsureUserUrl()})...`,
  );
  const registrationResponse =
    await ensureProviderUserFromIdentityProof(identityProof);
  appendLog('Registration service confirmed user provisioning.', 'success');
  appendLogJson('Registration Service Response', registrationResponse);

  appendLog(
    `Creating CubeSigner session for ${config.orgId} on ${CUBESIGNER_ENV_NAME}...`,
  );
  const { client, sessionSummary } = await createSessionFromOidcToken(
    idToken,
    config,
  );
  appState.sessionSummary = sessionSummary;
  appState.client = client;

  updateSessionUi();
  appendLog('CubeSigner session created.', 'success');

  appendLogJson('Session Metadata', {
    orgId: sessionSummary.orgId,
    sessionId: sessionSummary.sessionId,
    authTokenExp: sessionSummary.authTokenExp,
    sessionExp: sessionSummary.sessionExp,
  });
};

const handleGoogleLogin = async (
  credentialResponse: GoogleCredentialResponse,
): Promise<void> => {
  clearLog();

  const idToken = credentialResponse.credential;
  appendLog('Google sign-in succeeded. Decoding token...');

  const payload = decodeJwtPayload(idToken);
  appendLogJson('Google ID Token Payload', {
    iss: payload.iss,
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    aud: payload.aud,
    iat: payload.iat,
    exp: payload.exp,
  });

  appendLog('Raw ID Token (copy this to use on another origin):');
  appendLog(idToken);

  await signInWithGoogleToken(idToken);
};

const submitManualIdentityProofAction = async (): Promise<void> => {
  clearLog();
  appendLog('Using manually pasted identity proof JSON...');

  const identityProof = parseIdentityProofJson(dom.manualIdentityProofInput.value);
  appendLogJson('Identity Proof', identityProof);

  appendLog(
    `Forwarding identity proof to registration service (${registrationEnsureUserUrl()})...`,
  );
  const registrationResponse =
    await ensureProviderUserFromIdentityProof(identityProof);
  appendLog('Registration service confirmed user provisioning.', 'success');
  appendLogJson('Registration Service Response', registrationResponse);
  appendLog(
    'User provisioning complete. Use "Manual Session Exchange" to exchange OIDC token for a CubeSigner session.',
    'success',
  );
};

const createManualSessionAction = async (): Promise<void> => {
  clearLog();
  const config = readConfigFromDom();
  const idToken = dom.manualSessionTokenInput.value.trim();
  if (!idToken) {
    throw new Error('Paste an OIDC token first.');
  }

  appendLog('Using manually pasted OIDC token for session exchange...');

  appendLog(
    `Creating CubeSigner session for ${config.orgId} on ${CUBESIGNER_ENV_NAME} via MFA SDK...`,
  );
  const { client, sessionSummary } = await createSessionFromOidcToken(
    idToken,
    config,
  );
  appState.googleIdToken = idToken;
  appState.sessionSummary = sessionSummary;
  appState.client = client;
  updateSessionUi();
  appendLog('CubeSigner session created.', 'success');
  appendLogJson('Session Metadata', sessionSummary);
};

const getCurrentUserAction = async (): Promise<void> => {
  const user = await ensureClientSession(appState).user();
  appendLogJson('Current User', user);
};

const listKeysAction = async (): Promise<void> => {
  const keys = await ensureClientSession(appState).sessionKeys();
  const summaries = keys.map((key) => mapKeySummary(key));

  renderKeysOutput(summaries);
  appendLogJson('Accessible Keys / Shares', summaries);

  const firstSummary = summaries[0];
  if (firstSummary && !dom.keyIdInput.value.trim()) {
    dom.keyIdInput.value = firstSummary.keyId;
  }
};

const getKeyAction = async (): Promise<void> => {
  const key = await ensureClientSession(appState)
    .org()
    .getKey(getActiveKeyId());
  appendLogJson('Key Details', key.cached);
};

const getMetadataAction = async (): Promise<void> => {
  const key = await ensureClientSession(appState)
    .org()
    .getKey(getActiveKeyId());
  const metadata = await key.metadata();
  appendLogJson('Key Metadata', {
    keyId: key.id,
    metadata,
  });
};

const setMetadataAction = async (): Promise<void> => {
  const key = await ensureClientSession(appState)
    .org()
    .getKey(getActiveKeyId());
  const metadataPayload = parseMetadataPayload(dom.metadataPayloadInput.value);
  await key.setMetadata(metadataPayload);
  appendLog('Metadata updated.', 'success');
  await getMetadataAction();
};

const clearMetadataAction = async (): Promise<void> => {
  const key = await ensureClientSession(appState)
    .org()
    .getKey(getActiveKeyId());
  await key.setMetadata(null);
  appendLog('Metadata cleared.', 'success');
};

const disableKeyAction = async (): Promise<void> => {
  const key = await ensureClientSession(appState)
    .org()
    .getKey(getActiveKeyId());
  await key.disable();
  appendLog(`Key disabled: ${key.id}`, 'success');
};

const deleteKeyAction = async (): Promise<void> => {
  const keyId = getActiveKeyId();
  const key = await ensureClientSession(appState).org().getKey(keyId);
  const deleteResponse = await key.delete();
  assertNoMfaRequired('Delete key', deleteResponse);

  appendLog(`Key deleted: ${keyId}`, 'success');
  if (dom.keyIdInput.value.trim() === keyId) {
    dom.keyIdInput.value = '';
  }
  await listKeysAction();
};

const importSecretAction = async (): Promise<void> => {
  const client = ensureClientSession(appState);
  const keyIdInputElement = dom.keyIdInput;
  const keyType = parseImportKeyType(dom.importKeyTypeSelect.value);
  const secretBytes = hexToBytes(dom.importSecretHexInput.value.trim());

  const importer = new KeyImporter(client.org());
  const importedKeys = await importer.importRawSecretKeys(keyType, [
    secretBytes,
  ]);

  const summaries = importedKeys.map((key) => mapKeySummary(key));
  appendLogJson('Imported Keys', summaries);

  const firstImportedKey = importedKeys[0];
  if (firstImportedKey) {
    const importedKeyId = firstImportedKey.id;
    keyIdInputElement.value = importedKeyId;
    appendLog(`Imported key selected: ${importedKeyId}`, 'success');
  }

  await listKeysAction();
};

const initExportAction = async (): Promise<void> => {
  const keyId = getActiveKeyId();
  const response = await ensureClientSession(appState).org().initExport(keyId);
  const data = assertNoMfaRequired('Init export', response);
  appendLogJson('Init Export Response', data);
};

const getExportStatusAction = async (): Promise<void> => {
  const keyId = getActiveKeyId();
  const exports = await ensureClientSession(appState)
    .org()
    .exports(keyId)
    .fetch();

  const mapped = exports.map((entry) => ({
    keyId: entry.key_id,
    orgId: entry.org_id,
    validEpoch: entry.valid_epoch,
    expEpoch: entry.exp_epoch,
    publicKeyHash: entry.public_key_hash ?? null,
  }));
  appendLogJson('Export Status', mapped);
};

const completeExportAction = async (): Promise<void> => {
  const keyId = getActiveKeyId();
  const keyPair = await userExportKeygen();
  const response = await ensureClientSession(appState)
    .org()
    .completeExport(keyId, keyPair.publicKey);
  const encrypted = assertNoMfaRequired('Complete export', response);

  const decrypted = await userExportDecrypt(keyPair.privateKey, encrypted);
  appendLogJson('Encrypted Export Payload', truncateLongStrings(encrypted));
  appendLogJson('Decrypted Export Material', truncateLongStrings(decrypted));
};

const cancelExportAction = async (): Promise<void> => {
  const keyId = getActiveKeyId();
  await ensureClientSession(appState).org().deleteExport(keyId);
  appendLog(`Cancelled export for key ${keyId}.`, 'success');
};

export const createActions = (): AppActions => {
  return {
    handleGoogleLogin,
    submitManualIdentityProofAction,
    createManualSessionAction,
    getCurrentUserAction,
    listKeysAction,
    getKeyAction,
    getMetadataAction,
    setMetadataAction,
    clearMetadataAction,
    disableKeyAction,
    deleteKeyAction,
    importSecretAction,
    initExportAction,
    getExportStatusAction,
    completeExportAction,
    cancelExportAction,
  };
};
