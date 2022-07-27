import { createServer } from 'http';
import crypto from 'crypto';

const PORT = 1337;
const SEVEN_BITS_INTEGER_MARKER = 125;
const SIXTEEN_BIT_INTEGER_MARKER = 126;
const SIXTYFOUR_BIT_INTEGER_MARKER = 127;

const MASK_KEY_BYTES_LENGTH = 4;

// parseInt('10000000', 2)
const FIRST_BIT = 128

const WEBSOCKET_MAGIC_STRING_KEY = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'

const server = createServer(
    (request, response) => {
        response.writeHead(200);
        response.end('Hey there!\n');
    }
)
.listen(PORT, () => console.log('Server listening to ', PORT));

function onSocketUpgrade  (request, socket, head) {
    const { 'sec-websocket-key': websocketClientKey } = request?.headers;
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

function prepareHandshake(id) {
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

function createSocketAccept(id) {
    const shaum = crypto.createHash('sha1');
    shaum.update(id + WEBSOCKET_MAGIC_STRING_KEY);
    return shaum.digest('base64');
}

function onSocketReadable(socket) {
    if(!socket)
        return
    //consume optcode (first byte) => type of message (text, binary, ping, pong)
    // 1 -> 1 byte = 8 bits
    socket.read(1);

    const [maskAndPayloadLength] = socket.read(1);
    const payloadLength = maskAndPayloadLength - FIRST_BIT;

    let messageLength = 0;

    if(payloadLength <= SEVEN_BITS_INTEGER_MARKER) {
        messageLength = payloadLength;
    } else {
        throw new Error('Payload length is too big');
    }

    //Get mask key (4 bytes) after payload length
    const maskKey = socket.read(MASK_KEY_BYTES_LENGTH);

    // The rest of the message (messageLength bytes) is a payload encoded
    const encodedData = socket.read(messageLength);
    const decodedData = umask(encodedData, maskKey).toString('utf8');
    console.log(decodedData)
}

function umask(encodedData, maskKey) {

    const finalBuffer = Buffer.from(encodedData);
    // because the maskKey has only 4 bytes
    // index % 4 === 0, 1, 2, 3 = index bits needed to decode the message

    // XOR  ^
    // returns 1 if both are different
    // returns 0 if both are equal

    // (71).toString(2).padStart(8, "0") = 0 1 0 0 0 1 1 1
    // (53).toString(2).padStart(8, "0") = 0 0 1 1 0 1 0 1
    //                                     0 1 1 1 0 0 1 0

    // (71 ^ 53).toString(2).padStart(8, "0") = '01110010'
    // String.fromCharCode(parseInt('01110010', 2))
    for(let i = 0; i < finalBuffer.length; i++) {
        finalBuffer[i] = encodedData[i] ^ maskKey[i % MASK_KEY_BYTES_LENGTH];
    }

    return finalBuffer;
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