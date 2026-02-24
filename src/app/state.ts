import type { AppState } from '../shared/types';
import { actionButtons, dom } from '../ui/dom';

export const appState: AppState = {
  googleIdToken: null,
  sessionSummary: null,
  client: null,
};

export const setSessionStatus = (message: string): void => {
  dom.sessionStatus.textContent = message;
};

export const setActionButtonsState = (enabled: boolean): void => {
  for (const button of actionButtons) {
    button.disabled = !enabled;
  }
};

export const updateSessionUi = (): void => {
  if (!appState.sessionSummary) {
    setSessionStatus('Not authenticated.');
    setActionButtonsState(false);
    return;
  }

  const sessionInfo = appState.sessionSummary;
  setSessionStatus(
    [
      `Authenticated to org ${sessionInfo.orgId}.`,
      `Session ID: ${sessionInfo.sessionId}`,
      `Auth token exp: ${sessionInfo.authTokenExp ?? 'unknown'}`,
    ].join(' '),
  );
  setActionButtonsState(true);
};
