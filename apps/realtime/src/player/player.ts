import type { Direction } from "@repo/types";
import type { Connection } from "../websocket/connection";

export type Position = {
    x: number;
    y: number;
};

export class Player {
    public position: Position = {
        x: 0,
        y: 0,
    };

    public direction: Direction = "down";

    public roomId?: string;

    constructor(
        public readonly userId: string,
        public readonly connection: Connection,
    ) {}

    // useful because we don't want to send the entire Player object over WebSocket.
    toState(){
        return {
            userId: this.userId,
            position: this.position,
            direction: this.direction,
        };
    }

    setRoom(roomId: string) {
        this.roomId = roomId;
    }
    
    clearRoom() {
        this.roomId = undefined;
    }

    move(direction: Direction) {
        this.direction = direction;
        
        switch (direction) {
            case "up":
                this.position.y -= 1;
                break;
            case "down":
                this.position.y += 1;
                break;
            case "left":
                this.position.x -= 1;
                break;
            case "right":
                this.position.x += 1;
                break;
        }
    }
}