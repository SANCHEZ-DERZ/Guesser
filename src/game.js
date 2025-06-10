import React, { useEffect, useState, useRef } from 'react';
import './styles.css';

// Списки стран для фильтрации по сложности
const popularCountries = [
    'россия', 'сша', 'китай', 'германия', 'великобритания', 'франция', 
    'италия', 'япония', 'испания', 'канада', 'австралия', 'бразилия', 
    'индия', 'мексика', 'южная корея', 'нидерланды', 'турция', 'швейцария', 
    'швеция', 'польша', 'бельгия', 'норвегия', 'австрия', 'дания', 
    'финляндия', 'греция', 'португалия', 'ирландия', 'новая зеландия', 'египет'
];

const mediumPopularCountries = [
    'аргентина', 'таиланд', 'южная африка', 'вьетнам', 'хорватия', 
    'чехия', 'колумбия', 'чили', 'венгрия', 'марокко', 'перу', 
    'филиппины', 'румыния', 'словакия', 'украина', 'алжир', 'тунис', 
    'болгария', 'эквадор', 'исландия', 'сербия', 'словения', 'уругвай', 
    'сингапур', 'малайзия', 'эстония', 'латвия', 'литва', 'люксембург', 'кипр'
];

// Функция получения русских названий стран
function getRussianName(englishName) {
    const countryTranslations = {
        'russia': 'россия',
        'united states': 'сша',
        'united states of america': 'сша',
        'usa': 'сша',
        'united kingdom': 'великобритания',
        'uk': 'великобритания',
        'china': 'китай',
        'germany': 'германия',
        'france': 'франция',
        'italy': 'италия',
        'japan': 'япония',
        'spain': 'испания',
        'canada': 'канада',
        'australia': 'австралия',
        'brazil': 'бразилия',
        'india': 'индия',
        'mexico': 'мексика',
        'south korea': 'южная корея',
        'netherlands': 'нидерланды',
        'turkey': 'турция',
        'switzerland': 'швейцария',
        'sweden': 'швеция',
        'poland': 'польша',
        'belgium': 'бельгия',
        'norway': 'норвегия',
        'austria': 'австрия',
        'denmark': 'дания',
        'finland': 'финляндия',
        'greece': 'греция',
        'portugal': 'португалия',
        'ireland': 'ирландия',
        'new zealand': 'новая зеландия',
        'egypt': 'египет',
        'argentina': 'аргентина',
        'thailand': 'таиланд',
        'south africa': 'южная африка',
        'vietnam': 'вьетнам',
        'croatia': 'хорватия',
        'czechia': 'чехия',
        'czech republic': 'чехия',
        'colombia': 'колумбия',
        'chile': 'чили',
        'hungary': 'венгрия',
        'morocco': 'марокко',
        'peru': 'перу',
        'philippines': 'филиппины',
        'romania': 'румыния',
        'slovakia': 'словакия',
        'ukraine': 'украина',
        'algeria': 'алжир',
        'tunisia': 'тунис',
        'bolgaria': 'болгария',
        'ecuador': 'эквадор',
        'iceland': 'исландия',
        'serbia': 'сербия',
        'slovenia': 'словения',
        'uruguay': 'уругвай',
        'singapore': 'сингапур',
        'malaysia': 'малайзия',
        'estonia': 'эстония',
        'latvia': 'латвия',
        'lithuania': 'литва',
        'luxembourg': 'люксембург',
        'cyprus': 'кипр',
        'hong kong': 'гонконг'
    };
    
    return countryTranslations[englishName.toLowerCase()] || '';
}

export const Game = ({ 
    assistant, 
    gameState: parentGameState, 
    difficulty: parentDifficulty, 
    score: parentScore,
    assistantCommand,
    onStateChange 
}) => {
    const [currentDifficulty, setCurrentDifficulty] = useState(parentDifficulty || 'easy');
    const [currentScore, setCurrentScore] = useState(parentScore || 0);
    const [bestScores, setBestScores] = useState(() => {
        const savedScores = localStorage.getItem('bestScores');
        return savedScores ? JSON.parse(savedScores) : {
            easy: 0,
            medium: 0,
            hard: 0
        };
    });
    const [allCountriesState, setAllCountriesState] = useState({
        easyCountries: [],
        mediumCountries: [],
        hardCountries: []
    });
    const [availableCountries, setAvailableCountries] = useState([]);
    const [showHomeScreen, setShowHomeScreen] = useState(true);
    const [showGameScreen, setShowGameScreen] = useState(false);
    const [showGameOverScreen, setShowGameOverScreen] = useState(false);
    const [showLevelCompleteScreen, setShowLevelCompleteScreen] = useState(false);
    const [currentCountry, setCurrentCountry] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');

    const answerInputRef = useRef(null);
    const flagImageRef = useRef(null);

    // Обновляем состояние родительского компонента при изменении локального состояния
    useEffect(() => {
        onStateChange({
            gameState: showGameScreen ? 'playing' : 'idle',
            difficulty: currentDifficulty,
            score: currentScore
        });
    }, [showGameScreen, currentDifficulty, currentScore, onStateChange]);

    // Обработка команд от голосового ассистента
    useEffect(() => {
        if (assistant) {
            const unsubscribe = assistant.on('data', (event) => {
                if (event.action) {
                    handleAssistantAction(event.action);
                }
            });
            return () => {
                if (unsubscribe) {
                    unsubscribe();
                }
            };
        }
    }, [assistant]);

    // Обработка команд от ассистента
    useEffect(() => {
        if (assistantCommand) {
            console.log('Game received assistant command:', assistantCommand);
            switch (assistantCommand.type) {
                case 'start_game':
                    console.log('Starting game from assistant command');
                    handleStartGame();
                    break;
                case 'set_difficulty':
                    console.log('Setting difficulty from assistant command:', assistantCommand.difficulty);
                    setCurrentDifficulty(assistantCommand.difficulty);
                    break;
                case 'restart_game':
                    console.log('Restarting game from assistant command');
                    handleStartGame();
                    break;
                case 'submit_answer':
                    console.log('Submitting answer from assistant command:', assistantCommand.answer);
                    handleAnswer(assistantCommand.answer);
                    break;
                default:
                    console.warn('Unknown assistant command type:', assistantCommand.type);
            }
        }
    }, [assistantCommand]);

    const handleAssistantAction = (action) => {
        switch (action.type) {
            case 'start_game':
                handleStartGame();
                break;
            case 'set_difficulty':
                setCurrentDifficulty(action.difficulty);
                break;
            case 'restart_game':
                handleStartGame();
                break;
            case 'submit_answer':
                handleAnswer(action.answer);
                break;
            default:
                console.warn('Unknown action type:', action.type);
        }
    };

    // Сохранение лучших результатов в localStorage при их изменении
    useEffect(() => {
        localStorage.setItem('bestScores', JSON.stringify(bestScores));
    }, [bestScores]);

    // Загрузка стран при монтировании компонента
    useEffect(() => {
        async function loadCountries() {
            setIsLoading(true);
            try {
                console.log('Начало загрузки стран из API...');
                const countriesData = await fetchCountries();
                if (countriesData) {
                    console.log('Страны успешно загружены из API:', {
                        easy: countriesData.easyCountries.length,
                        medium: countriesData.mediumCountries.length,
                        hard: countriesData.hardCountries.length
                    });
                    setAllCountriesState(countriesData);
                    let initialCountries = [];
                    switch(currentDifficulty) {
                        case 'easy':
                            initialCountries = [...countriesData.easyCountries];
                            break;
                        case 'medium':
                            initialCountries = [...countriesData.mediumCountries];
                            break;
                        case 'hard':
                            initialCountries = [...countriesData.hardCountries];
                            break;
                        default:
                            initialCountries = [...countriesData.easyCountries];
                    }
                    console.log('Установлены начальные страны:', initialCountries.length);
                    setAvailableCountries(initialCountries);
                } else {
                    console.error('Не удалось загрузить страны из API');
                }
            } catch (error) {
                console.error('Ошибка при загрузке стран из API:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadCountries();
    }, [currentDifficulty]);

    // Получение и фильтрация стран по сложности
    async function fetchCountries() {
        try {
            console.log('Отправка запроса к REST Countries API...');
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,population,area');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Данные получены из API. Количество стран:', data.length);
            
            const countries = data.map(country => {
                const englishName = country.name.common;
                const russianName = getRussianName(englishName);
                const flagUrl = country.flags.png;
                // Логируем URL флага для каждой страны
                console.log(`Страна: ${englishName}, URL флага: ${flagUrl}`);
                
                return {
                    name: englishName,
                    russianName: russianName || englishName,
                    flag: flagUrl,
                    population: country.population || 0,
                    area: country.area || 0
                };
            });
            
            const easyCountries = countries.filter(country => 
                popularCountries.some(popularName => 
                    country.russianName.toLowerCase() === popularName.toLowerCase() || 
                    country.name.toLowerCase() === popularName.toLowerCase()
                )
            );
            
            const mediumCountries = countries.filter(country => 
                mediumPopularCountries.some(mediumName => 
                    country.russianName.toLowerCase() === mediumName.toLowerCase() || 
                    country.name.toLowerCase() === mediumName.toLowerCase()
                ) && 
                !easyCountries.some(easyCountry => easyCountry.name === country.name)
            );
            
            const hardCountries = countries.filter(country => 
                !easyCountries.some(easyCountry => easyCountry.name === country.name) &&
                !mediumCountries.some(mediumCountry => mediumCountry.name === country.name)
            );

            console.log('Отфильтрованные страны:', {
                easy: easyCountries.length,
                medium: mediumCountries.length,
                hard: hardCountries.length
            });

            return { easyCountries, mediumCountries, hardCountries };
        } catch (error) {
            console.error('Ошибка при получении данных о странах из API:', error);
            return { easyCountries: [], mediumCountries: [], hardCountries: [] };
        }
    }

    // Начало игры
    const handleStartGame = () => {
        console.log('handleStartGame called');
        if (isLoading) {
            console.log('Загрузка стран еще не завершена');
            return;
        }

        console.log('Starting game with countries:', allCountriesState);
        setShowHomeScreen(false);
        setShowGameScreen(true);
        setShowGameOverScreen(false);
        setShowLevelCompleteScreen(false);
        setCurrentScore(0);
        setUserAnswer('');

        let countriesForGame = [];
        switch(currentDifficulty) {
            case 'easy':
                countriesForGame = [...allCountriesState.easyCountries];
                break;
            case 'medium':
                countriesForGame = [...allCountriesState.mediumCountries];
                break;
            case 'hard':
                countriesForGame = [...allCountriesState.hardCountries];
                break;
            default:
                countriesForGame = [...allCountriesState.easyCountries];
        }
        console.log('Setting available countries (length):', countriesForGame.length);
        setAvailableCountries(countriesForGame);
        
        // Выбираем первую страну
        if (countriesForGame.length > 0) {
            const firstCountry = countriesForGame[0];
            console.log('Setting first country:', firstCountry, 'Flag URL:', firstCountry.flag);
            setCurrentCountry(firstCountry);
            // Удаляем первую страну из доступных
            setAvailableCountries(countriesForGame.slice(1));
        } else {
            console.warn('Нет стран для выбранного уровня сложности:', currentDifficulty);
            setMessage('Нет стран для игры на этом уровне сложности. Попробуйте другой.');
            setShowGameOverScreen(true);
            setShowGameScreen(false);
        }
    };

    // Обработка ответа
    const handleAnswer = (answer) => {
        if (!currentCountry) return;
        
        const isCorrect = answer.toLowerCase() === currentCountry.russianName.toLowerCase();
        if (isCorrect) {
            setCurrentScore(prev => prev + 1);
            // Выбираем следующую страну
            if (availableCountries.length > 0) {
                const nextCountry = availableCountries[0];
                setCurrentCountry(nextCountry);
                setAvailableCountries(availableCountries.slice(1));
            } else {
                // Если больше нет стран, завершаем уровень
                levelComplete();
            }
        } else {
            setShowGameOverScreen(true);
            setShowGameScreen(false);
            setCorrectAnswer(currentCountry.russianName);
            updateBestScore();
        }
        setUserAnswer('');
    };

    // Обновление лучшего результата
    function updateBestScore() {
        setBestScores(prevScores => {
            let updateNeeded = false;
            const newBestScores = { ...prevScores };
            
            switch(currentDifficulty) {
                case 'easy':
                    if (currentScore > prevScores.easy) {
                        newBestScores.easy = currentScore;
                        updateNeeded = true;
                    }
                    break;
                case 'medium':
                    if (currentScore > prevScores.medium) {
                        newBestScores.medium = currentScore;
                        updateNeeded = true;
                    }
                    break;
                case 'hard':
                    if (currentScore > prevScores.hard) {
                        newBestScores.hard = currentScore;
                        updateNeeded = true;
                    }
                    break;
            }
            
            return updateNeeded ? newBestScores : prevScores;
        });
    }

    // Переход к следующему уровню сложности
    function goToNextLevel() {
        let nextDifficulty = currentDifficulty;
        switch(currentDifficulty) {
            case 'easy':
                nextDifficulty = 'medium';
                break;
            case 'medium':
                nextDifficulty = 'hard';
                break;
        }
        setCurrentDifficulty(nextDifficulty);
    }

    // Возврат в главное меню
    function backToMenu() {
        setShowGameOverScreen(false);
        setShowLevelCompleteScreen(false);
        setShowHomeScreen(true);
    }

    // Обработка завершения уровня
    function levelComplete() {
        setShowGameScreen(false);
        setShowLevelCompleteScreen(true);
        updateBestScore();
    }

    if (isLoading) {
        return <div className="loading">Загрузка...</div>;
    }

    return (
        <div className="game-container">
            {console.log('Current Country in Render:', currentCountry, currentCountry ? currentCountry.flag : 'N/A')}
            {showHomeScreen && (
                <div className="home-screen">
                    <h1>Угадай флаг</h1>
                    <div className="difficulty-selector">
                        <button 
                            className={currentDifficulty === 'easy' ? 'active' : ''} 
                            onClick={() => setCurrentDifficulty('easy')}
                        >
                            Легкий
                        </button>
                        <button 
                            className={currentDifficulty === 'medium' ? 'active' : ''} 
                            onClick={() => setCurrentDifficulty('medium')}
                        >
                            Средний
                        </button>
                        <button 
                            className={currentDifficulty === 'hard' ? 'active' : ''} 
                            onClick={() => setCurrentDifficulty('hard')}
                        >
                            Сложный
                        </button>
                    </div>
                    <div className="best-scores">
                        <h3>Лучшие результаты:</h3>
                        <p>Легкий: {bestScores.easy}</p>
                        <p>Средний: {bestScores.medium}</p>
                        <p>Сложный: {bestScores.hard}</p>
                    </div>
                    <button className="start-button" onClick={handleStartGame}>
                        Начать игру
                    </button>
                </div>
            )}

            {showGameScreen && currentCountry && (
                <div className="game-screen">
                    <div className="game-header">
                        <h2>Угадай страну</h2>
                        <p>Счет: {currentScore}</p>
                    </div>
                    <div className="flag-container">
                        <img 
                            ref={flagImageRef}
                            src={currentCountry.flag} 
                            alt={`Флаг ${currentCountry.name}`}
                            className="flag-image"
                            onError={(e) => {
                                console.error('Error loading flag:', currentCountry.flag);
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/400x200?text=Flag+Not+Found';
                            }}
                        />
                    </div>
                    <div className="answer-input">
                        <input
                            ref={answerInputRef}
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Введите название страны"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleAnswer(userAnswer);
                                }
                            }}
                        />
                        <button onClick={() => handleAnswer(userAnswer)}>
                            Проверить
                        </button>
                    </div>
                </div>
            )}

            {showGameOverScreen && (
                <div className="game-over-screen">
                    <h2>Игра окончена!</h2>
                    <p>Ваш счет: {currentScore}</p>
                    <p>Правильный ответ: {correctAnswer}</p>
                    <button onClick={handleStartGame}>
                        Играть снова
                    </button>
                    <button onClick={backToMenu}>
                        В главное меню
                    </button>
                </div>
            )}

            {showLevelCompleteScreen && (
                <div className="level-complete-screen">
                    <h2>Уровень пройден!</h2>
                    <p>Ваш счет: {currentScore}</p>
                    <button onClick={goToNextLevel}>
                        Следующий уровень
                    </button>
                    <button onClick={backToMenu}>
                        В главное меню
                    </button>
                </div>
            )}
        </div>
    );
}; 