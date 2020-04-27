import { wrapStore } from "webext-redux";
import { createStore, Store } from "redux";
import rootState, { rootReducers } from "./reducers";
import connector from "./services/browserconnector";
import { createAction } from "./utils";
import Invoker, { MessageHandeler } from "./services/invoker";
import { ErrorNotConnectMobile } from "./types/error";

declare global {
    interface Window {
        register: () => Promise<any>;
        getAccount: (...args: any[]) => Promise<any>;
        sendTransaction: (...args: any[]) => Promise<any>;
        disconnectChannel: () => Promise<any>;
        store: Store<rootReducers>;
        invokerMap: Map<string, Invoker<any>>;
    }
}

/*= ============================background to popup=================================== */

// store
const store = createStore(rootState, {});
window.store = store;
wrapStore(store);
connector.onDisconnect = () => {
    console.log("onDisConnect=>");
    store.dispatch(
        createAction("status/update")({
            isAlive: false,
            isConnect: false,
            isExpired: false
        })
    );
    window.register();
};
// session register function
let nextTimer = null;
window.register = () =>
    new Promise((resolve, reject) => {
        // register first
        connector
            .register()
            .then((res) => {
                const { result, body } = res;
                if (result) {
                    // register success
                    const { signature, channel, expiration } = body;
                    store.dispatch(
                        createAction("status/update")({ signature, channel })
                    );
                    if (expiration !== "INFINITY") {
                        if (nextTimer) {
                            clearTimeout(nextTimer);
                            nextTimer = null;
                        }
                        nextTimer = setTimeout(() => {
                            window.register();
                        }, expiration);
                    }
                }
                resolve(res);
            })
            .catch((err) => {
                // register failed
                console.error("register err=>", err);
                store.dispatch(
                    createAction("status/update")({
                        errMsg: JSON.stringify(err)
                    })
                );
                reject(err);
            });
    });

window.disconnectChannel = async () => {
    connector.disconnectChannel();
};

window.getAccount = async (...args) => {
    if (!store.getState().status.isConnect) {
        throw ErrorNotConnectMobile;
    }
    const accounts: Array<AccountList> = await connector.getAccount(...args);
    const map = accounts.reduce((map_, el) => {
        map_[el.key] = el.data;
        return map_;
    }, {});
    store.dispatch(createAction("accounts/update")(map));
    return accounts;
};

window.sendTransaction = async (...args) => {
    if (!store.getState().status.isConnect) {
        throw ErrorNotConnectMobile;
    }
    return await connector.sendTransaction(...args);
};

/*= =============================================================== */

/*= ==========================background local function===================================== */
// session health check
const sessionCheck = () => {
    connector
        .getSessionStatus()
        .then((payload) => {
            store.dispatch(createAction("status/update")(payload));
            if (!store.getState().status.isAlive && payload.isAlive) {
                window.getAccount();
            }
        })
        .catch((err) => {
            console.error("session err=>", err);
            store.dispatch(
                createAction("status/update")({
                    isAlive: false,
                    isReady: false,
                    isConnect: false,
                    isExpired: false
                })
            );
        });
    setTimeout(() => sessionCheck(), 5 * 1000);
};

// connect relay server health check
const connectCheck = () => {
    const isReady = connector.socket.connected;
    if (isReady !== store.getState().status.isReady) {
        store.dispatch(createAction("status/update")({ isReady }));
        if (isReady) {
            clearTimeout(nextTimer);
            nextTimer = null;
            window.register();
        }
    }
    setTimeout(() => connectCheck(), 5 * 1000);
};

connectCheck();
sessionCheck();

/*= =============================================================== */

/*= =========================background to web page ====================================== */

const Maps = new Map();

window.invokerMap = Maps;
let uid = 0;

type PromiseFunc = (...args: any) => Promise<any>;

class AdvancedInvoker<T extends MessageHandeler<any>> extends Invoker<T> {
    getAccount: PromiseFunc = async (cointype?: string) => {
        const accounts = store.getState().accounts;
        const arr = Object.keys(accounts).reduce((arr, el) => {
            if (accounts[el].length > 0) {
                if (cointype === undefined || cointype === el) {
                    arr.push({ key: el, data: accounts[el] });
                }
            }
            return arr;
        }, []);
        return arr;
    };

    sendTransaction: PromiseFunc = (...args: any) => {
        return window.sendTransaction(...args);
    };

    isConnectToMobile = () => {
        return store.getState().status.isAlive;
        // return true;
    };

    constructor(messager: T) {
        super({ prefix: `browser:${name}`, messager, channel: "" });
    }

    init = () => {
        this.baseInit();
        this.define("getAccount", this.getAccount);
        this.define("sendTransaction", this.sendTransaction);
        this.define("isConnectToMobile", this.isConnectToMobile);
    };
}

chrome.runtime.onConnect.addListener((port) => {
    // connect from inject
    const [prefix, tabId] = port.name.split(":");
    console.log("listening a port:", port.name);
    if (prefix !== "tab") return;
    let connect = true;
    port.onDisconnect.addListener(() => {
        connect = false;
        Maps.delete(tabId);
    });
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
    const invoker = new AdvancedInvoker(messager);
    invoker.init();
    console.log("add invoker:", invoker);
    Maps.set(tabId, invoker);
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    // read changeInfo data and do something with it
    // like send the new url to contentscripts.js
    if (changeInfo.status === "complete") {
        console.log(tabId, changeInfo, tab);
        chrome.tabs.sendMessage(tabId, {
            message: "inject"
        });
    }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.type == "getTabId") {
        sendResponse({ tabId: sender.tab.id });
    }
});
/*= =============================================================== */
