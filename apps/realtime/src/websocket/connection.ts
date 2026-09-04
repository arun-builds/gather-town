import type { WebSocket } from "ws";
import type { ServerMessage } from "@repo/types";

export class Connection {
    // Eventually authentication will populate this, For the moment assigning a temporary identity when connecting.
    public userId?: string;

    constructor(
        public readonly id: string,
        public readonly socket: WebSocket,
    ) {}

    send(message: ServerMessage) {
        this.socket.send(JSON.stringify(message));
    }

    close() {
        this.socket.close();
    }
}