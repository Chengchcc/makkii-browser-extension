type SampleAccount = {
    name: string;
    amount: number;
    address: string;
};
type CoinAccount = {
    name: string;
    amount: number;
    address: string;
    cointype: string;
};

type UnsignedTx = {
    from: string;
    to: string;
    amount: number;
    data?: string;
    gasPrice?: number;
    gasLimit?: number;
    byteFee?: number;
    cointype: string;
};

interface ReducerAction {
    type: string;
    payload: any;
}

interface StatusState {
    signature: string;
    channel: string;
    isReady: boolean; // is connect to relay server
    isConnect: boolean; // is connect to mobile
    isAlive: boolean; // is mobile alive
    isExpired: boolean; // is signature alive
}

interface AccountsState {
    AION: Array<SampleAccount>;
    BTC: Array<SampleAccount>;
    LTC: Array<SampleAccount>;
    TRX: Array<SampleAccount>;
    ETH: Array<SampleAccount>;
}

interface AccountList {
    key: string;
    data: Array<SampleAccount>;
}
