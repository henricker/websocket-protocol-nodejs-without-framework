import internal from "stream";
import { prepareMessage } from "./prepareMessage";


export function sendMessageToClient(msg: any, socket: internal.Duplex) {
    const data = prepareMessage(msg);
    socket.write(data);
}