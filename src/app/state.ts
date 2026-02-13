import type { AppState } from '../shared/types';
import { actionButtons, dom } from '../ui/dom';

export const appState: AppState = {
  googleIdToken: null,
  sessionData: null,
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
  if (!appState.sessionData) {
    setSessionStatus('Not authenticated.');
    setActionButtonsState(false);
    return;
  }

  const sessionInfo = appState.sessionData.session_info;
  setSessionStatus(
    [
      `Authenticated to org ${appState.sessionData.org_id}.`,
      `Session ID: ${sessionInfo.session_id}`,
      `Auth token exp: ${sessionInfo.auth_token_exp}`,
    ].join(' '),
  );
  setActionButtonsState(true);
};
