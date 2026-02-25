import {
  CubeSignerClient,
  type CubeSignerResponse,
} from '@cubist-labs/cubesigner-sdk';
import {
  CubistProvider,
  type ProviderRegistrationPayload,
} from '@metamask/mfa-wallet-recovery';

import { CUBESIGNER_ENV, DEFAULT_PROVIDER_KEY_TYPE } from '../config/constants';
import type {
  AppConfig,
  SessionExchangeResult,
} from '../shared/types';

export type OidcIdentityProof = ProviderRegistrationPayload;

const createCubistProvider = (config: AppConfig): CubistProvider => {
  return new CubistProvider({
    env: CUBESIGNER_ENV,
    orgId: config.orgId,
    scopes: config.scopes,
    keyType: DEFAULT_PROVIDER_KEY_TYPE,
  });
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
): Promise<SessionExchangeResult> => {
  const response = await CubeSignerClient.createOidcSession(
    CUBESIGNER_ENV,
    config.orgId,
    idToken,
    config.scopes,
  );
  const session = assertNoMfaRequired('Session token exchange', response);

  return {
    orgId: config.orgId,
    sessionId: session.session_info.session_id,
    sessionToken: session.token,
    refreshToken: session.refresh_token,
    authTokenExp: session.session_info.auth_token_exp,
    refreshTokenExp: session.session_info.refresh_token_exp,
    sessionExp: session.session_exp ?? null,
  };
};
