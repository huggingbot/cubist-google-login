import type { JsonValue } from '@cubist-labs/cubesigner-sdk';

import type { OidcPayload } from './types';

export const truncateLongStrings = (value: unknown, maxLen = 40): unknown => {
  if (typeof value === 'string' && value.length > maxLen) {
    return `${value.slice(0, maxLen)}...`;
  }
  if (Array.isArray(value)) {
    return value.map((item) => truncateLongStrings(item, maxLen));
  }
  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      result[key] = truncateLongStrings(entry, maxLen);
    }
    return result;
  }
  return value;
};

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

export const hexToBytes = (rawHex: string): Uint8Array => {
  const normalizedHex = rawHex.startsWith('0x') ? rawHex.slice(2) : rawHex;
  if (!normalizedHex || normalizedHex.length % 2 !== 0) {
    throw new Error('Secret hex must have an even number of characters.');
  }
  if (!/^[a-f0-9]+$/iu.test(normalizedHex)) {
    throw new Error('Secret hex contains invalid characters.');
  }

  const bytes = new Uint8Array(normalizedHex.length / 2);
  for (let index = 0; index < normalizedHex.length; index += 2) {
    bytes[index / 2] = Number.parseInt(normalizedHex.slice(index, index + 2), 16);
  }
  return bytes;
};

export const isJsonValue = (value: unknown): value is JsonValue => {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((entry) => isJsonValue(entry));
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).every((entry) =>
      isJsonValue(entry),
    );
  }

  return false;
};

export const parseMetadataPayload = (rawPayload: string): JsonValue => {
  const trimmed = rawPayload.trim();
  if (!trimmed) {
    throw new Error('Metadata payload is required.');
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!isJsonValue(parsed)) {
      throw new Error('Metadata must be valid JSON value.');
    }
    return parsed;
  } catch {
    return trimmed;
  }
};
