theme: /

    ### 1. Выбор уровня сложности
    state: ВыборСложности
        q!: (выбери|уровень|сложность|сложный|легкий|средний) $AnyText::difficulty
        script:
            log('Выбор сложности: ' + $parseTree._difficulty)
            setFlagDifficulty($parseTree._difficulty, $context)
            if ($jsapi && $jsapi.sendMessage) {
                $jsapi.sendMessage({ type: 'showFlag', payload: $context.flagUrl });
            }
            addSuggestions(["Начать игру"], $context)
        random:
            a: Сложность "{{ $parseTree._difficulty }}" выбрана!
            a: Уровень "{{ $parseTree._difficulty }}" установлен.

    ### 2. Начать игру
    state: НачатьИгру
        q!: (начать|старт|стартуй|запусти|игра|играть)
        script:
            log('Старт игры')
            startFlagGame($context)
            if ($jsapi && $jsapi.sendMessage) {
                $jsapi.sendMessage({ type: 'showFlag', payload: $context.flagUrl });
            }
            addSuggestions(["Это Франция", "Это Германия"], $context)
        random:
            a: Игра началась! Вот первый флаг.
            a: Поехали! Угадай страну по флагу.
        go: ПринятьОтвет

    ### 3. Принятие ответа пользователя
    state: ПринятьОтвет
        q!: * $AnyText::userAnswer *
        script:
            log('Ответ пользователя: ' + $parseTree._userAnswer)
            checkFlagAnswer($parseTree._userAnswer, $context)
            if ($jsapi && $jsapi.sendMessage) {
                $jsapi.sendMessage({ type: 'showFlag', payload: $context.flagUrl });
            }
        random:
            a: Проверяю ваш ответ...
            a: Сейчас узнаем, правильно ли!

    ### 4. Начать игру заново
    state: РестартИгры
        q!: (заново|сначала|рестарт|начать сначала|играть снова)
        script:
            log('Рестарт игры')
            restartFlagGame($context)
            if ($jsapi && $jsapi.sendMessage) {
                $jsapi.sendMessage({ type: 'showFlag', payload: $context.flagUrl });
            }
            addSuggestions(["Начать игру"], $context)
        random:
            a: Игра начата заново! Вот первый флаг.
            a: Начинаем сначала! Угадай страну по флагу.

    ### 5. Фолбэк
    state: NoMatch
        event: noMatch
        a: Извините, я не понял. Попробуйте выбрать уровень сложности или начать игру. 