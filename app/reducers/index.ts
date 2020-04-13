import { combineReducers } from "redux";
import status from "./status";
import accounts from "./accounts";
export interface rootReducers {
    status: StatusState;
    accounts: AccountsState;
}

export default combineReducers({
    status,
    accounts
});
