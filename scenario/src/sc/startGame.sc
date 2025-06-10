theme: /

    state: НачалоИгры
        q!: $regex</start>
        q!: (начни|запусти|старт|начать) [~игру|~играть]
        q!: (давай|давайте) [~играть|~игру]
        q!: (начать|начни) [~игру|~играть]
        
        script:
            log('startGame: context: ' + JSON.stringify($context))
            startGame($context);
            addGameControlSuggestions($context);
            
        random:
            a: Начинаем игру!
            a: Игра запущена!
            a: Погнали играть! 