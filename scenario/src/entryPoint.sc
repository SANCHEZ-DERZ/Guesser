require: sc/flagGame.sc
require: js/flagGame.js

patterns:
    $AnyText = $nonEmptyGarbage

theme: /
    state: Start
        # При запуске приложения с кнопки прилетит сообщение /start.
        q!: $regex</start>
        # При запуске приложения с голоса прилетит сказанная фраза.
        # Если названме приложения отличается, то выполнится переход к состоянию Fallback, будет проиграно "Я не понимаю".
        # Обратите внимание, что если в названии приложения есть тире, их нужно заменить на пробелы ("my-canvas-test" -> "my canvas test")
        q!: (запусти | открой | вруби) Угадай флаг
        a: Начнём.
        go: Флаги_Старт 

    state: Fallback
        event!: noMatch
        script:
            log('entryPoint: Fallback: context: ' + JSON.stringify($context))
        a: Я не понимаю

