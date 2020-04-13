const defaultState: AccountsState = {
    AION: [],
    BTC: [],
    ETH: [],
    LTC: [],
    TRX: []
};

export default (state = defaultState, action: ReducerAction) => {
    if (action.type === "accounts/update") {
        return { ...action.payload };
    }
    return state;
};
