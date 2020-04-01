import {combineReducers} from 'redux'
import status from './status'

export interface rootReducers {
    status: StatusState
}

export default combineReducers({
    status
})