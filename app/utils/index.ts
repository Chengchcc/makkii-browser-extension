export const createAction = (type: string) => (payload: any) => {
    return { type, payload };
};
const fileds = [
    { key: "from", required: true },
    { key: "to", required: true },
    { key: "amount", required: true },
    { key: "cointype", required: true },
    { key: "data", required: false },
    { key: "gasPrice", require: false },
    { key: "gasLimit", require: false },
    { key: "byteFee", required: false }
];
export const formatTx = (tx: any): UnsignedTx => {
    fileds.forEach((el) => {
        if (el.required && typeof tx[el.key] == "undefined") {
            throw new Error(`${el.key} required`);
        }
    });
    const unsingedTx: UnsignedTx = {
        from: tx.from,
        to: tx.to,
        amount: tx.amount,
        cointype: tx.cointype
    };

    if (tx.cointype.match("^BTC$|^LTC$")) {
        unsingedTx.byteFee = tx.byteFee || 10;
    }
    if (tx.cointype.match("^AION$|^ETH$")) {
        unsingedTx.gasPrice = tx.gasPrice || 10;
        unsingedTx.gasLimit = tx.gasLimit || 21000;
    }
    return unsingedTx;
};
