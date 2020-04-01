
const defaultState: StatusState = {
    signature: "",
    channel: "",
    session: false,
    browserId: "",
    mobileId: "",
    errMsg: "",
}



export default (state = defaultState, action: ReducerAction) => {
    switch (action.type) {
        case "status/login":
            return { ...state, session: true, browserId: action.payload.browserId, mobileId: action.payload.mobileId }
        case "status/logout":
            return { ...state, session: false }
        case "status/register":
            return { ...state, signature: action.payload.signature, channel: action.payload.channel, errMsg: "" }
        case "status/registerErr":
            return { ...state, signature: "", channel: "", errMsg: action.payload.msg }
    }
    return state;
}