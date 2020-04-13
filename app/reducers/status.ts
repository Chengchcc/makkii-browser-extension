const defaultState: StatusState = {
    signature: "",
    channel: "",
    isReady: false,
    isConnect: false,
    isAlive: false,
    isExpired: false
};

export default (state = defaultState, action: ReducerAction) => {
    switch (action.type) {
        case "status/update":
            return {
                ...state,
                ...action.payload
            };
        default:
            return state;
    }
};
