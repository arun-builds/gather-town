import { describe, it, expect } from "vitest";
import { parseClientMessage } from "../src/websocket/parser";

describe("parseClientMessage", () => {
    // ── Valid messages ──────────────────────────

    it("parses a valid join_room message", () => {
        const raw = JSON.stringify({
            type: "join_room",
            roomId: "lobby-1",
        });

        const result = parseClientMessage(raw);

        expect(result).toEqual({
            success: true,
            message: {
                type: "join_room",
                roomId: "lobby-1",
            },
        });
    });

    it("parses a valid leave_room message", () => {
        const raw = JSON.stringify({
            type: "leave_room",
        });

        const result = parseClientMessage(raw);

        expect(result).toEqual({
            success: true,
            message: {
                type: "leave_room",
            },
        });
    });

    it("accepts a Buffer input", () => {
        const raw = Buffer.from(
            JSON.stringify({
                type: "join_room",
                roomId: "room-42",
            }),
        );

        const result = parseClientMessage(raw);

        expect(result.success).toBe(true);
    });

    // ── Invalid JSON ────────────────────────────

    it("rejects invalid JSON", () => {
        const result = parseClientMessage(
            "not valid json {{{",
        );

        expect(result).toEqual({
            success: false,
            error: "Invalid JSON",
        });
    });

    it("rejects empty string", () => {
        const result = parseClientMessage("");

        expect(result).toEqual({
            success: false,
            error: "Invalid JSON",
        });
    });

    // ── Missing type field ──────────────────────

    it("rejects a message with no type field", () => {
        const raw = JSON.stringify({
            roomId: "lobby-1",
        });

        const result = parseClientMessage(raw);

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(result.error).toBe(
                "Invalid message format",
            );
        }
    });

    // ── Unknown message type ────────────────────

    it("rejects an unknown message type", () => {
        const raw = JSON.stringify({
            type: "teleport",
            x: 10,
            y: 20,
        });

        const result = parseClientMessage(raw);

        expect(result.success).toBe(false);

        if (!result.success) {
            expect(result.error).toBe(
                "Invalid message format",
            );
        }
    });

    // ── Invalid roomId ──────────────────────────

    it("rejects join_room with missing roomId", () => {
        const raw = JSON.stringify({
            type: "join_room",
        });

        const result = parseClientMessage(raw);

        expect(result.success).toBe(false);
    });

    it("rejects join_room with empty roomId", () => {
        const raw = JSON.stringify({
            type: "join_room",
            roomId: "",
        });

        const result = parseClientMessage(raw);

        expect(result.success).toBe(false);
    });

    it("rejects join_room with numeric roomId", () => {
        const raw = JSON.stringify({
            type: "join_room",
            roomId: 123,
        });

        const result = parseClientMessage(raw);

        expect(result.success).toBe(false);
    });

    // ── Incorrect field types ───────────────────

    it("rejects a message with numeric type", () => {
        const raw = JSON.stringify({
            type: 42,
        });

        const result = parseClientMessage(raw);

        expect(result.success).toBe(false);
    });

    it("rejects a message with null type", () => {
        const raw = JSON.stringify({
            type: null,
        });

        const result = parseClientMessage(raw);

        expect(result.success).toBe(false);
    });

    // ── Extra / unexpected fields ───────────────

    it("rejects join_room with extra fields", () => {
        const raw = JSON.stringify({
            type: "join_room",
            roomId: "lobby-1",
            admin: true,
        });

        const result = parseClientMessage(raw);

        expect(result.success).toBe(false);
    });

    it("rejects leave_room with extra fields", () => {
        const raw = JSON.stringify({
            type: "leave_room",
            reason: "bored",
        });

        const result = parseClientMessage(raw);

        expect(result.success).toBe(false);
    });

    // ── Malformed structures ────────────────────

    it("rejects an array instead of an object", () => {
        const raw = JSON.stringify([
            "join_room",
            "lobby",
        ]);

        const result = parseClientMessage(raw);

        expect(result.success).toBe(false);
    });

    it("rejects a primitive JSON value", () => {
        const raw = JSON.stringify("hello");

        const result = parseClientMessage(raw);

        expect(result.success).toBe(false);
    });

    it("rejects null JSON value", () => {
        const raw = JSON.stringify(null);

        const result = parseClientMessage(raw);

        expect(result.success).toBe(false);
    });

    // ── Non-string/buffer input ─────────────────

    it("rejects non-string non-buffer input", () => {
        const result = parseClientMessage(12345);

        expect(result).toEqual({
            success: false,
            error: "Message must be a string or buffer",
        });
    });

    // ── Does not leak internal details ──────────

    it("error messages are generic, not Zod internals", () => {
        const raw = JSON.stringify({
            type: "join_room",
            roomId: 999,
        });

        const result = parseClientMessage(raw);

        expect(result.success).toBe(false);

        if (!result.success) {
            // Should be our generic message,
            // not Zod's detailed path/issue output.
            expect(result.error).toBe(
                "Invalid message format",
            );
        }
    });
});
