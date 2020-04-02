import Invoker, { MessageHandeler } from "./services/invoker";

declare global {
    interface Window {
        invoker: AdvancedInvoker<any>;
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

    chatMobile: PromiseFunc = (...args: any) => {
        throw new Error("not init");
    };

    constructor(serverName: string, messager: T) {
        super({ prefix: serverName, messager, channel: "" });
    }

    init = () => {
        this.baseInit();
        this.getAccount = this.bind("getAccount");
        this.sendTransaction = this.bind("sendTransaction");
        this.chatMobile = this.bind("chatMobile");
    };
}

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
    return true;
};

chrome.runtime.sendMessage(extensionID, { type: "createInvoker" }, (res) => {
    createInvoker(res.tabId);
});
