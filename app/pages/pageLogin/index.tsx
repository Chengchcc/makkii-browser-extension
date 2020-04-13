import * as React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import * as QRCode from "qrcode.react";
import { rootReducers } from "../../reducers";

import RefreshSvg from "../../assets/refresh.svg";
import BrokenSvg from "../../assets/broken-link.svg";

import "./style.less";

const Login: React.FC = () => {
    /*===================toolings===========================================*/
    const history = useHistory();

    /*===================selectors==========================================*/
    // signature
    const signature = useSelector(
        (state: rootReducers) => state.status.signature
    );
    // channel
    const channel = useSelector((state: rootReducers) => state.status.channel);

    // is connect to mobile
    const isConnect = useSelector(
        (state: rootReducers) => state.status.isConnect
    );
    // is connect to relay server
    const isReady = useSelector((state: rootReducers) => state.status.isReady);

    /*===================states==========================================*/
    const [loading, setLoading] = React.useState(false);

    /*===================selectors==========================================*/
    React.useEffect(() => {
        if (isConnect) {
            history.replace("/status");
        }
    }, [isConnect]);

    /*===================handler==========================================*/
    const onManual = () => {
        if (!isReady) return;
        setLoading(true);
        window
            .register()
            .then(() => setLoading(false))
            .catch(() => setLoading(false));
    };

    /*===================renders==========================================*/
    return (
        <>
            <div className="hint">Scan to login Makkii</div>
            <div className="qrcode">
                <QRCode
                    value={JSON.stringify({ signature, channel })}
                    size={250}
                />
            </div>
            {loading ? (
                <div className="qrcode-mask">
                    <div className={`qrcode-mask-btn loading`}>
                        <RefreshSvg className={`refresh }`} />
                    </div>
                </div>
            ) : null}
            {!isReady ? (
                <div className="qrcode-mask">
                    <div className="qrcode-mask-btn" style={{ cursor: "auto" }}>
                        <BrokenSvg className="refresh" />
                    </div>
                </div>
            ) : null}
            {/* mannual refresh btn */}
            <div className="btn-guides">Guides</div>
            <div className="btn-refresh" onClick={onManual}>
                Refresh <RefreshSvg className="img-refresh" />
            </div>
            {!isReady ? (
                <div className="err-msg">
                    Unable to connect to makkii server
                </div>
            ) : null}
        </>
    );
};
export default Login;
