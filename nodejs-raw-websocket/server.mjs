import { createServer } from 'http';
import crypto from 'crypto';

const PORT = 1337;
const WEBSOCKET_MAGIC_STRING_KEY = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
const server = createServer(
    (request, response) => {
        response.writeHead(200);
        response.end('Hey there!\n');
    }
)
.listen(PORT, () => console.log('Server listening to ', PORT));

function onSocketUpgrade  (request, socket, head) {
    const { 'sec-websocket-key': websocketClientKey } = request.headers;
    const headers = prepareHandshake(websocketClientKey)

    /**
     *  GET /chat HTTP/1.1
        Host: example.com:8000
        Upgrade: websocket
        Connection: Upgrade
        Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
        Sec-WebSocket-Version: 13
     */
    socket.write(headers);
}

function prepareHandshake(id) {
    const acceptKey = createSocketAccept(id);
    const headers = [
        'HTTP/1.1 101 Switching Protocols',
        'Upgrade: websocket',
        'Connection: Upgrade',
        `Sec-WebSocket-Accept: ${acceptKey}`,
        ''
    ].map(line => line.concat('\r\n')).join('');

    return headers
}

function createSocketAccept(id) {
    const shaum = crypto.createHash('sha1');
    shaum.update(id + WEBSOCKET_MAGIC_STRING_KEY);
    return shaum.digest('base64');
}

/**
 * The Upgrade general-header allows the client to specify what additional 
 * communication protocols it supports and would like to use if the server 
 * finds it appropriate to switch protocols. The server MUST use the Upgrade 
 * header field within a 101 (Switching Protocols) response to indicate which
 *  protocol(s) are being switched.
 * 
 * Ocurr handhake between client and server
 */
server.on('upgrade', onSocketUpgrade)

//Error handling to keep the server on
;[
    "uncaughtException",
    "unhandledRejection"
].forEach(event => {
    process.on(event, (err) => {
        console.error(`Something bad happened event: ${event}, msg: ${err.stack || err}`);
        process.exit(1);
    }
    );
})