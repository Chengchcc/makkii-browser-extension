import Invoker, { MessageHandeler } from "../services/invoker";
import { showSelectAccount, showTransaction } from "./dialogs";
import { formatTx } from "../utils";

interface MakkiiConector {
    selectAccount: (
        callback: (accounts: CoinAccount, err: string) => {}
    ) => void;

    sendTransaction: (
        transaction: UnsignedTx,
        callback: (hash: string, err: string) => {}
    ) => void;
}

declare global {
    interface Window {
        invoker: AdvancedInvoker<any>;
        makkiiConnector: MakkiiConector;
    }
}

const extensionID = "copkncacaplonglcmenbaihilmfepilb";

type PromiseFunc = (...args: any) => Promise<any>;

class AdvancedInvoker<T extends MessageHandeler<any>> extends Invoker<T> {
    getAccount: PromiseFunc = (...args: any) => {
        throw new Error("not init");
    };

    sendTransaction: PromiseFunc = (...args: any) => {
        throw new Error("not init");
    };

    isConnectToMobile: PromiseFunc = (...args: any) => {
        throw new Error("not init");
    };

    constructor(serverName: string, messager: T) {
        super({ prefix: serverName, messager, channel: "" });
    }

    init = () => {
        this.baseInit();
        this.getAccount = this.bind("getAccount");
        this.sendTransaction = this.bind("sendTransaction");
        this.isConnectToMobile = this.bind("isConnectToMobile");
    };
}

const process_accounts = (accounts_: Array<AccountList>) => {
    return accounts_.reduce((map, coin) => {
        const tmp = coin.data.map((acc) => {
            return { ...acc, cointype: coin.key };
        });
        return [...map, ...tmp];
    }, []);
};

const createInvoker = (name: string) => {
    console.log("createInvoker=>", name);
    const serverName = `makkii:${name}`;
    const port = chrome.runtime.connect(extensionID);
    let connect = true;
    port.onDisconnect.addListener(() => (connect = false));
    const messager: MessageHandeler<string> = {
        send: (evt, payload) => {
            port.postMessage(payload);
        },
        addListener: (evt, callback) => {
            port.onMessage.addListener(callback);
        },
        isConnect: () => {
            return connect;
        }
    };
    const invoker = new AdvancedInvoker(serverName, messager);
    invoker.init();
    window.invoker = invoker;
    const selectAccount = (
        callback: (account: CoinAccount, err: string) => {}
    ) => {
        invoker.isConnectToMobile().then((res) => {
            if (res) {
                invoker
                    .getAccount()
                    .then((res) => {
                        showSelectAccount(process_accounts(res), callback);
                    })
                    .catch((err) => {
                        console.log("getAccount err=>", err);
                        callback(null, err);
                    });
            } else {
                callback(null, "not connnect to mobile");
            }
        });
    };

    const sendTransaction = (
        transaction: UnsignedTx,
        callback: (hash: string, err: string) => {}
    ) => {
        try {
            const tx = formatTx(transaction);
            invoker.isConnectToMobile().then((res) => {
                if (res) {
                    showTransaction(tx, invoker.sendTransaction, callback);
                } else {
                    callback(null, "not connnect to mobile");
                }
            });
        } catch (err) {
            callback(null, err);
        }
    };

    window.makkiiConnector = {
        selectAccount,
        sendTransaction
    };
    return true;
};

chrome.runtime.sendMessage(extensionID, { type: "createInvoker" }, (res) => {
    createInvoker(res.tabId);
});
