import * as React from 'react';
import './style.less'
import { useDispatch, useSelector } from 'react-redux';
import { createAction } from '../../utils';
import { rootReducers } from '../../reducers';
import { useHistory } from 'react-router-dom';
import * as QRCode from 'qrcode.react'



const Login: React.FC = () => {
    // tooling
    const dispatch = useDispatch();
    const history = useHistory();



    // selectors
    const signature = useSelector((state: rootReducers) => state.status.signature)
    const channel = useSelector((state: rootReducers) => state.status.channel)
    const session = useSelector((state: rootReducers) => state.status.session)
    const errMsg = useSelector((state: rootReducers)=> state.status.errMsg)

    // states
    const [loading, setLoading] = React.useState(false);

    const needManual = errMsg!=="";


    // effects
    React.useEffect(() => {
        if (session) {
            history.replace('/status')
        }
    }, [session]);


    // render
    return (
        <div className="main">
            <div className="qrcode">
                <QRCode value={JSON.stringify({ signature, channel })} size={280} />
            </div>
            <div className="qrcode-mask">

            </div>
        </div>
    )
}
export default Login