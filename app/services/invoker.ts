/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */

/**
 *  A middleware that allows user binding to the functions defined in another end
 *  example:
 *     // A side;
 *     const invoker = new Invoker({
 *          prefix: 'A',
 *          messager: Messager,
 *          channel: 'exmaple'
 *     });
 *     const sayHello = ()=>console.log('hello');
 *     invoker.define('sayHello', sayHello);
 *     // B side;
 *      const invoker = new Invoker({
 *          prefix: 'A',
 *          messager: Messager,
 *          channel: 'exmaple'
 *     });
 *     const sayHello = invoker.bind('sayHello');
 *     sayHello();// A side print "hello"
 */
import { Deferred } from "./deferred";

const SYNC_COMMAND = "EXTENSION:SYNC";
const INVOKER_TIMEOUT = 5 * 60 * 1000;
enum PayloadStatus {
    success,
    fail,
    pending
}

interface MsgPayload<T> {
    id: string;
    command: string;
    data: T;
    reply: boolean;
    status: PayloadStatus;
}

export interface MessageHandeler<T> {
    send: (event: T, payload: any | never) => void;
    addListener: (event: T, listener: (payload: any | never) => void) => void;
    isConnect: () => boolean;
}

type Callback = (...data: any[]) => any;

type BindFunction = (...args: any) => Deferred<any>;

class Invoker<T extends MessageHandeler<string>> {
    private uid = 0;

    private messager: T;

    channel: string | undefined;

    prefix: string | undefined;

    // msg transaction
    private transactions: Map<string, Deferred<any>> = new Map();

    // define function
    private callbacks: Map<string, Callback> = new Map();

    // pending msg
    private needWait: Array<MsgPayload<any>> = [];

    // bind function
    fns: Map<string, (...arg: any[]) => Deferred<any>> = new Map();

    private __sync: BindFunction | undefined;

    constructor(opts: { prefix: string; messager: T; channel?: string }) {
        this.messager = opts.messager;
        this.channel = opts.channel;
        this.prefix = opts.prefix;
    }

    setChannel = (channel_: string): void => {
        this.channel = channel_;
    };

    baseInit = (): void => {
        this.messager.addListener(this.channel!, this.listener);
        this.__sync = this.bind(SYNC_COMMAND);
        this.define(SYNC_COMMAND, this._sync);
    };

    private isConnect = (): boolean => {
        return this.messager.isConnect() && this.needWait.length === 0;
    };

    private getTransactionKey = (data: MsgPayload<any>): string => {
        return `${data.command}(${data.id})`;
    };

    private getUID = (): string => {
        return `${this.prefix}:${this.uid++}`;
    };

    private sender = (data: MsgPayload<any>): void => {
        const force = data.command == SYNC_COMMAND;
        if (!force && !this.isConnect()) {
            this.needWait.push(data);
        } else if (this.messager.isConnect()) {
            this.messager.send(this.channel!, data);
        } else {
            this.needWait.push(data);
        }
    };

    private listener = (data: MsgPayload<any>): void => {
        if (data.reply) {
            // reply from b
            const key = this.getTransactionKey(data);
            if (this.transactions.has(key)) {
                if (data.status === PayloadStatus.success) {
                    this.transactions.get(key)!.resolve(data.data);
                } else {
                    this.transactions.get(key)!.reject(data.data);
                }
                this.transactions.delete(key);
            }
        } else if (this.callbacks.has(data.command)) {
            // request from b and has bind callback
            const callback = this.callbacks.get(data.command)!;
            // timeout
            const timer = setTimeout(() => {
                this.reply(data, "invoker time out", PayloadStatus.fail);
            }, INVOKER_TIMEOUT);
            try {
                const result = callback(data.data);
                if (result && result.then) {
                    result
                        .then((d: any) => {
                            this.reply(data, d, PayloadStatus.success);
                            clearTimeout(timer);
                        })
                        .catch((e: any) => {
                            this.reply(data, e, PayloadStatus.fail);
                            clearTimeout(timer);
                        });
                } else {
                    this.reply(data, result, PayloadStatus.success);
                    clearTimeout(timer);
                }
            } catch (err) {
                this.reply(data, err, PayloadStatus.success);
                clearTimeout(timer);
            }
        } else {
            console.log("result=> not found");
            // request but not bind
            this.reply(data, null, PayloadStatus.fail);
        }
    };

    private send = (command: string, data: any): Deferred<any> => {
        const payload: MsgPayload<any> = {
            command,
            data,
            id: this.getUID(),
            reply: false,
            status: PayloadStatus.pending
        };
        const defer = new Deferred<any>();
        this.transactions.set(this.getTransactionKey(payload), defer);
        this.sender(payload);
        return defer;
    };

    private reply = (
        data: MsgPayload<any>,
        result: any,
        status: PayloadStatus
    ): void => {
        data.reply = true;
        data.data = result;
        data.status = status;
        this.sender(data);
    };

    private initialize = (): void => {
        if (this.needWait.length > 0) {
            const waiting = this.needWait;
            this.needWait = [];
            waiting.forEach((payload: MsgPayload<any>) => this.sender(payload));
        }
    };

    private _sync = (defines: string[] = []): string[] => {
        defines
            .filter((d) => !this.fns.has(d))
            .map((d) => {
                this.fns.set(d, this.bind(d));
            });
        this.initialize();
        return Array.from(this.callbacks.keys());
    };

    private sync = (): void => {
        this.__sync!(Array.from(this.callbacks.keys())).then(this._sync);
    };

    bind = (command: string): BindFunction => {
        return (...args: any): Deferred<any> => this.send(command, args);
    };

    define = (command: string, func: Callback): Invoker<T> => {
        this.callbacks.set(command, (args: any) => {
            return func(...args);
        });
        if (this.isConnect()) {
            this.sync();
        }
        return this;
    };
}

export default Invoker;
