theme: /

    state: УстановкаСложности
        q!: (установи|поставь|выбери) [~сложность|~уровень] $Difficulty
        
        script:
            log('setDifficulty: context: ' + JSON.stringify($context))
            setDifficulty($parseTree._Difficulty, $context);
            addGameControlSuggestions($context);
            
        random:
            a: Сложность установлена!
            a: Готово!
            a: Уровень сложности изменен!
            
    state: ЗапросСложности
        q!: (какая|какой) [~сложность|~уровень]
        
        script:
            var difficulty = get_difficulty(get_request($context));
            addDifficultySuggestions($context);
            
        a: Текущая сложность: {{difficulty}}