import internal from "stream";
import { CONSTANTS } from "../../constants";
import { sendMessageToClient } from "./send-messaging/sendMessageToClient";
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
    } 
    else if(payloadLength === CONSTANTS.SIXTEEN_BIT_INTEGER_MARKER) {
        //Convert 2 bytes to number using readUInt16BE to get integer 16 bits
        messageLength = socket.read(2).readUInt16BE(0);
    }
    else if(payloadLength === CONSTANTS.SIXTYFOUR_BIT_INTEGER_MARKER) {
        //Convert 4 bytes to number using readUInt32BE to get integer 32 bits
        messageLength = socket.read(8).readUInt32BE(0);
    }
    else {
        throw new Error('Payload length is too big');
    }

    //Get mask key (4 bytes) after payload length
    const maskKey = socket.read(CONSTANTS.MASK_KEY_BYTES_LENGTH);

    // The rest of the message (messageLength bytes) is a payload encoded
    const encodedData = socket.read(messageLength);
    if(encodedData) {
        const decodedData = umask(encodedData, maskKey).toString('utf8');
        const logger = {
            messageReceived: decodedData,
            date: new Date().toISOString()
        }
        console.log(logger);
        sendMessageToClient(JSON.stringify({name: 'henricker'}), socket);
    }

}