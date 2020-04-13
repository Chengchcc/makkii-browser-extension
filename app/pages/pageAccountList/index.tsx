import * as React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { rootReducers } from "../../reducers";
import SectionList from "../../components/sectionList";
import { BasicAccountComponent } from "../../components/account";

import RefreshSvg from "../../assets/refresh.svg";
import MobileSvg from "../../assets/mobile-connect.svg";
import "./style.less";

const Status: React.FC = () => {
    const isConnect = useSelector(
        (state: rootReducers) => state.status.isConnect
    );
    const isAlive = useSelector((state: rootReducers) => state.status.isAlive);
    const isExpired = useSelector(
        (state: rootReducers) => state.status.isExpired
    );

    const accounts = useSelector((state: rootReducers) => state.accounts);

    const history = useHistory();

    const sections = Object.keys(accounts).reduce((arr, el) => {
        if (accounts[el].length > 0) {
            arr.push({ key: el, data: accounts[el] });
        }
        return arr;
    }, []);

    // handeler
    const getAccount = () => {
        window.getAccount().catch((err) => {
            console.log("getAccount err=>", err);
        });
    };
    const disconnectChannel = () => {
        window.disconnectChannel();
    };

    // effects
    React.useEffect(() => {
        if (!isConnect) {
            history.replace("/login");
        }
    }, [isConnect]);

    React.useEffect(() => {
        getAccount();
    }, []);

    return (
        <>
            <div className="btn-disconnect" onClick={disconnectChannel}>
                Disconnect
            </div>
            <RefreshSvg className="svg-refresh" onClick={getAccount} />
            <SectionList
                className="acc-li"
                sections={sections}
                renderItem={(data, key) => (
                    <BasicAccountComponent cointype={key} data={data} />
                )}
            />
            {!isAlive ? (
                <div className="acc-li mask">
                    <MobileSvg className="mask-img" />
                    <div className="mask-hint">
                        {isExpired
                            ? "Connection is time out, please disconnect and reconnect"
                            : "Wait for Makkii app to active and reconenct"}
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default Status;
