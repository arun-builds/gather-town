import type { Connection } from "../websocket/connection";
import { Player } from "./player";
import { PlayerManager } from "./player-manager";
import { RoomManager } from "../room/room-manager";

export class PlayerLifecycleService {
    private static instance: PlayerLifecycleService;

    private readonly playerManager =
        PlayerManager.getInstance();

    private readonly roomManager =
        RoomManager.getInstance();

    private constructor() {}

    public static getInstance(): PlayerLifecycleService {
        if (!PlayerLifecycleService.instance) {
            PlayerLifecycleService.instance =
                new PlayerLifecycleService();
        }

        return PlayerLifecycleService.instance;
    }

    /**
     * Find-or-create player, leave old room if needed,
     * join the new room.
     */
    joinRoom(
        connection: Connection,
        roomId: string,
    ): void {
        if (!connection.userId) return;

        let player =
            this.playerManager.get(connection.userId);

        if (!player) {
            player = new Player(
                connection.userId,
                connection,
            );

            this.playerManager.add(player);
        }

        // Already in this room — nothing to do.
        if (player.roomId === roomId) return;

        // Leave old room first.
        if (player.roomId) {
            this.leaveCurrentRoom(player);
        }

        const room =
            this.roomManager.getOrCreate(roomId);

        room.join(player);
    }

    /**
     * Find the player's current room and leave it.
     */
    leaveRoom(connection: Connection): void {
        if (!connection.userId) return;

        const player =
            this.playerManager.get(connection.userId);

        if (!player) return;

        this.leaveCurrentRoom(player);
    }

    /**
     * Full cleanup: leave room + remove player entirely.
     */
    disconnect(connection: Connection): void {
        if (!connection.userId) return;

        const player =
            this.playerManager.get(connection.userId);

        if (!player) return;

        this.leaveCurrentRoom(player);
        this.playerManager.remove(player.userId);
    }

    /**
     * Internal: leave the player's current room and
     * clean up the room if it's now empty.
     */
    private leaveCurrentRoom(player: Player): void {
        if (!player.roomId) return;

        const room =
            this.roomManager.get(player.roomId);

        if (!room) {
            // Room already gone — just clear the stale ref.
            player.clearRoom();
            return;
        }

        const isEmpty = room.leave(player.userId);

        if (isEmpty) {
            this.roomManager.removeIfEmpty(room);
        }
    }
}
