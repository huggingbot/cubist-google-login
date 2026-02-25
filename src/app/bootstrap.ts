/* eslint-disable no-restricted-globals */

import { createActions } from './actions';
import { appState, switchTab } from './state';
import {
  renderGoogleButton,
  startGoogleLoginFlow,
  waitForGoogleLibraryAndRender,
} from '../auth/google-auth';
import { loadConfigFromStorage, saveConfigToStorage } from '../config/config';
import { toErrorMessage } from '../shared/utils';
import { dom } from '../ui/dom';
import { appendLog, clearLog } from '../ui/logger';

const bindAsyncAction = (
  button: HTMLButtonElement,
  actionName: string,
  action: () => Promise<void>,
): void => {
  button.addEventListener('click', () => {
    button.disabled = true;
    appendLog(`${actionName}...`);

    const executeAction = async (): Promise<void> => {
      try {
        await action();
        appendLog(`${actionName} completed.`, 'success');
      } catch (actionError: unknown) {
        appendLog(
          `${actionName} failed: ${toErrorMessage(actionError)}`,
          'error',
        );
      } finally {
        button.disabled = false;
      }
    };

    executeAction().catch((unhandledError: unknown) => {
      appendLog(
        `${actionName} failed unexpectedly: ${toErrorMessage(unhandledError)}`,
        'error',
      );
      button.disabled = false;
    });
  });
};

const wireConfigToggle = (): void => {
  dom.configToggle.addEventListener('click', () => {
    const collapsed = dom.configBody.classList.toggle('hidden');
    dom.configToggle.classList.toggle('collapsed', collapsed);
  });
};

const wireTabSwitching = (): void => {
  for (const btn of dom.tabButtons) {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      if (tabId) {
        switchTab(tabId);
      }
    });
  }
};

const wireCopyButtons = (): void => {
  for (const btn of document.querySelectorAll<HTMLButtonElement>('.copy-btn')) {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.copy;
      if (!targetId) {
        return;
      }
      const target = document.getElementById(targetId);
      if (!target) {
        return;
      }
      const text = target.textContent ?? '';
      navigator.clipboard.writeText(text).then(
        () => {
          const original = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => {
            btn.textContent = original;
          }, 1200);
        },
        () => {
          btn.textContent = 'Failed';
          setTimeout(() => {
            btn.textContent = 'Copy';
          }, 1200);
        },
      );
    });
  }
};

const wireLogClear = (): void => {
  dom.logClearButton.addEventListener('click', clearLog);
};

const wireConfigListeners = (rerenderGoogleButton: () => void): void => {
  const persistOnlyElements: HTMLInputElement[] = [
    dom.orgIdInput,
    dom.scopesInput,
  ];

  for (const element of persistOnlyElements) {
    element.addEventListener('input', saveConfigToStorage);
    element.addEventListener('change', saveConfigToStorage);
  }

  dom.googleClientIdInput.addEventListener('input', () => {
    saveConfigToStorage();
    rerenderGoogleButton();
  });
};

const initializeApp = (): void => {
  const actions = createActions();

  const handleFullFlowGoogleLogin = async (
    credentialResponse: Parameters<
      typeof actions.handleGoogleLoginFullFlow
    >[0],
  ): Promise<void> => {
    try {
      await actions.handleGoogleLoginFullFlow(credentialResponse);
    } finally {
      try {
        renderGoogleButton(actions.handleGoogleLoginManual);
      } catch (renderError: unknown) {
        appendLog(
          `Google button restore failed: ${toErrorMessage(renderError)}`,
          'error',
        );
      }
    }
  };

  loadConfigFromStorage();
  wireConfigToggle();
  wireTabSwitching();
  wireCopyButtons();
  wireLogClear();

  const rerenderGoogleButton = (): void => {
    if (!window.google?.accounts?.id) {
      return;
    }
    try {
      renderGoogleButton(actions.handleGoogleLoginManual);
      appendLog('Google button updated with new client ID.');
    } catch (renderError: unknown) {
      appendLog(
        `Google button update failed: ${toErrorMessage(renderError)}`,
        'error',
      );
    }
  };

  wireConfigListeners(rerenderGoogleButton);

  bindAsyncAction(
    dom.createIdentityProofButton,
    'Create identity proof',
    actions.createIdentityProofStep,
  );
  bindAsyncAction(
    dom.createUserButton,
    'Create user',
    actions.createUserStep,
  );
  bindAsyncAction(
    dom.createSessionButton,
    'Create session token',
    actions.createSessionStep,
  );

  dom.runFullFlowButton.addEventListener('click', () => {
    dom.runFullFlowButton.disabled = true;
    appendLog('Run full flow...');

    const executeAction = async (): Promise<void> => {
      try {
        await actions.prepareFullFlowAction();
        const started = startGoogleLoginFlow(handleFullFlowGoogleLogin);
        if (!started) {
          appendLog(
            'Google sign-in could not be opened automatically. Click the Google button to continue full flow.',
            'error',
          );
        }
      } catch (actionError: unknown) {
        appState.pendingGoogleFlow = null;
        appendLog(
          `Run full flow failed: ${toErrorMessage(actionError)}`,
          'error',
        );
      } finally {
        dom.runFullFlowButton.disabled = false;
      }
    };

    executeAction().catch((unhandledError: unknown) => {
      appState.pendingGoogleFlow = null;
      appendLog(
        `Run full flow failed unexpectedly: ${toErrorMessage(unhandledError)}`,
        'error',
      );
      dom.runFullFlowButton.disabled = false;
    });
  });

  waitForGoogleLibraryAndRender(actions.handleGoogleLoginManual);
};

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});
