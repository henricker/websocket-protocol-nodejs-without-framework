import internal from "stream";
import { CONSTANTS } from "../../constants";
import { umask } from "./util/umask";

export function onSocketReadable(socket: internal.Duplex) {
    if(!socket)
        return
    //consume optcode (first byte) => type of message (text, binary, ping, pong)
    // 1 -> 1 byte = 8 bits
    socket.read(1);

    const [maskAndPayloadLength] = socket.read(1);
    const payloadLength = maskAndPayloadLength - CONSTANTS.FIRST_BIT;

    let messageLength = 0;

    if(payloadLength <= CONSTANTS.SEVEN_BITS_INTEGER_MARKER) {
        messageLength = payloadLength;
    } else {
        throw new Error('Payload length is too big');
    }

    //Get mask key (4 bytes) after payload length
    const maskKey = socket.read(CONSTANTS.MASK_KEY_BYTES_LENGTH);

    // The rest of the message (messageLength bytes) is a payload encoded
    const encodedData = socket.read(messageLength);
    const decodedData = umask(encodedData, maskKey).toString('utf8');
    console.log(decodedData)
}