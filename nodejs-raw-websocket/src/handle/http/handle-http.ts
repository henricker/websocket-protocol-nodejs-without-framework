import { IncomingMessage, ServerResponse } from "http";

export function handleHttp(request: IncomingMessage, response: ServerResponse) {
    response.writeHead(200);
    response.end('Hey there!\n');
}