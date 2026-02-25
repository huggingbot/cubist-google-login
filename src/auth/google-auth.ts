/* eslint-disable no-restricted-globals */

import { readConfigFromDom } from '../config/config';
import type { GoogleCredentialResponse } from '../shared/types';
import { toErrorMessage } from '../shared/utils';
import { dom } from '../ui/dom';
import { appendLog } from '../ui/logger';

type GoogleLoginHandler = (
  credentialResponse: GoogleCredentialResponse,
) => Promise<void>;

let activeGoogleLoginHandler: GoogleLoginHandler | null = null;

const runGoogleLoginHandler = (response: GoogleCredentialResponse): void => {
  const handler = activeGoogleLoginHandler;
  if (!handler) {
    appendLog('No Google login handler is configured.', 'error');
    return;
  }
  handler(response).catch((callbackError: unknown) => {
    appendLog(toErrorMessage(callbackError), 'error');
  });
};

export const renderGoogleButton = (
  handleGoogleLogin: GoogleLoginHandler,
): void => {
  const googleAccounts = window.google?.accounts?.id;
  if (!googleAccounts) {
    throw new Error('Google Identity Services library is not loaded.');
  }

  const config = readConfigFromDom();
  activeGoogleLoginHandler = handleGoogleLogin;
  dom.googleSigninButton.innerHTML = '';

  googleAccounts.initialize({
    client_id: config.googleClientId,
    callback: runGoogleLoginHandler,
    itp_support: true,
  });

  googleAccounts.renderButton(dom.googleSigninButton, {
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    width: 320,
  });
};

const clickRenderedGoogleButton = (): boolean => {
  const candidates: Array<HTMLElement | null> = [
    dom.googleSigninButton.querySelector<HTMLElement>('[role="button"]'),
    dom.googleSigninButton.querySelector<HTMLElement>('div[tabindex]'),
    dom.googleSigninButton.firstElementChild as HTMLElement | null,
  ];
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    candidate.click();
    return true;
  }
  return false;
};

export const startGoogleLoginFlow = (
  handleGoogleLogin: GoogleLoginHandler,
): boolean => {
  renderGoogleButton(handleGoogleLogin);
  window.google?.accounts?.id?.disableAutoSelect?.();
  return clickRenderedGoogleButton();
};

export const waitForGoogleLibraryAndRender = (
  handleGoogleLogin: GoogleLoginHandler,
): void => {
  const poll = setInterval(() => {
    if (window.google?.accounts?.id) {
      clearInterval(poll);
      try {
        renderGoogleButton(handleGoogleLogin);
        appendLog('Google sign-in ready. Authenticate to create a CubeSigner session.');
      } catch (renderError: unknown) {
        appendLog(
          `Google button render failed: ${toErrorMessage(renderError)}`,
          'error',
        );
      }
    }
  }, 100);

  setTimeout(() => {
    if (!window.google?.accounts?.id) {
      clearInterval(poll);
      appendLog(
        'Google Identity Services script did not load. Check network/ad-blocker.',
        'error',
      );
    }
  }, 10_000);
};
