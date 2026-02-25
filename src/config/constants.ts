import {
  envs,
  Secp256k1,
} from '@cubist-labs/cubesigner-sdk';

export const DEFAULT_ORG_ID = import.meta.env.VITE_DEFAULT_ORG_ID ?? '';
export const DEFAULT_GOOGLE_CLIENT_ID =
  import.meta.env.VITE_DEFAULT_GOOGLE_CLIENT_ID ?? '';
export const DEFAULT_SCOPES = 'sign:*,manage:*,export:*';
export const CONFIG_STORAGE_KEY = 'cubist_google_login_test_config_v2';
export const CUBESIGNER_ENV = envs.gamma;
export const CUBESIGNER_ENV_NAME = 'gamma';
export const REGISTRATION_API_PATH = '/recovery/registration/ensure-user';
export const REGISTRATION_PROVIDER_VERIFIER_ID = 'cubist';
export const REGISTRATION_API_BASE_URL = 'http://localhost:3000';
export const DEFAULT_PROVIDER_KEY_TYPE = Secp256k1.Evm;
