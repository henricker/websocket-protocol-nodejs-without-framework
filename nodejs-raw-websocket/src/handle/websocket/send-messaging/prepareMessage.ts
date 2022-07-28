import { CONSTANTS } from "../../../constants";
import { concat } from "./concat";

export function prepareMessage(msg: any) {
    const message = Buffer.from(msg);
    const messageSize = message.length;
 
    let dataFrameBuffer: Buffer;

    const firstByte = 0x80 | CONSTANTS.OPCODE_TEXT //single frame + text

    if(messageSize <= CONSTANTS.SEVEN_BITS_INTEGER_MARKER) {
        const bytes = [firstByte];
        dataFrameBuffer = Buffer.from(bytes.concat(messageSize));
    }
    else if(messageSize == CONSTANTS.MAXIMUM_SIXTEEN_BITS_INTEGER) {
        const offsetFourBytes = 4;
        const target = Buffer.allocUnsafe(offsetFourBytes);
        target[0] = firstByte;
        target[1] = CONSTANTS.SIXTEEN_BIT_INTEGER_MARKER | 0x0; //just to know the mask

        //Write message size on 2 bytes (16 bits)
        target.writeUInt16BE(messageSize, 2);
        dataFrameBuffer = target;
    } else {
        throw new Error('Failed to prepare message, to long buddy :(');
    }

    const totalLength = dataFrameBuffer.length + messageSize;
    const dataFrameResponse = concat([dataFrameBuffer, message], totalLength);
    return dataFrameResponse;
}