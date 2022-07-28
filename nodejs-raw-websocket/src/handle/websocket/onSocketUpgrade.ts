import { IncomingMessage } from "http";
import internal from "stream";
import { onSocketReadable } from "./onSocketReadable";
import { prepareHandshake } from "./prepareHandshake";

export function onSocketUpgrade  (request: IncomingMessage, socket: internal.Duplex, head: Buffer) {
    const { 'sec-websocket-key': websocketClientKey } = request?.headers;

    if(!websocketClientKey) {
        return;
    }

    const headers = prepareHandshake(websocketClientKey)

    /**
     *  GET /chat HTTP/1.1
        Host: example.com:8000
        Upgrade: websocket
        Connection: Upgrade
        Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
        Sec-WebSocket-Version: 13
     */
    socket?.write(headers);
    socket?.on('readable', () => onSocketReadable(socket));
}