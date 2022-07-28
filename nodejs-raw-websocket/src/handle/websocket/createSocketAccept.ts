import crypto from 'crypto';
import { CONSTANTS } from '../../constants';

export function createSocketAccept(id: string) {
    const shaum = crypto.createHash('sha1');
    shaum.update(id + CONSTANTS.WEBSOCKET_MAGIC_STRING_KEY);
    return shaum.digest('base64');
}