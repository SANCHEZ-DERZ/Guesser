function reply(body, response) {
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