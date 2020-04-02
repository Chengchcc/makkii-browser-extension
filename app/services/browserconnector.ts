import BrowserConnector from "socket-bridge/packages/browser";
import * as io from "socket.io-client";

const conn = io("http://localhost:8888");
const connector = new BrowserConnector(conn);

export default connector;
