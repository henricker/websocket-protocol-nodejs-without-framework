
export function concat(bufferList: Buffer[], totalLength: number) {
    const target = Buffer.allocUnsafe(totalLength);
    let offset = 0;
    for(const buffer of bufferList) {
        target.set(buffer, offset);
        offset += buffer.length;
    }

    return target;
}