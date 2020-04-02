import * as React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { rootReducers } from "../../reducers";

const Status: React.FC = () => {
    const session = useSelector((state: rootReducers) => state.status.session);
    const history = useHistory();
    React.useEffect(() => {
        if (!session) {
            history.replace("/login");
        }
    }, [session]);
    return <div>status</div>;
};

export default Status;
