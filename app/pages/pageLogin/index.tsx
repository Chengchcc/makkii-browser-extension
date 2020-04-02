import * as React from "react";
import "./style.less";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import * as QRCode from "qrcode.react";
import { createAction } from "../../utils";
import { rootReducers } from "../../reducers";

import RefreshSvg from "../../assets/refresh.svg";
import BrokenSvg from "../../assets/broken-link.svg";

const hints = {
    CONNECT_FAILD: "Unable to connect to server",
    AUTO_REGISTER_ERROR: "The QRcode has expired, please refresh it manually",
    NORMAL: "Scan to log in to MAKKII"
};

const Login: React.FC = () => {
    // tooling
    const dispatch = useDispatch();
    const history = useHistory();

    // selectors
    const signature = useSelector(
        (state: rootReducers) => state.status.signature
    );
    const channel = useSelector((state: rootReducers) => state.status.channel);
    const session = useSelector((state: rootReducers) => state.status.session);
    const errMsg = useSelector((state: rootReducers) => state.status.errMsg);
    const isConnect = useSelector(
        (state: rootReducers) => state.status.isConnect
    );

    // states
    const [loading, setLoading] = React.useState(false);

    const needManual = errMsg !== "";

    const hint = !isConnect
        ? hints.CONNECT_FAILD
        : needManual
        ? hints.AUTO_REGISTER_ERROR
        : hints.NORMAL;
    // effects
    React.useEffect(() => {
        if (session) {
            history.replace("/status");
        }
    }, [session]);

    // handelers
    const onManual = () => {
        setLoading(true);
        window
            .register()
            .then(() => setLoading(false))
            .catch(() => setLoading(false));
    };

    // render
    return (
        <div className="main">
            <div className="qrcode">
                <QRCode
                    value={JSON.stringify({ signature, channel })}
                    size={280}
                />
            </div>
            {isConnect && needManual ? (
                <div className="qrcode-mask">
                    <div
                        className={`qrcode-mask-btn ${
                            loading ? " loading" : ""
                        }`}
                        onClick={onManual}
                    >
                        <RefreshSvg className={`refresh }`} />
                    </div>
                </div>
            ) : null}
            {!isConnect ? (
                <div className="qrcode-mask">
                    <div className="qrcode-mask-btn">
                        <BrokenSvg className="refresh" />
                    </div>
                </div>
            ) : null}
            <span className="hint">{hint}</span>
        </div>
    );
};
export default Login;
