theme: /

    state: ОтветПользователя
        q!: (~ответить|~сказать|~назвать|~это) 
            [~флаг|~страна|~государство]
            $AnyText::answer
            
        script:
            var gameState = get_game_state(get_request($context));
            if (!gameState || gameState !== "playing") {
                $reactions.answer("Сначала начните игру!");
                return;
            }
            log('submitAnswer: context: ' + JSON.stringify($context))
            submitAnswer($parseTree._answer, $context);
            addGameControlSuggestions($context);
            $reactions.transition("/ОбработкаОтвета");
            
    state: ОбработкаОтвета
        event!: answer_submitted
        
        script:
            log('answerProcessed: context: ' + JSON.stringify($context))
            var eventData = $context && $context.request && $context.request.data && $context.request.data.eventData || {}
            var replyText = 'Проверка...';
            if (eventData.result === 'correct') {
                replyText = 'Верно!';
            } else if (eventData.result === 'wrong') {
                replyText = 'Неправильный ответ.';
            }
            $reactions.answer(replyText);
            addGameControlSuggestions($context);
            $reactions.transition("/ОтветПользователя");

        random:
            a: Ответ принят!
            a: Проверяю ответ!
            a: Сейчас проверю!