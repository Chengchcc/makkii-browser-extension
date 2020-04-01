interface ReducerAction {
    type: string
    payload: any
}


interface StatusState {
    signature: string
    channel: string
    session: boolean
    browserId: string
    mobileId: string
}


