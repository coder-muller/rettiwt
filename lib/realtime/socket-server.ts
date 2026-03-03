import { createServer } from "node:http";
import { Server as IOServer } from "socket.io";

import { getIO, setIO } from "@/lib/realtime/socket-store";

declare global {
  var __rettiwtSocketBooting: boolean | undefined;
}

function resolveSocketPort() {
  const rawPort = process.env.RETTIWT_SOCKET_PORT ?? process.env.NEXT_PUBLIC_RETTIWT_SOCKET_PORT ?? "3002";
  const parsed = Number(rawPort);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 3002;
  }

  return parsed;
}

export function ensureRealtimeServer() {
  if (getIO() || globalThis.__rettiwtSocketBooting) {
    return;
  }

  const port = resolveSocketPort();
  const host = process.env.RETTIWT_SOCKET_HOST ?? "0.0.0.0";

  globalThis.__rettiwtSocketBooting = true;

  const httpServer = createServer((_req, res) => {
    res.statusCode = 404;
    res.end("Not Found");
  });

  const io = new IOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("conversation:join", (payload: { conversationId: string }) => {
      if (!payload?.conversationId) {
        return;
      }

      socket.join(`conversation:${payload.conversationId}`);
    });

    socket.on("conversation:leave", (payload: { conversationId: string }) => {
      if (!payload?.conversationId) {
        return;
      }

      socket.leave(`conversation:${payload.conversationId}`);
    });
  });

  httpServer.once("error", (error) => {
    globalThis.__rettiwtSocketBooting = false;
    io.removeAllListeners();

    if ((error as NodeJS.ErrnoException).code === "EADDRINUSE") {
      console.error(`[realtime] Porta ${port} ja esta em uso. Ajuste RETTIWT_SOCKET_PORT.`);
      return;
    }

    console.error("[realtime] Falha ao iniciar servidor de websocket.", error);
  });

  httpServer.listen(port, host, () => {
    setIO(io);
    globalThis.__rettiwtSocketBooting = false;
  });
}
