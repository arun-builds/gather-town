import type { ClientMessage } from "@repo/types";

import type { Connection } from "./connection";
import { PlayerLifecycleService } from "../player/player-lifecycle";

export class Router {
    private readonly lifecycle =
        PlayerLifecycleService.getInstance();

    handle(
        connection: Connection,
        message: ClientMessage,
    ) {
        switch (message.type) {
            case "join_room":
                this.lifecycle.joinRoom(
                    connection,
                    message.roomId,
                );
                break;

            case "leave_room":
                this.lifecycle.leaveRoom(connection);
                break;
        }
    }

    disconnect(connection: Connection) {
        this.lifecycle.disconnect(connection);
    }
}