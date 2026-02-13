/* eslint-disable no-restricted-globals */

import { readConfigFromDom } from '../config/config';
import type { GoogleCredentialResponse } from '../shared/types';
import { toErrorMessage } from '../shared/utils';
import { dom } from '../ui/dom';
import { appendLog } from '../ui/logger';

type GoogleLoginHandler = (
  credentialResponse: GoogleCredentialResponse,
) => Promise<void>;

export const renderGoogleButton = (
  handleGoogleLogin: GoogleLoginHandler,
): void => {
  const googleAccounts = window.google?.accounts?.id;
  if (!googleAccounts) {
    throw new Error('Google Identity Services library is not loaded.');
  }

  const config = readConfigFromDom();
  dom.googleSigninButton.innerHTML = '';

  googleAccounts.initialize({
    client_id: config.googleClientId,
    callback: (response) => {
      handleGoogleLogin(response).catch((callbackError: unknown) => {
        appendLog(toErrorMessage(callbackError), 'error');
      });
    },
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
