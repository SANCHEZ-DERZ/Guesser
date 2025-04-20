import React, { useState, useEffect } from 'react';
import { initializeAssistant } from '../smartapp/assistant';
import '../assets/styles/App.css';

const flags = [
  { country: 'Франция', image: process.env.PUBLIC_URL + '/flags/france.png' },
  { country: 'Германия', image: process.env.PUBLIC_URL + '/flags/germany.png' },
  { country: 'Италия', image: process.env.PUBLIC_URL + '/flags/italy.png' },
];

const FlagGame = () => {
  const [assistant, setAssistant] = useState(null);
  const [currentFlagIndex, setCurrentFlagIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const assistantInstance = initializeAssistant(() => ({}));

    assistantInstance.on('data', (event) => {
      const { action } = event;
      if (action) {
        handleAssistantAction(action);
      }
    });

    setAssistant(assistantInstance);
  }, [currentFlagIndex]);

  const handleAssistantAction = (action) => {
    if (action.type === 'guess_country') {
      const guessed = action.payload?.country?.toLowerCase();
      const correct = flags[currentFlagIndex].country.toLowerCase();

      if (guessed === correct) {
        if (currentFlagIndex + 1 < flags.length) {
          setCurrentFlagIndex(currentFlagIndex + 1);
        } else {
          setGameOver(true);
        }
      } else {
        setCurrentFlagIndex(0); // сброс, если ошибка
      }
    }
  };

  return (
    <div className="app">
      <h1>Угадай страну по флагу</h1>
      {gameOver ? (
        <div>
          <h2>Поздравляем! Вы прошли игру!</h2>
          <button onClick={() => { setGameOver(false); setCurrentFlagIndex(0); }}>
            Играть снова
          </button>
        </div>
      ) : (
        <div className="flag-container">
          <img src={flags[currentFlagIndex].image} alt="flag" className="flag-image" />
          <p>Назовите страну, которой принадлежит флаг</p>
        </div>
      )}
    </div>
  );
};

export default FlagGame;
