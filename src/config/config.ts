/* eslint-disable no-restricted-globals */

import type { Scope } from '@cubist-labs/cubesigner-sdk';

import {
  CONFIG_STORAGE_KEY,
  DEFAULT_GOOGLE_CLIENT_ID,
  DEFAULT_ORG_ID,
  DEFAULT_SCOPES,
} from './constants';
import type { AppConfig } from '../shared/types';
import { dom } from '../ui/dom';

export const parseScopes = (rawScopes: string): Scope[] => {
  return rawScopes
    .split(',')
    .map((scopeValue) => scopeValue.trim())
    .filter((scopeValue): scopeValue is Scope => scopeValue.length > 0);
};

export const readConfigFromDom = (): AppConfig => {
  const orgId = dom.orgIdInput.value.trim();
  if (!orgId) {
    throw new Error('CubeSigner org ID is required.');
  }

  const scopes = parseScopes(dom.scopesInput.value.trim());
  if (scopes.length === 0) {
    throw new Error('At least one scope is required.');
  }

  const googleClientId = dom.googleClientIdInput.value.trim();
  if (!googleClientId) {
    throw new Error('Google client ID is required.');
  }

  return {
    orgId,
    scopes,
    googleClientId,
  };
};

export const saveConfigToStorage = (): void => {
  localStorage.setItem(
    CONFIG_STORAGE_KEY,
    JSON.stringify({
      orgId: dom.orgIdInput.value,
      scopes: dom.scopesInput.value,
      googleClientId: dom.googleClientIdInput.value,
    }),
  );
};

export const loadConfigFromStorage = (): void => {
  try {
    const serialized = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!serialized) {
      dom.orgIdInput.value = DEFAULT_ORG_ID;
      dom.scopesInput.value = DEFAULT_SCOPES;
      dom.googleClientIdInput.value = DEFAULT_GOOGLE_CLIENT_ID;
      return;
    }

    const parsed = JSON.parse(serialized) as Record<string, unknown>;

    if (typeof parsed.orgId === 'string') {
      dom.orgIdInput.value = parsed.orgId;
    } else {
      dom.orgIdInput.value = DEFAULT_ORG_ID;
    }
    if (typeof parsed.scopes === 'string') {
      dom.scopesInput.value = parsed.scopes;
    } else {
      dom.scopesInput.value = DEFAULT_SCOPES;
    }
    if (typeof parsed.googleClientId === 'string') {
      dom.googleClientIdInput.value = parsed.googleClientId;
    } else {
      dom.googleClientIdInput.value = DEFAULT_GOOGLE_CLIENT_ID;
    }
  } catch {
    dom.orgIdInput.value = DEFAULT_ORG_ID;
    dom.scopesInput.value = DEFAULT_SCOPES;
    dom.googleClientIdInput.value = DEFAULT_GOOGLE_CLIENT_ID;
  }
};
