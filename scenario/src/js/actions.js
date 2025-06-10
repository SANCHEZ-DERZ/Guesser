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
    var command = {
        type: "smart_app_data",
        action: action
    };
    
    for (var index = 0; context.response.replies && index < context.response.replies.length; index++) {
        if (context.response.replies[index].type === "raw" &&
            context.response.replies[index].body &&
            context.response.replies[index].body.items
        ) {
            context.response.replies[index].body.items.push({command: command});
            return;
        }
    }
    
    return reply({items: [{command: command}]}, context.response);
} 