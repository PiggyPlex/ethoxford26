import { io, Socket } from "socket.io-client"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(BACKEND_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    })

    // Connection event handlers
    socket.on("connect", () => {
      console.log("[Socket.IO] Connected to backend:", socket?.id)
    })

    socket.on("disconnect", (reason) => {
      console.warn("[Socket.IO] Disconnected:", reason)
    })

    socket.on("connect_error", (error) => {
      console.error("[Socket.IO] Connection error:", error.message)
    })
  }

  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
