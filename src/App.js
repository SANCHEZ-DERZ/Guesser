import React, { useState, useEffect } from 'react';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';
import { Game } from './game';
import './styles.css';

const initializeAssistant = (getState) => {
  if (process.env.NODE_ENV === 'development') {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? '',
      initPhrase: `Запусти ${process.env.REACT_APP_SMARTAPP}`,
      getState,
      nativePanel: {
        defaultText: 'Угадай флаг',
        screenshotMode: false,
        tabIndex: -1,
      },
    });
  } else {
    return createAssistant({ getState });
  }
};

const App = () => {
  const [assistant, setAssistant] = useState(null);
  const [gameState, setGameState] = useState('start');
  const [currentCommand, setCurrentCommand] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [score, setScore] = useState(0);

  // Инициализация ассистента
  useEffect(() => {
    const initAssistant = async () => {
      try {
        const assistantInstance = await initializeAssistant(() => ({
          gameState,
          difficulty,
          score
        }));
        setAssistant(assistantInstance);
      } catch (error) {
        console.error('Ошибка инициализации ассистента:', error);
      }
    };

    initAssistant();
  }, [gameState, difficulty, score]);

  // Обработка команд от ассистента
  const handleAssistantAction = (action, data) => {
    console.log('Получено действие от ассистента:', action, data);
    
    switch (action) {
      case 'startGame':
        setGameState('start');
        break;
      case 'waitingForAnswer':
        if (data && data.handleCommand) {
          setCurrentCommand(data.handleCommand);
        }
        break;
      case 'gameOver':
        setGameState('end');
        break;
      default:
        console.log('Неизвестное действие:', action);
    }
  };

  // Обработка сообщений от ассистента
  useEffect(() => {
    if (!assistant) return;

    const handleMessage = (message) => {
      console.log('Получено сообщение от ассистента:', message);
      
      if (message.type === 'text' && currentCommand) {
        currentCommand(message.payload.text);
      }
    };

    const unsubscribe = assistant.on('message', handleMessage);
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [assistant, currentCommand]);

  // Обработка изменений состояния игры
  const handleStateChange = (newState) => {
    if (newState.gameState) setGameState(newState.gameState);
    if (newState.difficulty) setDifficulty(newState.difficulty);
    if (newState.score !== undefined) setScore(newState.score);
  };

  return (
    <div className="app">
      <Game 
        assistant={assistant}
        gameState={gameState}
        difficulty={difficulty}
        score={score}
        onStateChange={handleStateChange}
        onAssistantAction={handleAssistantAction}
      />
    </div>
  );
};

export default App; 