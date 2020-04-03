import { wrapStore } from "webext-redux";
import { createStore, Store } from "redux";
import rootState, { rootReducers } from "./reducers";
import connector from "./services/browserconnector";
import { createAction } from "./utils";
import Invoker, { MessageHandeler } from "./services/invoker";

declare global {
    interface Window {
        register: () => Promise<any>;
        store: Store<rootReducers>;
        invokerMap: Map<string, Invoker<any>>;
    }
}

/*= ============================background to popup=================================== */

// store
const store = createStore(rootState, {});
window.store = store;
wrapStore(store);

// session register function
let nextTimer = null;
window.register = () =>
    new Promise((resolve, reject) => {
        // register first
        connector
            .register()
            .then((res) => {
                const { result, body } = res;
                console.log("res=>", res);
                if (result) {
                    // register success
                    const { signature, channel, expiration } = body;
                    store.dispatch(
                        createAction("status/register")({ signature, channel })
                    );
                    if (nextTimer) {
                        clearTimeout(nextTimer);
                        nextTimer = null;
                    }
                    nextTimer = setTimeout(() => {
                        window.register();
                    }, expiration);
                }
                resolve(res);
            })
            .catch((err) => {
                // register failed
                console.log("err=>", err);
                store.dispatch(
                    createAction("status/registerErr")({
                        msg: JSON.stringify(err)
                    })
                );
                reject(err);
            });
    });

/*= =============================================================== */

/*= ==========================background local function===================================== */
// session health check
const sessionCheck = () => {
    connector
        .getSessionStatus()
        .then((res) => {
            console.log("getStatus res=>", res);
            const { browser, mobile } = res;
            if (!store.getState().status.session) {
                store.dispatch(
                    createAction("status/login")({
                        browserId: browser.id,
                        mobileId: mobile.id
                    })
                );
            }
        })
        .catch((err) => {
            console.log("getStatus err=>", err);
            if (store.getState().status.session) {
                store.dispatch(createAction("status/logout")({}));
            }
        });
    setTimeout(() => sessionCheck(), 5 * 1000);
};

// connect health check

const connectCheck = () => {
    const isConnect = connector.socket.connected;
    console.log("isConnect=>", isConnect);
    if (isConnect !== store.getState().status.isConnect) {
        store.dispatch(createAction("status/setConnect")({ isConnect }));
        if (isConnect) {
            clearTimeout(nextTimer);
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
    getAccount: PromiseFunc = (...args: any) => connector.getAccount(args);

    sendTransaction: PromiseFunc = (...args: any) =>
        connector.sendTransaction(args);

    chatMobile: PromiseFunc = (...args: any) => connector.chatMobile(args);

    constructor(messager: T) {
        super({ prefix: `browser:${name}`, messager, channel: "" });
    }

    init = () => {
        this.baseInit();
        this.define("getAccount", this.getAccount);
        this.define("sendTransaction", this.sendTransaction);
        this.define("chatMobile", this.chatMobile);
    };
}

chrome.runtime.onConnectExternal.addListener((port) => {
    // connect from inject
    const name = uid++;
    let connect = true;
    port.onDisconnect.addListener(() => {
        connect = false;
        Maps.delete(name);
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
    Maps.set(name, invoker);
});

chrome.runtime.onMessageExternal.addListener(function (
    message,
    sender,
    sendResponse
) {
    if (message.type == "createInvoker") {
        console.log("createInvoker");
        sendResponse({ tabId: sender.tab.id });
    }
});

/*= =============================================================== */
