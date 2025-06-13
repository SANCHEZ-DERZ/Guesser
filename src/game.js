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

// Утилита для маппинга строки сложности (приходит от ассистента) к внутреннему значению
function normalizeDifficulty(rawDifficulty) {
    if (!rawDifficulty || typeof rawDifficulty !== 'string') return null;
    const d = rawDifficulty.toLowerCase();
    if (['легкий', 'легкая', 'easy'].includes(d)) return 'easy';
    if (['средний', 'medium'].includes(d)) return 'medium';
    if (['сложный', 'тяжелый', 'hard'].includes(d)) return 'hard';
    return null; // неизвестное значение, оставляем без изменений
}

// Utility to shuffle array (Fisher-Yates)
function shuffleArray(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export const Game = ({ 
    assistant, 
    difficulty: parentDifficulty, 
    score: parentScore,
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
    const [startGameTrigger, setStartGameTrigger] = useState(false);

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
            const unsubData = assistant.on('data', (event) => {
                const actionData = event.smart_app_data || event.action || event.data || null;
                if (actionData) {
                    handleAssistantAction(actionData);
                }
            });

            const unsubCommand = assistant.on('command', (event) => {
                if (event && event.command && event.command.type === 'smart_app_data' && event.command.action) {
                    handleAssistantAction(event.command.action);
                }
            });

            return () => {
                unsubData && unsubData();
                unsubCommand && unsubCommand();
            };
        }
    }, [assistant]);

    // New useEffect to handle game start when countries are loaded
    useEffect(() => {
        if (startGameTrigger && !isLoading && availableCountries.length > 0) {
            console.log('startGameTrigger, isLoading, and availableCountries are ready. Calling handleStartGame.');
            handleStartGame();
            setStartGameTrigger(false);
        } else if (startGameTrigger && isLoading) {
            console.log('Waiting for countries to load before starting game...');
        } else if (startGameTrigger && !isLoading && availableCountries.length === 0) {
            console.error('Cannot start game: Countries not loaded or availableCountries is empty.');
            if (assistant) {
                assistant.sendData({
                    action: {
                        type: 'say_text',
                        text: 'Извините, не удалось загрузить страны для игры. Пожалуйста, попробуйте позже.',
                    },
                });
            }
            setStartGameTrigger(false);
        }
    }, [startGameTrigger, isLoading, availableCountries, assistant]);

    const handleAssistantAction = (action) => {
        switch (action.type) {
            case 'start_game':
                setStartGameTrigger(true);
                break;
            case 'set_difficulty': {
                const mapped = normalizeDifficulty(action.difficulty);
                console.log('handleAssistantAction: raw difficulty', action.difficulty, 'mapped to', mapped);
                if (mapped) {
                    setCurrentDifficulty(mapped);
                }
                break;
            }
            case 'restart_game':
                setStartGameTrigger(true);
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
            console.log('loadCountries: Setting isLoading to true.');
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
                    console.log('loadCountries: availableCountries set, length:', initialCountries.length);
                } else {
                    console.error('Не удалось загрузить страны из API');
                }
            } catch (error) {
                console.error('Ошибка при загрузке стран из API:', error);
            } finally {
                setIsLoading(false);
                console.log('loadCountries: Setting isLoading to false.');
            }
        }
        loadCountries();
    }, [currentDifficulty]);

    // Получение и фильтрация стран по сложности
    async function fetchCountries() {
        try {
            console.log('Отправка запроса к REST Countries API...');
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,population,area,translations');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Данные получены из API. Количество стран:', data.length);
            
            const countries = data.map(country => {
                const englishName = country.name.common;
                const russianName = country.translations?.rus?.common || getRussianName(englishName) || englishName;
                // Формируем URL флага: сначала берем PNG, если его нет – самостоятельно формируем путь с CDN,
                // в крайнем случае используем SVG.
                let flagUrl = '';
                if (country.cca2) {
                    flagUrl = `https://flagcdn.com/w320/${country.cca2.toLowerCase()}.png`;
                }
                if (!flagUrl) {
                    flagUrl = country.flags.png || country.flags.svg || '';
                }
                if (!flagUrl) {
                    flagUrl = 'https://via.placeholder.com/400x200?text=Flag';
                }
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
            
            // Remove duplicates & entries without flag
            const uniqueMap = new Map();
            countries.forEach(c => {
                if (!c.flag) return; // skip missing flag
                if (!uniqueMap.has(c.name.toLowerCase())) {
                    uniqueMap.set(c.name.toLowerCase(), c);
                }
            });
            const uniqueCountries = Array.from(uniqueMap.values());

            // Re-filter lists based on unique countries
            const easyCountries = uniqueCountries.filter(country => 
                popularCountries.some(popularName => 
                    country.russianName.toLowerCase() === popularName.toLowerCase() || 
                    country.name.toLowerCase() === popularName.toLowerCase()
                )
            );

            const mediumCountries = uniqueCountries.filter(country => 
                mediumPopularCountries.some(mediumName => 
                    country.russianName.toLowerCase() === mediumName.toLowerCase() || 
                    country.name.toLowerCase() === mediumName.toLowerCase()
                ) && 
                !easyCountries.some(easyCountry => easyCountry.name === country.name)
            );

            const hardCountries = uniqueCountries.filter(country => 
                !easyCountries.some(easyCountry => easyCountry.name === country.name) &&
                !mediumCountries.some(mediumCountry => mediumCountry.name === country.name)
            );

            return { 
                easyCountries: shuffleArray(easyCountries),
                mediumCountries: shuffleArray(mediumCountries),
                hardCountries: shuffleArray(hardCountries)
            };
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
            setShowGameOverScreen(true);
            setShowGameScreen(false);
        }
    };

    // Обработка ответа
    const handleAnswer = (answer) => {
        if (!currentCountry) return;
        const userAns = answer.trim().toLowerCase();
        const isCorrect = userAns === currentCountry.russianName.toLowerCase() ||
                          userAns === currentCountry.name.toLowerCase();
        if (isCorrect) {
            setCurrentScore(prev => prev + 1);
            let nextList = [...availableCountries];
            let nextCountry = null;
            // Find next distinct country with a different flag URL
            while(nextList.length && (!nextCountry || nextCountry.flag === currentCountry.flag)) {
                nextCountry = nextList.shift();
            }
            if (nextCountry) {
                setCurrentCountry(nextCountry);
                setAvailableCountries(nextList);
            } else {
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
                    <div className="home-header">
                        <span role="img" aria-label="world" className="logo">🌐</span>
                        <h1>Угадай флаг</h1>
                    </div>
                    <p className="sub-title">Проверь свои знания флагов стран мира!</p>

                    <div className="best-scores">
                        <h3><span role="img" aria-label="cup">🏆</span> Твои лучшие результаты:</h3>
                        <div className="scores-container">
                            <div className="score-card">
                                <span><span role="img" aria-label="runner">🏃</span> Легкий:</span>
                                <strong>{bestScores.easy}</strong>
                            </div>
                            <div className="score-card">
                                <span><span role="img" aria-label="user">👤</span> Средний:</span>
                                <strong>{bestScores.medium}</strong>
                            </div>
                            <div className="score-card">
                                <span><span role="img" aria-label="graduate">🎓</span> Сложный:</span>
                                <strong>{bestScores.hard}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="difficulty-section">
                         <h3><span role="img" aria-label="settings">⚙️</span> Выбери уровень сложности:</h3>
                        <div className="difficulty-selector">
                            <button
                                className={currentDifficulty === 'easy' ? 'active' : ''}
                                onClick={() => setCurrentDifficulty('easy')}
                            >
                                <span role="img" aria-label="runner">🏃</span> Легкий
                            </button>
                            <button
                                className={currentDifficulty === 'medium' ? 'active' : ''}
                                onClick={() => setCurrentDifficulty('medium')}
                            >
                                <span role="img" aria-label="user">👤</span> Средний
                            </button>
                            <button
                                className={currentDifficulty === 'hard' ? 'active' : ''}
                                onClick={() => setCurrentDifficulty('hard')}
                            >
                                <span role="img" aria-label="graduate">🎓</span> Сложный
                            </button>
                        </div>
                        <p className="difficulty-description">
                            <span role="img" aria-label="info">ℹ️</span>
                            {currentDifficulty === 'easy' && ' Самые популярные страны мира'}
                            {currentDifficulty === 'medium' && ' Популярные и менее известные страны'}
                            {currentDifficulty === 'hard' && ' Редко встречающиеся и экзотические страны'}
                        </p>
                    </div>

                    <button className="start-button" onClick={handleStartGame}>
                        ▶ НАЧАТЬ ИГРУ
                    </button>

                    <div className="rules-section">
                        <h3><span role="img" aria-label="info-alt">ℹ️</span> Как играть:</h3>
                        <ul>
                            <li>Тебе будет показан флаг страны</li>
                            <li>Введи название страны</li>
                            <li>Если ответ правильный, будет показан следующий флаг</li>
                            <li>Если ответ неправильный, игра заканчивается</li>
                            <li>Флаги не повторяются в одной игре</li>
                        </ul>
                    </div>

                    <div className="footer">Создано с <span style={{color: '#e74c3c'}}>❤️</span> | 2023 Угадай флаг</div>
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
                                const isoMatch = /\/([a-z]{2})\.(svg|png)$/i.exec(currentCountry.flag);
                                if (isoMatch) {
                                    const iso = isoMatch[1];
                                    const pngSrc = `https://flagcdn.com/w320/${iso}.png`;
                                    e.target.onerror = null; // prevent infinite loop
                                    e.target.src = pngSrc;
                                } else {
                                    console.error('Error loading flag:', currentCountry.flag);
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/400x200?text=Flag+Not+Found';
                                }
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
                    <p className="correct-answer">Правильный ответ: {correctAnswer}</p>
                    <div className="button-group">
                        <button onClick={handleStartGame}>
                            Играть снова
                        </button>
                        <button onClick={backToMenu}>
                            В главное меню
                        </button>
                    </div>
                </div>
            )}

            {showLevelCompleteScreen && (
                <div className="level-complete-screen">
                    <h2>Уровень пройден!</h2>
                    <p>Ваш счет: {currentScore}</p>
                    <div className="button-group">
                        <button onClick={goToNextLevel}>
                            Следующий уровень
                        </button>
                        <button onClick={backToMenu}>
                            В главное меню
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}; 