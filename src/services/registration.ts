import {
  RecoveryApiClientError,
  RecoveryRegistrationApiClient,
  type CreateProviderRegistrationPayload,
  type ProviderRegistrationPayload,
} from '@metamask/mfa-wallet-recovery';

import {
  REGISTRATION_API_BASE_URL,
  REGISTRATION_API_PATH,
  REGISTRATION_PROVIDER_VERIFIER_ID,
} from '../config/constants';

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

const createRegistrationApiClient = (
  createProviderRegistrationPayload: CreateProviderRegistrationPayload,
): RecoveryRegistrationApiClient => {
  return new RecoveryRegistrationApiClient({
    baseUrl: REGISTRATION_API_BASE_URL,
    paths: {
      ensureProviderUser: REGISTRATION_API_PATH,
    },
    createProviderRegistrationPayload,
  });
};

export const ensureProviderUserFromIdentityProof = async (
  identityProof: ProviderRegistrationPayload,
  options?: {
    providerToken?: string;
    registrationToken?: string;
  },
): Promise<unknown> => {
  const registrationApi = createRegistrationApiClient(async () => identityProof);
  const providerToken = options?.providerToken ?? 'identity-proof';
  const registrationToken = options?.registrationToken ?? '';

  try {
    return await registrationApi.ensureProviderUser({
      // Local registration service can run without auth; token is optional.
      registrationToken,
      providerVerifierId: REGISTRATION_PROVIDER_VERIFIER_ID,
      // The payload callback returns the staged proof.
      providerToken,
    });
  } catch (error: unknown) {
    if (error instanceof RecoveryApiClientError) {
      const status = error.status ?? 'network';
      const detail =
        error.responseText && error.responseText.length > 0
          ? error.responseText
          : error.message;
      throw new Error(`Registration service ensure-user failed (${status}): ${detail}`);
    }
    throw error;
  }
};
