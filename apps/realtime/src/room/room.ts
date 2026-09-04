import type { ServerMessage } from "@repo/types";
import type { Player } from "../player/player";

export class Room {
    private readonly players = new Map<string, Player>();

    constructor(
        public readonly id: string,
    ) {}

    join(player: Player) {
        if (this.players.has(player.userId)) {
            return;
        }

        const existingPlayers = [...this.players.values()];

        this.players.set(player.userId, player);

        player.setRoom(this.id);

        player.connection.send({
            type: "room_joined",
            roomId: this.id,
            players: existingPlayers.map((p) => p.toState()),
        });

        this.broadcastExcept(player.userId, {
            type: "player_joined",
            player: player.toState(),
        });
    }

    leave(userId: string): boolean {
        const player = this.players.get(userId);

        if (!player) {
            return this.players.size === 0;
        }

        this.players.delete(userId);
        player.clearRoom();

        this.broadcast({
            type: "player_left",
            userId,
        });

        return this.players.size === 0;
    }

    getPlayer(userId: string) {
        return this.players.get(userId);
    }

    getPlayers() {
        return this.players.values();
    }

    get playerCount() {
        return this.players.size;
    }

    broadcast(message: ServerMessage) {
        for (const player of this.players.values()) {
            player.connection.send(message);
        }
    }

    broadcastExcept(
        excludedUserId: string,
        message: ServerMessage,
    ) {
        for (const player of this.players.values()) {
            if (player.userId === excludedUserId) {
                continue;
            }
    
            player.connection.send(message);
        }
    }
}