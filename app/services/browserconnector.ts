import BrowserConnector from "socket-bridge/packages/browser";
import * as io from "socket.io-client";
import { serverEndPoint } from "../constants.json";
const conn = io(serverEndPoint);
const connector = new BrowserConnector(conn);

export default connector;
