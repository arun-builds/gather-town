import { Room } from "./room";

export class RoomManager {
    private static instance: RoomManager;

    private readonly rooms = new Map<string, Room>();

    private constructor() {}

    public static getInstance(): RoomManager {
        if (!RoomManager.instance) {
            RoomManager.instance = new RoomManager();
        }

        return RoomManager.instance;
    }

    public create(roomId: string): Room {
        const room = new Room(roomId);

        this.rooms.set(roomId, room);

        return room;
    }

    public get(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    public getOrCreate(roomId: string): Room {
        const existingRoom = this.rooms.get(roomId);

        if (existingRoom) {
            return existingRoom;
        }

        return this.create(roomId);
    }

    public remove(roomId: string): void {
        this.rooms.delete(roomId);
    }

    public removeIfEmpty(room: Room): void {
        if (room.playerCount === 0) {
            this.rooms.delete(room.id);
        }
    }
}