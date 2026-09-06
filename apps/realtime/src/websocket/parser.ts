import { z } from "zod";
import type { ClientMessage } from "@repo/types";

/**
 * Runtime schemas for client messages.
 *
 * TypeScript types are erased at runtime — they can't
 * guard against malformed JSON from a WebSocket client.
 * These Zod schemas provide the actual runtime boundary.
 *
 * Each schema uses z.object({ ... }).strict() so that
 * unexpected extra fields are rejected.
 */

const JoinRoomSchema = z
    .object({
        type: z.literal("join_room"),
        roomId: z.string().min(1),
    })
    .strict();

const LeaveRoomSchema = z
    .object({
        type: z.literal("leave_room"),
    })
    .strict();

const DirectionSchema = z.enum(["up", "down", "left", "right"]);

const MoveSchema = z
    .object({
        type: z.literal("move"),
        direction: DirectionSchema,
    })
    .strict();

const ClientMessageSchema = z.discriminatedUnion(
    "type",
    [JoinRoomSchema, LeaveRoomSchema, MoveSchema],
);

export type ParseResult =
    | { success: true; message: ClientMessage }
    | { success: false; error: string };

/**
 * Parse and validate a raw WebSocket message.
 *
 * Handles:
 *  - non-string / non-buffer data
 *  - invalid JSON
 *  - structurally invalid payloads
 *
 * Returns a discriminated union so the caller can
 * branch cleanly without try/catch.
 */
export function parseClientMessage(
    data: unknown,
): ParseResult {
    // 1. Coerce to string.
    let raw: string;

    if (typeof data === "string") {
        raw = data;
    } else if (Buffer.isBuffer(data)) {
        raw = data.toString();
    } else {
        return {
            success: false,
            error: "Message must be a string or buffer",
        };
    }

    // 2. Parse JSON.
    let json: unknown;

    try {
        json = JSON.parse(raw);
    } catch {
        return {
            success: false,
            error: "Invalid JSON",
        };
    }

    // 3. Validate against the schema.
    const result =
        ClientMessageSchema.safeParse(json);

    if (!result.success) {
        return {
            success: false,
            error: "Invalid message format",
        };
    }

    return {
        success: true,
        message: result.data,
    };
}
