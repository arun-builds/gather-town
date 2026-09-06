import type { ClientMessage } from "@repo/types";

import type { Connection } from "./connection";
import { PlayerLifecycleService } from "../player/player-lifecycle";
import { MovementService } from "../services/movement-service";

export class Router {
    private readonly lifecycle =
        PlayerLifecycleService.getInstance();
    
    private readonly movement = 
        MovementService.getInstance();

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
                
            case "move":
                this.movement.move(
                    connection, 
                    message.direction,
                );
                break;
        }
    }

    disconnect(connection: Connection) {
        this.lifecycle.disconnect(connection);
    }
}