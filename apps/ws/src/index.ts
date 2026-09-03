import { WebSocketServer, WebSocket } from "ws";

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3002;

const wss = new WebSocketServer({ port: PORT });

wss.on("listening", () => {
  console.log(`[ws] WebSocket server listening on ws://localhost:${PORT}`);
});

wss.on("connection", (socket: WebSocket) => {
  console.log("[ws] Client connected");

  // Send a welcome message
  socket.send(JSON.stringify({ type: "WELCOME", payload: "Connected to Gather Town WS 🎉" }));

  socket.on("message", (data) => {
    const raw = data.toString();
    console.log("[ws] Received:", raw);

    try {
      const message = JSON.parse(raw);

      // Echo the message back for now (scaffold)
      socket.send(JSON.stringify({ type: "ECHO", payload: message }));
    } catch {
      socket.send(JSON.stringify({ type: "ERROR", payload: "Invalid JSON" }));
    }
  });

  socket.on("close", () => {
    console.log("[ws] Client disconnected");
  });

  socket.on("error", (err) => {
    console.error("[ws] Socket error:", err.message);
  });
});

export default wss;
