import { describe, it, expect, beforeEach, vi } from "vitest";
import { MovementService } from "../src/services/movement-service";
import { PlayerManager } from "../src/player/player-manager";
import { RoomManager } from "../src/room/room-manager";
import { Player } from "../src/player/player";
import { Room } from "../src/room/room";
import { Connection } from "../src/websocket/connection";
import { WebSocket } from "ws";

describe("MovementService", () => {
    let movementService: MovementService;
    let playerManager: PlayerManager;
    let roomManager: RoomManager;

    beforeEach(() => {
        // Reset singletons for testing isolation if possible, 
        // since they are singletons we will clear them manually.
        movementService = MovementService.getInstance();
        playerManager = PlayerManager.getInstance();
        roomManager = RoomManager.getInstance();

        // Clear existing players and rooms
        // Note: as they are singletons without clear methods, we mock/spy instead where needed,
        // or just ensure clean IDs per test.
    });

    it("moves player up and broadcasts", () => {
        const userId = "user-up";
        const roomId = "room-up";
        
        // Setup mock connection
        const mockWs = { send: vi.fn(), close: vi.fn() } as unknown as WebSocket;
        const connection = new Connection("conn-up", mockWs);
        connection.userId = userId;

        // Setup player and room
        const player = new Player(userId, connection);
        playerManager.add(player);
        
        const room = roomManager.create(roomId);
        player.setRoom(roomId);
        room.join(player); // This also tests room join logic

        // Spy on room broadcast
        const broadcastSpy = vi.spyOn(room, "broadcast");

        const initialY = player.position.y;
        
        // Act
        movementService.move(connection, "up");

        // Assert
        expect(player.position.y).toBe(initialY - 1);
        expect(player.direction).toBe("up");
        expect(broadcastSpy).toHaveBeenCalledWith({
            type: "player_moved",
            player: player.toState(),
        });
    });

    it("moves player down correctly", () => {
        const userId = "user-down";
        const roomId = "room-down";
        const mockWs = { send: vi.fn(), close: vi.fn() } as unknown as WebSocket;
        const connection = new Connection("conn-down", mockWs);
        connection.userId = userId;

        const player = new Player(userId, connection);
        playerManager.add(player);
        const room = roomManager.create(roomId);
        player.setRoom(roomId);
        room.join(player);

        const initialY = player.position.y;
        movementService.move(connection, "down");
        expect(player.position.y).toBe(initialY + 1);
        expect(player.direction).toBe("down");
    });

    it("moves player left correctly", () => {
        const userId = "user-left";
        const roomId = "room-left";
        const mockWs = { send: vi.fn(), close: vi.fn() } as unknown as WebSocket;
        const connection = new Connection("conn-left", mockWs);
        connection.userId = userId;

        const player = new Player(userId, connection);
        playerManager.add(player);
        const room = roomManager.create(roomId);
        player.setRoom(roomId);
        room.join(player);

        const initialX = player.position.x;
        movementService.move(connection, "left");
        expect(player.position.x).toBe(initialX - 1);
        expect(player.direction).toBe("left");
    });

    it("moves player right correctly", () => {
        const userId = "user-right";
        const roomId = "room-right";
        const mockWs = { send: vi.fn(), close: vi.fn() } as unknown as WebSocket;
        const connection = new Connection("conn-right", mockWs);
        connection.userId = userId;

        const player = new Player(userId, connection);
        playerManager.add(player);
        const room = roomManager.create(roomId);
        player.setRoom(roomId);
        room.join(player);

        const initialX = player.position.x;
        movementService.move(connection, "right");
        expect(player.position.x).toBe(initialX + 1);
        expect(player.direction).toBe("right");
    });

    it("ignores move if player does not exist", () => {
        const connection = new Connection("conn-none", {} as WebSocket);
        connection.userId = "ghost";
        
        // Simply should not throw
        expect(() => movementService.move(connection, "up")).not.toThrow();
    });

    it("ignores move if player is not in a room", () => {
        const userId = "user-noroom";
        const connection = new Connection("conn-noroom", {} as WebSocket);
        connection.userId = userId;

        const player = new Player(userId, connection);
        playerManager.add(player);
        
        const initialY = player.position.y;
        movementService.move(connection, "up");
        
        // Position should not change
        expect(player.position.y).toBe(initialY);
    });
});
