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
