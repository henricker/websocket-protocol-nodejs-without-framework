import { CONSTANTS } from "../../../constants";

export function umask(encodedData: Buffer, maskKey: Buffer) {

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
        finalBuffer[i] = encodedData[i] ^ maskKey[i % CONSTANTS.MASK_KEY_BYTES_LENGTH];
    }

    return finalBuffer;
}