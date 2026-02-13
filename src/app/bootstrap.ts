/* eslint-disable no-restricted-globals */

import { createActions } from './actions';
import { updateSessionUi } from './state';
import {
  renderGoogleButton,
  waitForGoogleLibraryAndRender,
} from '../auth/google-auth';
import { loadConfigFromStorage, saveConfigToStorage } from '../config/config';
import { toErrorMessage } from '../shared/utils';
import { dom } from '../ui/dom';
import { appendLog, renderKeysOutput } from '../ui/logger';

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

const wireConfigListeners = (rerenderGoogleButton: () => void): void => {
  const persistOnlyElements: (HTMLInputElement | HTMLSelectElement)[] = [
    dom.orgIdInput,
    dom.envSelect,
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

  loadConfigFromStorage();
  updateSessionUi();
  renderKeysOutput([]);

  const rerenderGoogleButton = (): void => {
    if (!window.google?.accounts?.id) {
      return;
    }
    try {
      renderGoogleButton(actions.handleGoogleLogin);
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
    dom.getUserButton,
    'Get user profile',
    actions.getCurrentUserAction,
  );
  bindAsyncAction(dom.listKeysButton, 'List keys', actions.listKeysAction);
  bindAsyncAction(dom.getKeyButton, 'Get key details', actions.getKeyAction);
  bindAsyncAction(
    dom.getMetadataButton,
    'Get metadata',
    actions.getMetadataAction,
  );
  bindAsyncAction(
    dom.setMetadataButton,
    'Set metadata',
    actions.setMetadataAction,
  );
  bindAsyncAction(
    dom.clearMetadataButton,
    'Clear metadata',
    actions.clearMetadataAction,
  );
  bindAsyncAction(
    dom.disableKeyButton,
    'Disable key',
    actions.disableKeyAction,
  );
  bindAsyncAction(dom.deleteKeyButton, 'Delete key', actions.deleteKeyAction);
  bindAsyncAction(
    dom.importSecretButton,
    'Import raw secret',
    actions.importSecretAction,
  );
  bindAsyncAction(dom.initExportButton, 'Init export', actions.initExportAction);
  bindAsyncAction(
    dom.getExportStatusButton,
    'Get export status',
    actions.getExportStatusAction,
  );
  bindAsyncAction(
    dom.completeExportButton,
    'Complete export',
    actions.completeExportAction,
  );
  bindAsyncAction(
    dom.cancelExportButton,
    'Cancel export',
    actions.cancelExportAction,
  );

  waitForGoogleLibraryAndRender(actions.handleGoogleLogin);
};

document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});
