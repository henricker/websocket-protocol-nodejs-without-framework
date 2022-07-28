import { createServer } from 'http';
import { CONSTANTS } from './constants';
import { handleHttp } from './handle/http/handle-http';
import { onSocketUpgrade } from './handle/websocket/onSocketUpgrade';

const server = createServer(handleHttp)
.listen(CONSTANTS.PORT, () => console.log('Server listening to ', CONSTANTS.PORT));

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