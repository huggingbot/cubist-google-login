import {
  CubeSignerClient,
  type CubeSignerResponse,
  type KeyType as CubeSignerKeyType,
  type SessionData,
} from '@cubist-labs/cubesigner-sdk';
import {
  CubistProvider,
  type ProviderRegistrationPayload,
} from '@metamask/mfa-wallet-recovery';

import { ALLOWED_IMPORT_KEY_TYPES, CUBESIGNER_ENV } from '../config/constants';
import type { AppConfig, AppState, KeySummary } from '../shared/types';

export type OidcIdentityProof = ProviderRegistrationPayload;

const createCubistProvider = (config: AppConfig): CubistProvider => {
  const defaultKeyType = ALLOWED_IMPORT_KEY_TYPES[0];
  if (!defaultKeyType) {
    throw new Error('At least one import key type must be configured.');
  }

  return new CubistProvider({
    env: CUBESIGNER_ENV,
    orgId: config.orgId,
    scopes: config.scopes,
    keyType: defaultKeyType,
  });
};

export const ensureClientSession = (state: AppState): CubeSignerClient => {
  if (!state.client) {
    throw new Error('No CubeSigner session. Sign in with Google first.');
  }
  return state.client;
};

export const assertNoMfaRequired = <TData>(
  operationName: string,
  response: CubeSignerResponse<TData>,
): TData => {
  if (response.requiresMfa()) {
    throw new Error(
      `${operationName} requires MFA approval (mfaId=${response.mfaId() ?? 'unknown'}).`,
    );
  }
  return response.data();
};

export const createIdentityProofFromOidcToken = async (
  idToken: string,
  config: AppConfig,
): Promise<OidcIdentityProof> => {
  return await createCubistProvider(config).createCubistIdentityProof(idToken);
};

export const createSessionFromOidcToken = async (
  idToken: string,
  config: AppConfig,
): Promise<{
  client: CubeSignerClient;
  sessionData: SessionData;
}> => {
  const selectedEnv = CUBESIGNER_ENV;
  const oidcResponse = await CubeSignerClient.createOidcSession(
    selectedEnv,
    config.orgId,
    idToken,
    config.scopes,
    undefined,
    undefined,
    'google login test tool',
  );
  const sessionData = assertNoMfaRequired('OIDC login', oidcResponse);
  const client = await CubeSignerClient.create(sessionData);
  return { client, sessionData };
};

export const mapKeySummary = (key: {
  id: string;
  materialId: string;
  cached: Record<string, unknown>;
}): KeySummary => {
  const keyTypeValue = key.cached.key_type;
  return {
    keyId: key.id,
    materialId: key.materialId,
    keyType:
      typeof keyTypeValue === 'string'
        ? keyTypeValue
        : JSON.stringify(keyTypeValue ?? null),
    enabled: Boolean(key.cached.enabled),
    owner: typeof key.cached.owner === 'string' ? key.cached.owner : undefined,
    metadata: key.cached.metadata ?? null,
  };
};

export const parseImportKeyType = (rawValue: string): CubeSignerKeyType => {
  const selectedType = rawValue as CubeSignerKeyType;
  if (!ALLOWED_IMPORT_KEY_TYPES.includes(selectedType)) {
    throw new Error(`Unsupported import key type: ${rawValue}`);
  }
  return selectedType;
};
