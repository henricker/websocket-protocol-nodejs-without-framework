import { createSocketAccept } from "./createSocketAccept";

export function prepareHandshake(id: string) {
    const acceptKey = createSocketAccept(id);
    const headers = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${acceptKey}`,
        ''
    ]?.map(line => line.concat('\r\n')).join('');

    return headers
}
