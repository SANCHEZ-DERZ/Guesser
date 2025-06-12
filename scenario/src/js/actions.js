function startGame(context) {
    addAction({
        type: "start_game"
    }, context);
}

function setDifficulty(difficulty, context) {
    addAction({
        type: "set_difficulty",
        difficulty: difficulty
    }, context);
}

function restartGame(context) {
    addAction({
        type: "restart_game"
    }, context);
}

function submitAnswer(answer, context) {
    var gameState = get_game_state(get_request($context));
    if (!gameState || gameState !== "playing") {
        $reactions.answer("Сначала начните игру!");
        return;
    }
    addAction({
        type: "submit_answer",
        answer: answer
    }, context);
}

function addAction(action, context) {
    var commandObj = {
        type: "smart_app_data",
        action: action
    };
    
    var rawBody;
    for (var index = 0; context.response.replies && index < context.response.replies.length; index++) {
        if (context.response.replies[index].type === "raw" && context.response.replies[index].body) {
            rawBody = context.response.replies[index].body;
            break;
        }
    }

    if (!rawBody) {
        rawBody = { items: [] };
        // добавим заглушку app_info, чтобы избежать ошибки applicationId
        rawBody.app_info = { applicationId: "stub" };
        reply(rawBody, context.response);
    }

    rawBody.items = rawBody.items || [];
    var newItem = { command: commandObj };
    if (!newItem.app_info) {
        newItem.app_info = { applicationId: "stub" };
    }
    if (newItem.command && !newItem.command.app_info) {
        newItem.command.app_info = { applicationId: "stub" };
    }
    rawBody.items.push(newItem);
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
    
    $reactions.answer({
        type: "raw",
        body: {
            suggestions: {
                buttons: buttons
            }
        }
    });
}

function addDifficultySuggestions(context) {
    var difficulties = ["Легкий", "Средний", "Сложный"];
    addGameSuggestions(difficulties, context);
}

function addGameControlSuggestions(context) {
    var controls = ["Начать игру", "Перезапустить", "Изменить сложность"];
    addGameSuggestions(controls, context);
} 