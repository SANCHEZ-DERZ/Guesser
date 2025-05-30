// Инициализация голосового ассистента и обработка сообщений из SC
function initVoiceAssistant() {
    if (typeof $jsapi !== 'undefined') {
        $jsapi.onReady(function() {
            $jsapi.onMessage(function(message) {
                if (message.type === 'showFlag') {
                    showFlag(message.payload);
                }
                // Можно добавить обработку других типов сообщений
            });
        });
    }
}

// Инициализация при загрузке страницы (если есть фронтенд)
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        initVoiceAssistant();
    });
} 