theme: /

    state: ПерезапускИгры
        q!: (перезапусти|начать заново|начать сначала|сбросить) [~игру|~играть]
        
        script:
            log('restartGame: context: ' + JSON.stringify($context))
            restartGame($context);
            addGameControlSuggestions($context);
            
        random:
            a: Игра перезапущена!
            a: Начинаем заново!
            a: Сбросили игру! 