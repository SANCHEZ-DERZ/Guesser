document.addEventListener('DOMContentLoaded', () => {
    // DOM элементы
    const homeScreen = document.getElementById('home-screen');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const levelCompleteScreen = document.getElementById('level-complete-screen');
    
    const startGameBtn = document.getElementById('start-game');
    const submitAnswerBtn = document.getElementById('submit-answer');
    const playAgainBtn = document.getElementById('play-again');
    const backToMenuBtn = document.getElementById('back-to-menu');
    const nextLevelBtn = document.getElementById('next-level-btn');
    const levelCompleteMenuBtn = document.getElementById('level-complete-menu-btn');
    
    const answerInput = document.getElementById('answer-input');
    const flagImage = document.getElementById('flag-image');
    const currentScoreElement = document.getElementById('current-score');
    const finalScoreElement = document.getElementById('final-score');
    const correctAnswerElement = document.getElementById('correct-answer');
    const difficultyDescription = document.getElementById('difficulty-description');
    const currentDifficultyElement = document.getElementById('current-difficulty');
    const completedDifficultyElement = document.getElementById('completed-difficulty');
    const levelScoreElement = document.getElementById('level-score');
    const flagsLeftElement = document.getElementById('flags-left');
    
    // Элементы для лучших результатов
    const bestScoreEasyElement = document.getElementById('best-score-easy');
    const bestScoreMediumElement = document.getElementById('best-score-medium');
    const bestScoreHardElement = document.getElementById('best-score-hard');
    
    // Кнопки выбора сложности
    const easyModeBtn = document.getElementById('easy-mode');
    const mediumModeBtn = document.getElementById('medium-mode');
    const hardModeBtn = document.getElementById('hard-mode');
    
    // Игровые переменные
    let countries = [];
    let easyCountries = [];
    let mediumCountries = [];
    let hardCountries = [];
    let availableCountries = []; // Страны, доступные для текущей игры
    let currentCountry = null;
    let currentScore = 0;
    
    // Лучшие результаты для каждого уровня сложности
    let bestScores = {
        easy: localStorage.getItem('bestScoreEasy') || 0,
        medium: localStorage.getItem('bestScoreMedium') || 0,
        hard: localStorage.getItem('bestScoreHard') || 0
    };
    
    let currentDifficulty = 'easy'; // По умолчанию - легкий уровень

    // Отображение лучших результатов из localStorage
    bestScoreEasyElement.textContent = bestScores.easy;
    bestScoreMediumElement.textContent = bestScores.medium;
    bestScoreHardElement.textContent = bestScores.hard;
    
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
        // Словарь с русскими названиями некоторых стран
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
            'bulgaria': 'болгария',
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
            'cyprus': 'кипр'
        };
        
        return countryTranslations[englishName.toLowerCase()] || '';
    }

    // Получение и фильтрация стран по сложности
    async function fetchCountries() {
        try {
            const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,population,area');
            const data = await response.json();
            
            countries = data.map(country => {
                const englishName = country.name.common.toLowerCase();
                const russianName = getRussianName(englishName);
                
                return {
                    name: englishName,
                    russianName: russianName || englishName, // Если перевода нет, используем английское
                    flag: country.flags.png,
                    population: country.population || 0,
                    area: country.area || 0
                };
            });
            
            // Фильтруем страны по популярности
            easyCountries = countries.filter(country => 
                popularCountries.includes(country.russianName)
            );
            
            mediumCountries = countries.filter(country => 
                mediumPopularCountries.includes(country.russianName)
            );
            
            // Находим непопулярные страны (не входящие в первые два списка)
            hardCountries = countries.filter(country => 
                !popularCountries.includes(country.russianName) && 
                !mediumPopularCountries.includes(country.russianName)
            );
            
            return true;
        } catch (error) {
            console.error('Ошибка при получении данных о странах:', error);
            return false;
        }
    }

    // Инициализация пула доступных стран в зависимости от сложности
    function initializeAvailableCountries() {
        switch(currentDifficulty) {
            case 'easy':
                availableCountries = [...easyCountries];
                break;
            case 'medium':
                availableCountries = [...mediumCountries];
                break;
            case 'hard':
                availableCountries = [...hardCountries];
                break;
            default:
                availableCountries = [...easyCountries];
        }
        
        // Если пул стран пуст (например, если API не вернул данные),
        // используем все доступные страны
        if (availableCountries.length === 0) {
            availableCountries = [...countries];
        }
        
        // Обновляем счетчик оставшихся флагов
        flagsLeftElement.textContent = availableCountries.length;
    }

    // Получение случайной страны из доступных (без повторения)
    function getRandomCountry() {
        if (availableCountries.length === 0) {
            // Все страны использованы - уровень пройден!
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * availableCountries.length);
        const selectedCountry = availableCountries[randomIndex];
        
        // Удаляем выбранную страну из доступных
        availableCountries.splice(randomIndex, 1);
        
        // Обновляем счетчик оставшихся флагов
        flagsLeftElement.textContent = availableCountries.length;
        
        return selectedCountry;
    }

    // Отображение случайного флага
    function displayRandomFlag() {
        currentCountry = getRandomCountry();
        
        // Проверка на завершение уровня
        if (currentCountry === null) {
            levelComplete();
            return;
        }
        
        flagImage.src = currentCountry.flag;
        answerInput.value = '';
        answerInput.focus();
        
        // Добавляем анимацию при загрузке нового флага
        flagImage.classList.add('new-flag');
        setTimeout(() => {
            flagImage.classList.remove('new-flag');
        }, 500);
    }

    // Проверка ответа
    function checkAnswer() {
        const userAnswer = answerInput.value.trim().toLowerCase();
        
        // Проверяем как русское, так и английское названия
        if (userAnswer === currentCountry.russianName || userAnswer === currentCountry.name) {
            // Правильный ответ
            currentScore++;
            currentScoreElement.textContent = currentScore;
            
            // Эффект при правильном ответе
            flashElement(currentScoreElement.parentElement, 'correct-answer-flash');
            
            displayRandomFlag();
        } else {
            // Неправильный ответ - игра окончена
            gameScreen.classList.add('hidden');
            gameOverScreen.classList.remove('hidden');
            
            finalScoreElement.textContent = currentScore;
            correctAnswerElement.textContent = currentCountry.russianName;
            
            // Вибрация для неправильного ответа
            vibrate();
            
            // Обновляем лучший результат, если текущий счет выше
            updateBestScore();
        }
    }

    // Эффект вибрации для устройств, которые поддерживают
    function vibrate() {
        if (navigator.vibrate) {
            navigator.vibrate(200);
        }
    }

    // Функция создания анимации мигания для элемента
    function flashElement(element, className) {
        element.classList.add(className);
        setTimeout(() => {
            element.classList.remove(className);
        }, 500);
    }

    // Создание конфетти для празднования завершения уровня
    function createConfetti() {
        const confettiContainer = document.querySelector('.confetti');
        confettiContainer.innerHTML = '';
        
        // Создаем больше частиц конфетти
        const particleCount = 100;
        const colors = ['#4CAF50', '#2196F3', '#ff9800', '#9c27b0', '#f44336', '#ffeb3b'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('confetti-particle');
            
            // Рандомизируем позицию, цвет, размер и анимацию
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

    // Обработка завершения уровня (все флаги угаданы)
    function levelComplete() {
        gameScreen.classList.add('hidden');
        levelCompleteScreen.classList.remove('hidden');
        
        // Показываем результат и уровень
        levelScoreElement.textContent = currentScore;
        
        let difficultyText = 'Легкий';
        switch(currentDifficulty) {
            case 'medium':
                difficultyText = 'Средний';
                break;
            case 'hard':
                difficultyText = 'Сложный';
                break;
        }
        completedDifficultyElement.textContent = difficultyText;
        
        // Обновляем лучший результат
        updateBestScore();
        
        // Создаем конфетти для празднования
        createConfetti();
        
        // Скрываем кнопку следующего уровня, если текущий уровень - сложный
        if (currentDifficulty === 'hard') {
            document.getElementById('next-level-container').classList.add('hidden');
        } else {
            document.getElementById('next-level-container').classList.remove('hidden');
        }
    }

    // Обновление лучшего результата
    function updateBestScore() {
        let updateNeeded = false;
        
        switch(currentDifficulty) {
            case 'easy':
                if (currentScore > bestScores.easy) {
                    bestScores.easy = currentScore;
                    localStorage.setItem('bestScoreEasy', bestScores.easy);
                    bestScoreEasyElement.textContent = bestScores.easy;
                    updateNeeded = true;
                }
                break;
            case 'medium':
                if (currentScore > bestScores.medium) {
                    bestScores.medium = currentScore;
                    localStorage.setItem('bestScoreMedium', bestScores.medium);
                    bestScoreMediumElement.textContent = bestScores.medium;
                    updateNeeded = true;
                }
                break;
            case 'hard':
                if (currentScore > bestScores.hard) {
                    bestScores.hard = currentScore;
                    localStorage.setItem('bestScoreHard', bestScores.hard);
                    bestScoreHardElement.textContent = bestScores.hard;
                    updateNeeded = true;
                }
                break;
        }
        
        return updateNeeded;
    }

    // Начало игры
    async function startGame() {
        homeScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        gameOverScreen.classList.add('hidden');
        levelCompleteScreen.classList.add('hidden');
        
        currentScore = 0;
        currentScoreElement.textContent = currentScore;
        
        // Установка отображаемого текущего уровня сложности
        switch(currentDifficulty) {
            case 'easy':
                currentDifficultyElement.textContent = 'Легкий';
                break;
            case 'medium':
                currentDifficultyElement.textContent = 'Средний';
                break;
            case 'hard':
                currentDifficultyElement.textContent = 'Сложный';
                break;
        }
        
        // Получаем страны, если еще не получили
        if (countries.length === 0) {
            // Показываем загрузку
            showLoading();
            const success = await fetchCountries();
            
            // Скрываем загрузку
            hideLoading();
            
            if (!success) {
                alert('Ошибка при загрузке данных. Пожалуйста, проверьте ваше интернет-соединение и попробуйте снова.');
                backToMenu();
                return;
            }
        }
        
        // Инициализируем пул доступных стран
        initializeAvailableCountries();
        
        // Отображаем первый флаг
        displayRandomFlag();
    }
    
    // Функции для отображения/скрытия индикатора загрузки
    function showLoading() {
        const loadingEl = document.createElement('div');
        loadingEl.id = 'loading-indicator';
        loadingEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка данных...';
        loadingEl.style.position = 'fixed';
        loadingEl.style.top = '50%';
        loadingEl.style.left = '50%';
        loadingEl.style.transform = 'translate(-50%, -50%)';
        loadingEl.style.backgroundColor = 'rgba(0,0,0,0.7)';
        loadingEl.style.color = 'white';
        loadingEl.style.padding = '20px';
        loadingEl.style.borderRadius = '10px';
        loadingEl.style.zIndex = '9999';
        
        document.body.appendChild(loadingEl);
    }
    
    function hideLoading() {
        const loadingEl = document.getElementById('loading-indicator');
        if (loadingEl) {
            loadingEl.remove();
        }
    }
    
    // Переход к следующему уровню сложности
    function goToNextLevel() {
        switch(currentDifficulty) {
            case 'easy':
                setDifficulty('medium');
                break;
            case 'medium':
                setDifficulty('hard');
                break;
        }
        
        startGame();
    }
    
    // Возврат в главное меню
    function backToMenu() {
        gameOverScreen.classList.add('hidden');
        levelCompleteScreen.classList.add('hidden');
        homeScreen.classList.remove('hidden');
    }
    
    // Обработчики изменения сложности
    function setDifficulty(difficulty) {
        // Сбрасываем выделение со всех кнопок
        easyModeBtn.classList.remove('selected');
        mediumModeBtn.classList.remove('selected');
        hardModeBtn.classList.remove('selected');
        
        currentDifficulty = difficulty;
        
        // Устанавливаем соответствующее описание и выделяем кнопку
        switch(difficulty) {
            case 'easy':
                easyModeBtn.classList.add('selected');
                difficultyDescription.innerHTML = '<i class="fas fa-info-circle"></i> Самые популярные страны мира';
                break;
            case 'medium':
                mediumModeBtn.classList.add('selected');
                difficultyDescription.innerHTML = '<i class="fas fa-info-circle"></i> Страны средней известности';
                break;
            case 'hard':
                hardModeBtn.classList.add('selected');
                difficultyDescription.innerHTML = '<i class="fas fa-info-circle"></i> Редкие и малоизвестные страны';
                break;
        }
    }

    // Слушатели событий
    startGameBtn.addEventListener('click', startGame);
    
    submitAnswerBtn.addEventListener('click', checkAnswer);
    
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    playAgainBtn.addEventListener('click', startGame);
    backToMenuBtn.addEventListener('click', backToMenu);
    levelCompleteMenuBtn.addEventListener('click', backToMenu);
    nextLevelBtn.addEventListener('click', goToNextLevel);
    
    // Слушатели для кнопок выбора сложности
    easyModeBtn.addEventListener('click', () => setDifficulty('easy'));
    mediumModeBtn.addEventListener('click', () => setDifficulty('medium'));
    hardModeBtn.addEventListener('click', () => setDifficulty('hard'));
    
    // Инициализация - загружаем страны при загрузке страницы
    fetchCountries();
    
    // Добавляем стили для анимации новых флагов
    const styleSheet = document.createElement('style');
    styleSheet.innerHTML = `
        @keyframes newFlagAnimation {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        
        .new-flag {
            animation: newFlagAnimation 0.5s ease-out;
        }
        
        @keyframes correctAnswerFlash {
            0% { background-color: #e8f5e9; }
            50% { background-color: #4CAF50; color: white; }
            100% { background-color: #e8f5e9; }
        }
        
        .correct-answer-flash {
            animation: correctAnswerFlash 0.5s;
        }
        
        .confetti-particle {
            position: absolute;
            top: -10px;
            border-radius: 50%;
            animation: confetti-fall linear forwards;
        }
        
        @keyframes confetti-fall {
            0% { transform: translateY(0) rotate(0); opacity: 1; }
            100% { transform: translateY(500px) rotate(720deg); opacity: 0; }
        }
    `;
    document.head.appendChild(styleSheet);
}); 