import type { Player } from "./player";

export class PlayerManager {
    private static instance: PlayerManager;

    private readonly players = new Map<string, Player>();

    private constructor() {}

    public static getInstance(): PlayerManager {
        if (!PlayerManager.instance) {
            PlayerManager.instance = new PlayerManager();
        }

        return PlayerManager.instance;
    }

    public add(player: Player): void {
        if (this.players.has(player.userId)) {
            throw new Error(
                `Player ${player.userId} is already connected`,
            );
        }

        this.players.set(player.userId, player);
    }

    public get(userId: string): Player | undefined {
        return this.players.get(userId);
    }

    public remove(userId: string): void {
        this.players.delete(userId);
    }
}