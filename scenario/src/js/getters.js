function get_request(context) {
    if (context && context.request)
        return context.request.rawRequest;
    return {}
}

function get_server_action(request) {
    if (request &&
        request.payload && 
        request.payload.data &&
        request.payload.data.server_action) {
            return request.payload.data.server_action;
        }
    return {};
}

function get_game_state(request) {
    if (request &&
        request.payload &&
        request.payload.meta &&
        request.payload.meta.current_app &&
        request.payload.meta.current_app.state) {
        return request.payload.meta.current_app.state.game_state;
    }
    return null;
}

function get_difficulty(request) {
    if (request &&
        request.payload &&
        request.payload.meta &&
        request.payload.meta.current_app &&
        request.payload.meta.current_app.state) {
        return request.payload.meta.current_app.state.difficulty;
    }
    return null;
}

function get_user_answer(request) {
    if (request &&
        request.payload &&
        request.payload.data &&
        request.payload.data.user_answer) {
        return request.payload.data.user_answer;
    }
    return null;
}

function get_current_question(request) {
    if (request &&
        request.payload &&
        request.payload.meta &&
        request.payload.meta.current_app &&
        request.payload.meta.current_app.state) {
        return request.payload.meta.current_app.state.current_question;
    }
    return null;
} 