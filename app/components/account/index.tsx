import * as React from "react";
import "./style.less";
import CoinAionSvg from "../../assets/coin_aion.svg";
import CoinBtcSvg from "../../assets/coin_btc.svg";
import CoinEthSvg from "../../assets/coin_eth.svg";
import CoinLtcSvg from "../../assets/coin_ltc.svg";
import CoinTronSvg from "../../assets/coin_trx.svg";
import SelectedSvg from "../../assets/icon_selected.svg";
import UnselectedSvg from "../../assets/icon_unselected.svg";
type AccountData = { name: string; address: string; amount: number };

interface BasicProps {
    cointype: string;
    data: AccountData;
}

const coinImage = (cointype: string) => {
    switch (cointype) {
        case "BTC":
            return <CoinBtcSvg className="img-coin" />;
        case "ETH":
            return <CoinEthSvg className="img-coin" />;
        case "LTC":
            return <CoinLtcSvg className="img-coin" />;
        case "TRX":
            return <CoinTronSvg className="img-coin" />;
        default:
            return <CoinAionSvg className="img-coin" />;
    }
};

const formatOneLine = (address: string, cointype: string) => {
    if (cointype === "AION") {
        return `${address.slice(0, 12)}...${address.slice(-10)}`;
    }
    if (cointype === "ETH") {
        const pre = address.startsWith("0x") ? 2 : 0;
        return `${address.substring(0, 10 + pre)}...${address.substring(
            address.length - 10
        )}`;
    }
    return `${address.slice(0, 12)}...${address.slice(-10)}`;
};

export const BasicAccountComponent: React.FC<BasicProps> = (props) => {
    const { cointype, data } = props;
    const { name, address, amount } = data;
    return (
        <div className="account">
            {coinImage(cointype)}
            <div className="acc-name">{name}</div>
            <div className="acc-addr">{formatOneLine(address, cointype)}</div>
            <div className="acc-amount">{amount}</div>
            <div className="acc-cointype">{cointype}</div>
        </div>
    );
};

interface SelectProps {
    data: CoinAccount;
    isSelect: boolean;
    onSelect: (account: CoinAccount) => void;
}

export const SelectAccountComponent: React.FC<SelectProps> = (props) => {
    const { data, isSelect, onSelect } = props;
    const { name, address, amount, cointype } = data;
    return (
        <div className="account select" onClick={() => onSelect(data)}>
            {isSelect ? (
                <SelectedSvg className="select-box" />
            ) : (
                <UnselectedSvg className="select-box" />
            )}
            {coinImage(cointype)}
            <div className="acc-name">{name}</div>
            <div className="acc-addr">{formatOneLine(address, cointype)}</div>
            <div className="acc-amount">{amount}</div>
            <div className="acc-cointype">{cointype}</div>
        </div>
    );
};
