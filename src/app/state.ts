import type { AppState } from '../shared/types';
import { dom } from '../ui/dom';

export const appState: AppState = {
  pendingGoogleFlow: null,
};

export const switchTab = (tabId: string): void => {
  for (const btn of dom.tabButtons) {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  }
  for (const panel of dom.tabPanels) {
    panel.classList.toggle('active', panel.id === tabId);
  }
};
