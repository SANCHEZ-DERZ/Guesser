import { createSmartappDebugger, createAssistant } from '@salutejs/client';

export const initializeAssistant = (getState) => {
  if (process.env.NODE_ENV === 'development') {
    return createSmartappDebugger({ token: process.env.REACT_APP_TOKEN, initPhrase: 'запусти игру с флагами' });
  }
  return createAssistant({ getState });
};
