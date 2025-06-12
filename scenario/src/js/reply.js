function reply(body, response) {
    // Убедимся, что в body присутствует объект app_info с applicationId,
    // так как плеер ассистента ожидает это поле, иначе возникает ошибка
    body.app_info = body.app_info || { applicationId: "stub" };

    // Также проконтролируем наличие app_info внутри каждого элемента items
    if (Array.isArray(body.items)) {
        body.items = body.items.map(function (it) {
            if (!it.app_info) {
                it.app_info = { applicationId: "stub" };
            }
            // Если элемент содержит команду, в которую также может требоваться app_info
            if (it.command && !it.command.app_info) {
                it.command.app_info = { applicationId: "stub" };
            }
            return it;
        });
    }

    var replyData = {
        type: "raw",
        body: body
    };    
    response.replies = response.replies || [];
    response.replies.push(replyData);
}

function addGameSuggestions(suggestions, context) {
    var buttons = [];
    
    suggestions.forEach(function(suggest) {
        buttons.push({
            action: {
                text: suggest,
                type: "text"
            },
            title: suggest
        });
    });
    
    reply({"suggestions": {"buttons": buttons}}, context.response);
}

function addDifficultySuggestions(context) {
    var difficulties = ["Легкий", "Средний", "Сложный"];
    addGameSuggestions(difficulties, context);
}

function addGameControlSuggestions(context) {
    var controls = ["Начать игру", "Перезапустить", "Изменить сложность"];
    addGameSuggestions(controls, context);
} 