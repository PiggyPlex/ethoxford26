import { io, Socket } from "socket.io-client";
import { Subject, Observable } from "rxjs";
import { SuggestionEvent } from "../types/suggestion";

class SuggestionService {
  private socket: Socket | null = null;
  private suggestionSubject = new Subject<SuggestionEvent>();
  private connectionSubject = new Subject<boolean>();

  public suggestions$: Observable<SuggestionEvent> = this.suggestionSubject.asObservable();
  public connection$: Observable<boolean> = this.connectionSubject.asObservable();

  connect(serverUrl: string = "http://localhost:3001"): void {
    if (this.socket?.connected) {
      console.log("Already connected to suggestion server");
      return;
    }

    this.socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("🔌 Connected to suggestion server");
      this.connectionSubject.next(true);
    });

    this.socket.on("disconnect", () => {
      console.log("🔌 Disconnected from suggestion server");
      this.connectionSubject.next(false);
    });

    this.socket.on("suggestion", (suggestion: SuggestionEvent) => {
      console.log("📥 Received suggestion:", suggestion);
      this.suggestionSubject.next(suggestion);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Connection error:", error.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const suggestionService = new SuggestionService();
