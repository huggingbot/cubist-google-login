import { appState } from './state';
import { readConfigFromDom } from '../config/config';
import { CUBESIGNER_ENV_NAME } from '../config/constants';
import {
  createIdentityProofFromOidcToken,
  createSessionFromOidcToken,
} from '../services/cubesigner';
import {
  ensureProviderUserFromIdentityProof,
  registrationEnsureUserUrl,
} from '../services/registration';
import type { GoogleCredentialResponse } from '../shared/types';
import { decodeJwtPayload } from '../shared/utils';
import { dom } from '../ui/dom';
import { appendLog, appendLogJson } from '../ui/logger';

export type AppActions = {
  handleGoogleLoginManual: (
    credentialResponse: GoogleCredentialResponse,
  ) => Promise<void>;
  handleGoogleLoginFullFlow: (
    credentialResponse: GoogleCredentialResponse,
  ) => Promise<void>;
  prepareFullFlowAction: () => Promise<void>;
  createIdentityProofStep: () => Promise<void>;
  createUserStep: () => Promise<void>;
  createSessionStep: () => Promise<void>;
};

const setTabDot = (dotName: string, done: boolean): void => {
  const dot = document.querySelector<HTMLElement>(
    `.tab-dot[data-dot="${dotName}"]`,
  );
  if (dot) {
    dot.classList.toggle('done', done);
  }
};

const setOutput = (el: HTMLPreElement, text: string): void => {
  el.textContent = text;
  el.classList.add('has-content');
};

const readGoogleIdToken = (
  credentialResponse: GoogleCredentialResponse,
): string => {
  const idToken = credentialResponse.credential.trim();
  if (!idToken) {
    throw new Error('Google sign-in did not return an ID token.');
  }
  return idToken;
};

const handleGoogleLoginManual = async (
  credentialResponse: GoogleCredentialResponse,
): Promise<void> => {
  const idToken = readGoogleIdToken(credentialResponse);
  appendLog('Google sign-in succeeded. Decoding token...');

  const payload = decodeJwtPayload(idToken);

  setOutput(dom.idTokenOutput, idToken);
  setTabDot('google-login', true);

  dom.idTokenForProofInput.value = idToken;
  dom.idTokenForSessionInput.value = idToken;

  appendLogJson('Google ID Token Payload', {
    iss: payload.iss,
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    aud: payload.aud,
    iat: payload.iat,
    exp: payload.exp,
  });
};

const createIdentityProofStep = async (): Promise<void> => {
  const idToken = dom.idTokenForProofInput.value.trim();
  if (!idToken) {
    throw new Error(
      'No ID token provided. Paste a Google ID token in the input above, or complete Step 1 first.',
    );
  }
  const config = readConfigFromDom();
  appendLog(
    `Creating identity proof for ${config.orgId} on ${CUBESIGNER_ENV_NAME}...`,
  );
  const identityProof = await createIdentityProofFromOidcToken(idToken, config);

  const proofJson = JSON.stringify(identityProof, null, 2);
  setOutput(dom.identityProofOutput, proofJson);
  setTabDot('identity-proof', true);

  dom.identityProofForUserInput.value = proofJson;

  appendLog('Identity proof created.', 'success');
  appendLogJson('Identity Proof', identityProof);
};

const createUserStep = async (): Promise<void> => {
  const proofText = dom.identityProofForUserInput.value.trim();
  if (!proofText) {
    throw new Error(
      'No identity proof provided. Paste an identity proof JSON in the input above, or complete Step 2 first.',
    );
  }

  let identityProof: unknown;
  try {
    identityProof = JSON.parse(proofText);
  } catch {
    throw new Error(
      'Identity proof input is not valid JSON. Check formatting.',
    );
  }

  appendLog(
    `Forwarding identity proof to registration service (${registrationEnsureUserUrl()})...`,
  );

  const idToken =
    dom.idTokenForProofInput.value.trim() ||
    dom.idTokenForSessionInput.value.trim();

  const registrationResult = await ensureProviderUserFromIdentityProof(
    identityProof as Parameters<typeof ensureProviderUserFromIdentityProof>[0],
    idToken
      ? { providerToken: idToken, registrationToken: idToken }
      : undefined,
  );

  const resultText =
    typeof registrationResult === 'string'
      ? registrationResult
      : JSON.stringify(registrationResult, null, 2);
  setOutput(dom.userResultOutput, resultText);
  setTabDot('create-user', true);

  appendLog('Registration service confirmed user provisioning.', 'success');
  appendLogJson('User Creation Result', registrationResult);
};

const createSessionStep = async (): Promise<void> => {
  const idToken = dom.idTokenForSessionInput.value.trim();
  if (!idToken) {
    throw new Error(
      'No ID token provided. Paste a Google ID token in the input above, or complete Step 1 first.',
    );
  }
  const config = readConfigFromDom();
  appendLog(
    `Exchanging ID token for session token for ${config.orgId} on ${CUBESIGNER_ENV_NAME}...`,
  );
  const sessionResult = await createSessionFromOidcToken(idToken, config);

  setOutput(dom.sessionTokenOutput, JSON.stringify(sessionResult, null, 2));
  setTabDot('session-token', true);

  appendLog('Session token created.', 'success');
  appendLogJson('Session Result Metadata', {
    orgId: sessionResult.orgId,
    sessionId: sessionResult.sessionId,
    authTokenExp: sessionResult.authTokenExp,
    refreshTokenExp: sessionResult.refreshTokenExp,
    sessionExp: sessionResult.sessionExp,
  });
};

const prepareFullFlowAction = async (): Promise<void> => {
  appState.pendingGoogleFlow = 'fullFlow';
  dom.fullFlowResultOutput.textContent = 'Running...';
  dom.fullFlowResultOutput.classList.remove('has-content');
  appendLog('Full flow started. Waiting for Google sign-in callback...');
};

const handleGoogleLoginFullFlow = async (
  credentialResponse: GoogleCredentialResponse,
): Promise<void> => {
  const idToken = readGoogleIdToken(credentialResponse);
  const config = readConfigFromDom();

  appendLog(
    `Google sign-in succeeded. Running full flow for ${config.orgId} on ${CUBESIGNER_ENV_NAME}...`,
  );
  try {
    const identityProof = await createIdentityProofFromOidcToken(
      idToken,
      config,
    );
    await ensureProviderUserFromIdentityProof(identityProof, {
      providerToken: idToken,
      registrationToken: idToken,
    });
    const sessionResult = await createSessionFromOidcToken(idToken, config);

    setOutput(
      dom.fullFlowResultOutput,
      JSON.stringify(sessionResult, null, 2),
    );
    setTabDot('full-flow', true);
    appState.pendingGoogleFlow = null;
    appendLog('Full flow completed.', 'success');
  } catch (error: unknown) {
    appState.pendingGoogleFlow = null;
    dom.fullFlowResultOutput.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
    dom.fullFlowResultOutput.classList.remove('has-content');
    throw error;
  }
};

export const createActions = (): AppActions => {
  return {
    handleGoogleLoginManual,
    handleGoogleLoginFullFlow,
    prepareFullFlowAction,
    createIdentityProofStep,
    createUserStep,
    createSessionStep,
  };
};
