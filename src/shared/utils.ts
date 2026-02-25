import type { OidcPayload } from './types';

export const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export const decodeJwtPayload = (jwt: string): OidcPayload => {
  const parts = jwt.split('.');
  if (parts.length < 2) {
    throw new Error('Invalid JWT format');
  }

  const base64UrlPayload = parts[1];
  if (!base64UrlPayload) {
    throw new Error('JWT payload is missing');
  }

  const base64Payload = base64UrlPayload.replace(/-/gu, '+').replace(/_/gu, '/');
  const paddedPayload = base64Payload.padEnd(
    base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
    '=',
  );

  return JSON.parse(atob(paddedPayload)) as OidcPayload;
};
