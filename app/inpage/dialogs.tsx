import * as React from "react";
import { showDialog } from "../components/dragDialog";
import SelectAccount from "../pages/pageSelectAccount";
import Transaction from "../pages/pageTransaction";
export const showSelectAccount = (
    accounts: Array<CoinAccount>,
    callback: (account: CoinAccount, err?: string) => {}
) => {
    const dialog = <SelectAccount accounts={accounts} onSelect={callback} />;
    showDialog(dialog, callback);
};

export const showTransaction = (
    transaction: UnsignedTx,
    onSend: (...args: any[]) => any,
    callback: (hash: string, err?: string) => {}
) => {
    const dialog = (
        <Transaction
            transaction={transaction}
            onSend={onSend}
            callback={callback}
        />
    );
    showDialog(dialog, callback);
};
