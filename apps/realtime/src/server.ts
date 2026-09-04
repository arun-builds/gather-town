import { WebSocketServer } from "ws";

import { Connection } from "./websocket/connection";
import { Router } from "./websocket/router";
import { parseClientMessage } from "./websocket/parser";

const wss = new WebSocketServer({
    port: 8080,
});

const router = new Router();

wss.on("connection", (socket) => {
    const connection = new Connection(
        crypto.randomUUID(),
        socket,
    );

 // Eventually authentication will populate this, For the moment assigning a temporary identity when connecting.
    connection.userId = crypto.randomUUID();

    console.log(
        "Client connected:",
        connection.id,
    );

    socket.on("message", (data) => {
        const result = parseClientMessage(data);

        if (!result.success) {
            connection.send({
                type: "error",
                code: "INVALID_MESSAGE",
                message: result.error,
            });

            return;
        }

        router.handle(connection, result.message);
    });

    socket.on("close", () => {
        console.log(
            "Client disconnected:",
            connection.id,
        );

        router.disconnect(connection);
    });
});

console.log("Realtime server running on :8080");