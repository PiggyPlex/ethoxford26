import { Server, Socket } from "socket.io";
import { createServer } from "http";
import { Effect } from "effect";

export interface SuggestionEvent {
  type: "link" | "text" | "spotify";
  content: string;
  title?: string;
  sources?: string[];
  why: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ToolExecutionEvent {
  id: string;
  chatId: string;
  tool: string;
  input: Record<string, unknown>;
  status: "running" | "completed" | "error";
  output?: string;
  timestamp: number;
}

export interface ThinkingEvent {
  chatId: string;
  thought: string;
  timestamp: number;
}

let io: Server | null = null;
const httpServer = createServer();

// Store message handlers for chat
type ChatMessageHandler = (socket: Socket, message: ChatMessage) => void;
let chatMessageHandler: ChatMessageHandler | null = null;

export const setChatMessageHandler = (handler: ChatMessageHandler): void => {
  chatMessageHandler = handler;
};

export const initSocketServer = (port: number = 3001): Effect.Effect<Server, Error> =>
  Effect.sync(() => {
    if (io) return io;
    
    io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Handle incoming chat messages
      socket.on("chat:message", (message: ChatMessage) => {
        console.log(`Received message from ${socket.id}: ${message.content.slice(0, 50)}...`);
        if (chatMessageHandler) {
          chatMessageHandler(socket, message);
        } else {
            console.warn("⚠️ No chat message handler set");
        }
      });
      
      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });

    httpServer.listen(port, () => {
      console.log(`Socket.IO server running on port ${port}`);
    });

    return io;
  });

export const getSocketServer = (): Server | null => io;

export const emitSuggestion = (suggestion: SuggestionEvent): Effect.Effect<void, Error> =>
  Effect.sync(() => {
    if (io) {
      io.emit("suggestion", suggestion);
      console.log(`Emitted suggestion: ${suggestion.title || suggestion.type}`);
    } else {
      console.warn("Socket.IO server not initialized");
    }
  });

// Emit chat response to specific socket
export const emitChatResponse = (socket: Socket, message: ChatMessage): Effect.Effect<void, Error> =>
  Effect.sync(() => {
    socket.emit("chat:response", message);
    console.log(`Emitted chat response: ${message.content.slice(0, 50)}...`);
  });

// Emit tool execution event to specific socket
export const emitToolExecution = (socket: Socket, event: ToolExecutionEvent): Effect.Effect<void, Error> =>
  Effect.sync(() => {
    socket.emit("chat:tool", event);
    console.log(`Emitted tool event: ${event.tool} (${event.status})`);
  });

// Emit thinking/reasoning event to specific socket
export const emitThinking = (socket: Socket, event: ThinkingEvent): Effect.Effect<void, Error> =>
  Effect.sync(() => {
    socket.emit("chat:thinking", event);
    console.log(`Emitted thinking: ${event.thought.slice(0, 50)}...`);
  });

// Emit typing indicator
export const emitTyping = (socket: Socket, isTyping: boolean): Effect.Effect<void, Error> =>
  Effect.sync(() => {
    socket.emit("chat:typing", { isTyping, timestamp: Date.now() });
  });
