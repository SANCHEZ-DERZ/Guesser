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
  const [gameState, setGameState] = useState('idle');
  const [difficulty, setDifficulty] = useState('easy');
  const [score, setScore] = useState(0);

  // Инициализация ассистента
  useEffect(() => {
    const initAssistant = async () => {
      try {
        const assistantInstance = await initializeAssistant(() => ({
          game_state: gameState,
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
        difficulty={difficulty}
        score={score}
        onStateChange={handleStateChange}
      />
    </div>
  );
};

export default App; 