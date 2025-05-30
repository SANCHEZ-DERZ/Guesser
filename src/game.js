import React, { useEffect, useState, useRef } from 'react';
import initialize from './config';
import './styles.css';
    
    // Списки стран по уровням сложности
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

export const Game = () => {
    const [currentDifficulty, setCurrentDifficulty] = useState('easy');
    const [currentScore, setCurrentScore] = useState(0);
    const [bestScores, setBestScores] = useState(() => {
        const savedScores = localStorage.getItem('bestScores');
        return savedScores ? JSON.parse(savedScores) : {
            easy: 0,
            medium: 0,
            hard: 0
        };
    });
    const [allCountries, setAllCountries] = useState([]); // Храним все загруженные страны
    const [availableCountries, setAvailableCountries] = useState([]); // Страны для текущей игры
    const [showHomeScreen, setShowHomeScreen] = useState(true);
    const [showGameScreen, setShowGameScreen] = useState(false);
    const [showGameOverScreen, setShowGameOverScreen] = useState(false);
    const [showLevelCompleteScreen, setShowLevelCompleteScreen] = useState(false);
    const [currentCountry, setCurrentCountry] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [recoveryState, setRecoveryState] = useState(null);
    const assistantRef = useRef(null);

    const answerInputRef = useRef(null);
    const flagImageRef = useRef(null);

    // Сохранение лучших результатов в localStorage при их изменении
    useEffect(() => {
        localStorage.setItem('bestScores', JSON.stringify(bestScores));
    }, [bestScores]);

    // Initialize Assistant
    useEffect(() => {
        let unsubscribe = null;

        try {
            // Initialize assistant
            const assistant = initialize(
                () => ({
                    currentDifficulty,
                    currentScore,
                    bestScores,
                    availableCountries: availableCountries.length
                }),
                () => recoveryState
            );

            assistantRef.current = assistant;

            // Handle assistant commands
            unsubscribe = assistant.on('data', (command) => {
                if (command.navigation) {
                    switch(command.navigation.command) {
                        case 'UP':
                            window.scrollTo(0, 0);
                            break;
                        case 'DOWN':
                            window.scrollBy(0, 1000);
                            break;
                    }
                }
            });

            // Handle assistant errors
            assistant.on('error', (error) => {
                console.error('Assistant error:', error);
            });

        } catch (error) {
            console.error('Failed to initialize assistant:', error);
        }

        // Cleanup on unmount
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, []);

    // Загрузка стран при монтировании компонента
    useEffect(() => {
        async function loadCountries() {
            const countriesData = await fetchCountries();
            if (countriesData) {
                setAllCountries(countriesData);
            }
        }
        loadCountries();
    }, []); // Пустой массив зависимостей - эффект выполняется один раз при монтировании

    // Инициализация пула доступных стран при смене уровня или загрузке всех стран
    useEffect(() => {
        if (allCountries.easyCountries && allCountries.easyCountries.length > 0) { // Проверка, что страны загружены
            let newAvailableCountries = [];
            switch(currentDifficulty) {
                case 'easy':
                    newAvailableCountries = [...allCountries.easyCountries];
                    break;
                case 'medium':
                    newAvailableCountries = [...allCountries.mediumCountries];
                    break;
                case 'hard':
                    newAvailableCountries = [...allCountries.hardCountries];
                    break;
                default:
                    newAvailableCountries = [...allCountries.easyCountries];
            }
            setAvailableCountries(newAvailableCountries);
        }
    }, [currentDifficulty, allCountries]); // Зависит от текущего уровня и всех загруженных стран

    // Получение и фильтрация стран по сложности (изменена логика возврата всех стран)
    async function fetchCountries() {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,population,area');
            const data = await response.json();
            
            const countries = data.map(country => {
                const englishName = country.name.common.toLowerCase();
                const russianName = getRussianName(englishName);
                
                return {
                    name: englishName,
                    russianName: russianName || englishName,
                    flag: country.flags.png,
                    population: country.population || 0,
                    area: country.area || 0
                };
            });
            
            // Refined filtering logic based on popular and medium lists
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
            
            // Log counts for verification during development
            console.log(`Fetched countries: ${countries.length}`);
            console.log(`Easy countries: ${easyCountries.length}`);
            console.log(`Medium countries: ${mediumCountries.length}`);
            console.log(`Hard countries: ${hardCountries.length}`);

            return { easyCountries, mediumCountries, hardCountries };
        } catch (error) {
            console.error('Ошибка при получении данных о странах:', error);
            // Возвращаем пустые массивы при ошибке, чтобы избежать сбоя
            return { easyCountries: [], mediumCountries: [], hardCountries: [] };
        }
    }

    // Получение случайной страны из доступных
    function getRandomCountry() {
        if (availableCountries.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * availableCountries.length);
        const selectedCountry = availableCountries[randomIndex];
        
        // Удаляем выбранную страну из доступных
        const newAvailableCountries = availableCountries.filter((_, index) => index !== randomIndex);
        setAvailableCountries(newAvailableCountries);
        
        return selectedCountry;
    }

    // Отображение случайного флага
    function displayRandomFlag() {
        const country = getRandomCountry();
        
        if (country === null) {
            levelComplete();
            return;
        }
        
        setCurrentCountry(country);
        setUserAnswer('');
        if (answerInputRef.current) {
            answerInputRef.current.focus();
        }
        
        if (flagImageRef.current) {
            flagImageRef.current.classList.add('new-flag');
        setTimeout(() => {
                flagImageRef.current.classList.remove('new-flag');
        }, 500);
        }
    }

    // Проверка ответа
    function checkAnswer() {
        const userAnswerLower = userAnswer.trim().toLowerCase();
        
        if (currentCountry && (userAnswerLower === currentCountry.russianName || userAnswerLower === currentCountry.name)) {
            // Правильный ответ
            setCurrentScore(prevScore => prevScore + 1);
            displayRandomFlag();
        } else {
            // Неправильный ответ - игра окончена
            setShowGameScreen(false);
            setShowGameOverScreen(true);
            if (currentCountry) { // Проверяем наличие currentCountry перед использованием
                 setCorrectAnswer(currentCountry.russianName);
            } else {
                 setCorrectAnswer('Название страны не определено'); // Обработка случая, если currentCountry null
            }
            
            // Вибрация для неправильного ответа
            if (navigator.vibrate) {
                navigator.vibrate(200);
            }
            
            // Обновляем лучший результат
            updateBestScore();
        }
    }

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

    // Начало игры
    const handleStartGame = () => {
        setShowHomeScreen(false);
        setShowGameScreen(true);
        setShowGameOverScreen(false);
        setShowLevelCompleteScreen(false);
        setCurrentScore(0);
        setCurrentCountry(null);
        setUserAnswer('');

        // Инициализируем доступные страны для новой игры с текущей сложностью
        let countriesForGame = [];
        switch(currentDifficulty) {
             case 'easy':
                 countriesForGame = [...allCountries.easyCountries];
                 break;
             case 'medium':
                 countriesForGame = [...allCountries.mediumCountries];
                 break;
             case 'hard':
                 countriesForGame = [...allCountries.hardCountries];
                 break;
             default:
                 countriesForGame = [...allCountries.easyCountries];
        }
         setAvailableCountries(countriesForGame);
        
        // Отображаем первый флаг
        displayRandomFlag();

        // Отправляем сообщение ассистенту о начале игры
        if (assistantRef.current) {
            assistantRef.current.sendData({
                action: {
                    type: 'GAME_STARTED',
                    payload: { difficulty: currentDifficulty }
                }
            });
        }
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
        // Игра начнется автоматически после смены currentDifficulty благодаря useEffect
    }

    // Возврат в главное меню
    function backToMenu() {
        setShowGameOverScreen(false);
        setShowLevelCompleteScreen(false);
        setShowHomeScreen(true);
        // При возврате в меню, инициализируем страны для текущей сложности
         if (allCountries.easyCountries && allCountries.easyCountries.length > 0) {
             let countriesForMenu = [];
             switch(currentDifficulty) {
                 case 'easy':
                     countriesForMenu = [...allCountries.easyCountries];
                     break;
                 case 'medium':
                     countriesForMenu = [...allCountries.mediumCountries];
                     break;
                 case 'hard':
                     countriesForMenu = [...allCountries.hardCountries];
                     break;
                 default:
                     countriesForMenu = [...allCountries.easyCountries];
             }
              setAvailableCountries(countriesForMenu);
         }
    }

    // Обработка завершения уровня
    function levelComplete() {
        setShowGameScreen(false);
        setShowLevelCompleteScreen(true);
        updateBestScore();
    }

    // Обработка изменения сложности (уже использует setCurrentDifficulty)
    // function setDifficulty(difficulty) {
    //     setCurrentDifficulty(difficulty);
    // }

    // Функция создания конфетти (оставлена для возможного использования)
    function createConfetti() {
        const confettiContainer = document.querySelector('.confetti');
         if (!confettiContainer) return; // Проверка наличия элемента
        confettiContainer.innerHTML = '';
        
        const particleCount = 100;
        const colors = ['#4CAF50', '#2196F3', '#ff9800', '#9c27b0', '#f44336', '#ffeb3b'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('confetti-particle');
            
            const size = Math.floor(Math.random() * 10) + 5;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const left = Math.random() * 100;
            const duration = Math.random() * 3 + 2;
            const delay = Math.random() * 2;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.backgroundColor = color;
            particle.style.left = `${left}%`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            
            confettiContainer.appendChild(particle);
        }
    }

    return (
        <div className="container">
            <div className="globe-icon">
                <i className="fas fa-globe-americas"></i>
            </div>
            <h1>Угадай флаг</h1>

            {showHomeScreen && (
                <div id="home-screen">
                    <p>Проверь свои знания флагов стран мира!</p>
                    
                    <div className="best-scores">
                        <p><i className="fas fa-trophy"></i> Твои лучшие результаты:</p>
                        <div className="scores-grid">
                            <div className="score-item">
                                <span><i className="fas fa-child"></i> Легкий:</span>
                                <span id="best-score-easy">{bestScores.easy}</span>
                            </div>
                            <div className="score-item">
                                <span><i className="fas fa-user"></i> Средний:</span>
                                <span id="best-score-medium">{bestScores.medium}</span>
                            </div>
                            <div className="score-item">
                                <span><i className="fas fa-user-graduate"></i> Сложный:</span>
                                <span id="best-score-hard">{bestScores.hard}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="difficulty-container">
                        <h3><i className="fas fa-cog"></i> Выбери уровень сложности:</h3>
                        <div className="difficulty-options">
                            <button 
                                className={`difficulty-btn ${currentDifficulty === 'easy' ? 'selected' : ''}`}
                                onClick={() => setCurrentDifficulty('easy')}
                            >
                                <i className="fas fa-child"></i> Легкий
                            </button>
                            <button 
                                className={`difficulty-btn ${currentDifficulty === 'medium' ? 'selected' : ''}`}
                                onClick={() => setCurrentDifficulty('medium')}
                            >
                                <i className="fas fa-user"></i> Средний
                            </button>
                            <button 
                                className={`difficulty-btn ${currentDifficulty === 'hard' ? 'selected' : ''}`}
                                onClick={() => setCurrentDifficulty('hard')}
                            >
                                <i className="fas fa-user-graduate"></i> Сложный
                            </button>
                        </div>
                        <p id="difficulty-description">
                            <i className="fas fa-info-circle"></i> {
                                currentDifficulty === 'easy' ? 'Самые популярные страны мира' :
                                currentDifficulty === 'medium' ? 'Страны средней известности' :
                                'Редкие и малоизвестные страны'
                            }
                        </p>
                    </div>
                    
                    <button id="start-game" onClick={handleStartGame}>
                        <i className="fas fa-play"></i> Начать игру
                    </button>
                    
                    <div className="app-info">
                        <p><i className="fas fa-info-circle"></i> Как играть:</p>
                        <ul>
                            <li>Тебе будет показан флаг страны</li>
                            <li>Введи название страны</li>
                            <li>Если ответ правильный, будет показан следующий флаг</li>
                            <li>Если ответ неправильный, игра заканчивается</li>
                            <li>Флаги не повторяются в одной игре</li>
                        </ul>
                    </div>
                </div>
            )}

            {showGameScreen && (
                <div id="game-screen">
                    <div className="info-bar">
                        <div id="score-container">
                            <i className="fas fa-star"></i> Текущий счет: <span id="current-score">{currentScore}</span>
                        </div>
                        <div id="difficulty-label">
                            <i className="fas fa-cog"></i> Уровень: <span id="current-difficulty">
                                {currentDifficulty === 'easy' ? 'Легкий' : 
                                 currentDifficulty === 'medium' ? 'Средний' : 'Сложный'}
                            </span>
                        </div>
                        <div id="remaining-flags">
                            <i className="fas fa-flag"></i> Осталось флагов: <span id="flags-left">{availableCountries.length}</span>
                        </div>
                    </div>
                    <div id="flag-container">
                        <div className="flag-wrapper">
                            <img 
                                ref={flagImageRef}
                                id="flag-image" 
                                src={currentCountry?.flag} 
                                alt="Флаг страны" 
                            />
                        </div>
                    </div>
                    <div id="answer-container">
                        <input 
                            ref={answerInputRef}
                            type="text" 
                            id="answer-input" 
                            placeholder="Введите название страны..."
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                        />
                        <button id="submit-answer" onClick={checkAnswer}>
                            <i className="fas fa-check"></i> Проверить
                        </button>
                    </div>
                </div>
            )}

            {showGameOverScreen && (
                <div id="game-over-screen">
                    <div className="result-icon error">
                        <i className="fas fa-times-circle"></i>
                    </div>
                    <h2>Игра окончена!</h2>
                    <p>Ваш счет: <span id="final-score">{currentScore}</span></p>
                    <p>Правильный ответ: <span id="correct-answer">{correctAnswer}</span></p>
                    <button id="play-again" onClick={handleStartGame}>
                        <i className="fas fa-redo"></i> Играть снова
                    </button>
                    <button id="back-to-menu" onClick={backToMenu}>
                        <i className="fas fa-home"></i> В главное меню
                    </button>
                </div>
            )}

            {showLevelCompleteScreen && (
                <div id="level-complete-screen">
                    <div className="result-icon success">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <h2>Уровень пройден!</h2>
                    <div className="confetti"></div>
                    <p>Поздравляем! Вы угадали все флаги на уровне <span id="completed-difficulty">
                        {currentDifficulty === 'easy' ? 'Легкий' : 
                         currentDifficulty === 'medium' ? 'Средний' : 'Сложный'}
                    </span>!</p>
                    <p>Ваш счет: <span id="level-score">{currentScore}</span></p>
                    
                    {currentDifficulty !== 'hard' && (
                        <div id="next-level-container">
                            <p><i className="fas fa-level-up-alt"></i> Хотите перейти к следующему уровню сложности?</p>
                            <button id="next-level-btn" onClick={goToNextLevel}>
                                <i className="fas fa-arrow-right"></i> Перейти к следующему уровню
                            </button>
                        </div>
                    )}
                    
                    <button id="level-complete-menu-btn" onClick={backToMenu}>
                        <i className="fas fa-home"></i> В главное меню
                    </button>
                </div>
            )}

            <footer>
                <p>Создано с <i className="fas fa-heart"></i> | 2025 Угадай флаг</p>
            </footer>
        </div>
    );
}; 