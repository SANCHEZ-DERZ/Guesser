import { createAssistant, createSmartappDebugger } from '@sberdevices/assistant-client';

const initialize = (getState, getRecoveryState) => {
    if (process.env.NODE_ENV === 'development') {
        return createSmartappDebugger({
            token: process.env.REACT_APP_ASSISTANT_TOKEN,
            initPhrase: 'Запусти игру угадай флаг',
            getState,
            getRecoveryState,
            nativePanel: {
                defaultText: 'Покажи что-нибудь',
                screenshotMode: false,
                tabIndex: -1,
            },
        });
    }

    return createAssistant({ getState, getRecoveryState });
};

// Создаем мок-ассистент для случаев, когда реальный ассистент недоступен
const createMockAssistant = () => {
    return {
        on: (event, handler) => {
            console.log(`Mock assistant: ${event} event handler attached`);
            return () => console.log(`Mock assistant: ${event} event handler detached`);
        },
        sendData: (data) => {
            console.log('Mock assistant: sending data', data);
        },
        sendAction: (action, onSuccess, onError) => {
            console.log('Mock assistant: sending action', action);
            if (onSuccess) onSuccess({ type: 'mock_response', payload: { success: true } });
            return () => console.log('Mock assistant: action handler detached');
        }
    };
};

export default initialize; 