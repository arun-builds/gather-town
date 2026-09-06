import type { Direction } from "@repo/types";
import type { Connection } from "../websocket/connection";
import { PlayerManager } from "../player/player-manager";
import { RoomManager } from "../room/room-manager";

export class MovementService {
    private static instance: MovementService;

    private readonly playerManager = PlayerManager.getInstance();
    private readonly roomManager = RoomManager.getInstance();

    private constructor() {}

    public static getInstance(): MovementService {
        if (!MovementService.instance) {
            MovementService.instance = new MovementService();
        }

        return MovementService.instance;
    }

    public move(connection: Connection, direction: Direction): void {
        if (!connection.userId) {
            return;
        }

        const player = this.playerManager.get(connection.userId);
        if (!player) {
            return;
        }

        if (!player.roomId) {
            return;
        }

        const room = this.roomManager.get(player.roomId);
        if (!room) {
            return;
        }

        player.move(direction);

        room.broadcast({
            type: "player_moved",
            player: player.toState(),
        });
    }
}
