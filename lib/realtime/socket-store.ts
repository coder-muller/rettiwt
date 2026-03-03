import type { Server as SocketIOServer } from "socket.io";

declare global {
  var __rettiwtIO: SocketIOServer | undefined;
}

export function getIO() {
  return globalThis.__rettiwtIO;
}

export function setIO(io: SocketIOServer) {
  globalThis.__rettiwtIO = io;
}
