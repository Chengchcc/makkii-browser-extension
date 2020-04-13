import * as React from "react";
import { dialogContext } from "../../components/dragDialog";
import { SelectAccountComponent } from "../../components/account";
import "./style.less";
import NoAccountsSvg from "../../assets/no-accounts.svg";

interface Props {
    accounts: Array<CoinAccount>;
    onSelect: (account: CoinAccount, err: string) => void;
}

const SelectAccount: React.FC<Props> = (props) => {
    const { accounts, onSelect } = props;
    const { onClose } = React.useContext(dialogContext);
    const [curAcc, setCurAcc] = React.useState<CoinAccount>(null);

    const list = accounts.map((acc, idx) => {
        return (
            <li key={idx}>
                <SelectAccountComponent
                    data={acc}
                    isSelect={JSON.stringify(curAcc) === JSON.stringify(acc)}
                    onSelect={(acc) => setCurAcc(acc)}
                />
            </li>
        );
    });
    return (
        <>
            <div className="hint">Please select an account</div>
            {list.length ? (
                <>
                    <div className="account-list">
                        <ul>{list}</ul>
                    </div>
                    <div
                        className={`dialog-sumbit ${curAcc ? "" : "disabled"}`}
                        onClick={() => {
                            if (curAcc === null) return;
                            onSelect(curAcc, "");
                            onClose(false);
                        }}
                    >
                        CONFIRM
                    </div>
                </>
            ) : (
                <>
                    <NoAccountsSvg className="no-accounts" />
                    <div className="hint2">No Accounts Found</div>
                </>
            )}
        </>
    );
};

export default SelectAccount;
