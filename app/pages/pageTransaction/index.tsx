import * as React from "react";
import { dialogContext } from "../../components/dragDialog";
import "./style.less";

interface Props {
    transaction: UnsignedTx;
    onSend?: (cointype: string, tx: UnsignedTx) => Promise<any>;
    callback: (hash: string, err?: string) => void;
}

const tx_field = [
    { key: "from", title: "FROM" },
    { key: "to", title: "TO" },
    {
        key: "amount",
        title: "AMOUNT",
        render: (tx: UnsignedTx) => {
            return `${tx.amount} ${tx.cointype}`;
        }
    },
    {
        key: "gasPrice",
        title: "GASP RICE",
        render: (tx: UnsignedTx) => {
            const unit = tx.cointype === "AION" ? "AMP" : "WEI";
            return `${tx.gasPrice} ${unit}`;
        }
    },
    { key: "gasLimit", title: "GASL IMIT" },
    { key: "data", title: "DATA" },
    {
        key: "byteFee",
        title: "BYTEFEE",
        render: (tx: UnsignedTx) => {
            return `${tx.byteFee} satoshi`;
        }
    }
];

const Transaction: React.FC<Props> = (props) => {
    const { transaction, onSend, callback } = props;
    const { onClose } = React.useContext(dialogContext);
    const tables = [];
    tx_field.forEach((field, idx) => {
        if (transaction[field.key]) {
            tables.push(
                <tr className="tx-tr" key={idx}>
                    <td className="tx-label">{`${field.title}:`}</td>
                    <td className="tx-data">{`${
                        field.render
                            ? field.render(transaction)
                            : transaction[field.key]
                    }`}</td>
                </tr>
            );
        }
    });
    return (
        <>
            <table className="tx-form">
                <tbody>{tables}</tbody>
            </table>
            <div
                className="dialog-sumbit"
                onClick={() => {
                    onSend(transaction.cointype, transaction)
                        .then((hash) => {
                            callback(hash, "");
                        })
                        .catch((err) => {
                            console.log("err=>", err);
                            callback(null, err);
                        });
                    onClose(false);
                }}
            >
                SEND TRANSACTION
            </div>
        </>
    );
};

export default Transaction;
