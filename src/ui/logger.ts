/* eslint-disable no-restricted-globals */

import { dom } from './dom';
import type { LogLevel } from '../shared/types';

export const appendLog = (message: string, level: LogLevel = 'info'): void => {
  const entry = document.createElement('div');
  entry.className = `log-entry log-${level}`;

  const timestamp = new Date().toLocaleTimeString();
  entry.textContent = `[${timestamp}] ${message}`;

  dom.logContainer.appendChild(entry);
  dom.logContainer.scrollTop = dom.logContainer.scrollHeight;
};

export const appendLogJson = (label: string, value: unknown): void => {
  const entry = document.createElement('div');
  entry.className = 'log-entry log-json';

  const title = document.createElement('div');
  title.className = 'log-label';
  title.textContent = label;

  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify(value, null, 2);

  entry.appendChild(title);
  entry.appendChild(pre);
  dom.logContainer.appendChild(entry);
  dom.logContainer.scrollTop = dom.logContainer.scrollHeight;
};

export const clearLog = (): void => {
  dom.logContainer.innerHTML = '';
};
