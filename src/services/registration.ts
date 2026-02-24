import type { ProviderRegistrationPayload } from '@metamask/mfa-wallet-recovery';

import {
  REGISTRATION_API_BASE_URL,
  REGISTRATION_API_PATH,
  REGISTRATION_PROVIDER_VERIFIER_ID,
} from '../config/constants';

type EnsureProviderUserRequestBody = {
  providerVerifierId: string;
  providerRegistrationPayload: ProviderRegistrationPayload;
};

const asRecord = (value: unknown, errorMessage: string): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(errorMessage);
  }
  return value as Record<string, unknown>;
};

const resolveRegistrationUrl = (baseUrl: string, path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return new URL(path, normalizedBaseUrl).toString();
};

export const registrationEnsureUserUrl = (): string => {
  return resolveRegistrationUrl(REGISTRATION_API_BASE_URL, REGISTRATION_API_PATH);
};

export const parseIdentityProofJson = (
  rawIdentityProof: string,
): ProviderRegistrationPayload => {
  const trimmedProof = rawIdentityProof.trim();
  if (!trimmedProof) {
    throw new Error('Paste identity proof JSON first.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmedProof);
  } catch {
    throw new Error('Identity proof must be valid JSON.');
  }

  const proof = asRecord(parsed, 'Identity proof must be a JSON object.');
  const identity = asRecord(
    proof.identity,
    'Identity proof is missing OIDC identity (iss/sub).',
  );
  if (typeof identity.iss !== 'string' || typeof identity.sub !== 'string') {
    throw new Error('Identity proof is missing OIDC identity (iss/sub).');
  }

  return proof as ProviderRegistrationPayload;
};

export const ensureProviderUserFromIdentityProof = async (
  identityProof: ProviderRegistrationPayload,
): Promise<unknown> => {
  const requestUrl = registrationEnsureUserUrl();

  const requestBody: EnsureProviderUserRequestBody = {
    providerVerifierId: REGISTRATION_PROVIDER_VERIFIER_ID,
    providerRegistrationPayload: identityProof,
  };

  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  if (!response.ok) {
    const detail = responseText.length > 0 ? responseText : response.statusText;
    throw new Error(
      `Registration service ensure-user failed (${response.status}): ${detail}`,
    );
  }

  if (responseText.length === 0) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
};
