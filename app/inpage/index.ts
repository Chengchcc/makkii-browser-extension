/**
 * usage: inject to webpage
 * send tx dialog & select accounts dialog
 * message stream  inpage ->{postmessage && addEventListener} <- content script
 */
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
    const serverName = `makkii:${name}`;
    console.log("createInvoker=>", serverName);
    let connect = true;
    const messager: MessageHandeler<string> = {
        send: (evt, payload) => {
            window.postMessage(
                {
                    type: "FROM_PAGE",
                    text: JSON.stringify(payload)
                },
                "*"
            );
        },
        addListener: (evt, callback) => {
            window.addEventListener("message", (event) => {
                if (event.source != window) return;
                if (event.data.type && event.data.type == "FROM_CONTENT") {
                    const payload = JSON.parse(event.data.text);
                    // console.log("payload=>", event.data);
                    callback(payload);
                }
            });
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

window.addEventListener("message", (event) => {
    if (event.source != window) return;
    if (event.data.type && event.data.type == "CREATEINVOKER") {
        const tabId = event.data.tabId;
        createInvoker(tabId);
    }
});
