require: slotfilling/slotFilling.sc
  module = sys.zb-common
  
# Подключение javascript обработчиков
require: js/getters.js
require: js/reply.js
require: js/actions.js

# Подключение сценарных файлов
# Сначала подключаем файлы управления игрой
require: sc/startGame.sc
require: sc/setDifficulty.sc
require: sc/restartGame.sc

patterns:
    $AnyText = $nonEmptyGarbage
    $Difficulty = (легкий|средний|сложный)

theme: /
    state: Start
        # При запуске приложения с кнопки прилетит сообщение /start.
        q!: $regex</start>
        # При запуске приложения с голоса прилетит сказанная фраза.
        q!: (запусти | открой | вруби) Угадай флаг
        script:
            addGameControlSuggestions($context);
            if (!$session.isGreetingPlayed) {
                $session.isGreetingPlayed = true;
                $reactions.answer("Добро пожаловать в игру \"Угадай флаг\"! Выберите сложность или начните игру.");
            }
        go: /НачалоИгры

    state: Fallback
        event!: noMatch
        script:
            log('entryPoint: Fallback: context: ' + JSON.stringify($context))
            addGameControlSuggestions($context);
        a: Я не понимаю. Вы можете начать игру, выбрать сложность или перезапустить игру.

