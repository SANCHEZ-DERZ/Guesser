# Угадай флаг

Интерактивная игра на React, где игрок угадывает страны по их флагам. Приложение интегрируется с голосовым ассистентом Sber («Салют») и использует REST Countries API для получения актуальных данных о странах.

## Быстрый старт

```bash
# установка зависимостей
npm i

# запуск в режиме разработки
npm start

# production-сборка
npm run build
```

Приложение будет доступно на `http://localhost:3000`.

---

## Архитектура

```
src/
├── App.js         # инициализация ассистента, корневой компонент
├── game.js        # основной игровой процесс
├── styles.css     # стили
└── index.js       # точка входа React
```

### 1. Инициализация ассистента (App.js)
Ассистент создаётся один раз при монтировании приложения:

```js
// App.js (фрагмент)
const initializeAssistant = (getState) => {
  if (process.env.NODE_ENV === 'development') {
    return createSmartappDebugger({ /* ... */ });
  }
  return createAssistant({ getState });
};
```

После инициализации экземпляр ассистента передаётся в компонент `<Game />` через проп `assistant`.

### 2. Основной цикл игры (game.js)

Компонент `Game` управляет всей логикой. На верхнем уровне он хранит локальные состояния:

```js
// game.js (фрагмент)
const [currentDifficulty, setCurrentDifficulty] = useState('easy');
const [availableCountries, setAvailableCountries] = useState([]); // очередь флагов
const [currentCountry, setCurrentCountry]     = useState(null);  // текущий вопрос
const [currentScore,   setCurrentScore]       = useState(0);     // счёт игрока
const [showGameScreen, setShowGameScreen]     = useState(false); // экраны
```

#### 2.1 Загрузка и фильтрация стран

При выборе уровня сложности выполняется единственный запрос к REST Countries API:

```js
async function fetchCountries() {
  const response = await fetch(
    'https://restcountries.com/v3.1/all?fields=name,flags,translations,cca2'
  );
  const data = await response.json();
  // ➊ сопоставляем русские названия
  // ➋ формируем URL флага
  // ➌ фильтруем страны по сложности
  return {
    easyCountries:   shuffleArray(easyList),
    mediumCountries: shuffleArray(mediumList),
    hardCountries:   shuffleArray(hardList),
  };
}
```

*Готовые списки стран кэшируются в `state`, поэтому повторных запросов нет.*

#### 2.2 Старт игры

```js
const handleStartGame = () => {
  setShowGameScreen(true);
  setCurrentScore(0);
  // первая страна — первый элемент очереди
  setCurrentCountry(countriesQueue[0]);
  setAvailableCountries(countriesQueue.slice(1));
};
```

#### 2.3 Проверка ответа

```js
const handleAnswer = (answer) => {
  const isCorrect = answer.toLowerCase() === currentCountry.russianName.toLowerCase();
  if (isCorrect) {
    setCurrentScore(prev => prev + 1);
    // переходим к следующему флагу
    setCurrentCountry(availableCountries[0]);
    setAvailableCountries(availableCountries.slice(1));
  } else {
    // завершение игры
    setShowGameOverScreen(true);
  }
};
```

#### 2.4 Хранение лучших результатов

Лучшие результаты записываются в `localStorage` и отображаются на главном экране:

```js
useEffect(() => {
  localStorage.setItem('bestScores', JSON.stringify(bestScores));
}, [bestScores]);
```

#### 2.5 Мульти-уровневая прогрессия

После угадывания **всех** флагов текущего уровня показывается экран «Уровень пройден», откуда игрок может:

1. перейти к следующей сложности (`goToNextLevel`),
2. вернуться в главное меню.

---

## Интеграция с голосовым ассистентом

Ассистент отправляет в игру события `data` / `command`. Парсер конвертирует их в внутренние экшены:

```js
const handleAssistantAction = (action) => {
  switch (action.type) {
    case 'start_game':   setStartGameTrigger(true); break;
    case 'set_difficulty': setCurrentDifficulty(normalizeDifficulty(action.difficulty)); break;
  }
};
```

Ассистент управляет запуском и уровнем сложности ("Начни игру", "Сложность — средняя" и т. д.), а ответы вводятся в текстовом поле приложения.

---

## Особенности реализации

* Используется React Hooks без сторонних стейт-менеджеров.  
* Флаги загружаются в формате PNG с CDN `flagcdn.com`; при ошибке автоматически подставляется резервная SVG/заглушка.  
* Отладка ассистента включается автоматически в режиме `development`.

---

## Лицензия

MIT 