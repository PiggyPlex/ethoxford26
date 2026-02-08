import { getSocket } from "./socket-client"
import type {
  ChatMessage,
  ThinkingEvent,
  ToolExecutionEvent,
  SuggestionEvent,
  Interest,
  InterestCategory,
  UserSummary,
} from "./backend-types"

class BackendService {
  private socket = getSocket()

  // Chat methods
  sendMessage(message: ChatMessage): void {
    this.socket.emit("chat:message", message)
  }

  onChatResponse(callback: (message: ChatMessage) => void): () => void {
    this.socket.on("chat:response", callback)
    return () => this.socket.off("chat:response", callback)
  }

  onThinking(callback: (event: ThinkingEvent) => void): () => void {
    this.socket.on("chat:thinking", callback)
    return () => this.socket.off("chat:thinking", callback)
  }

  onToolExecution(callback: (event: ToolExecutionEvent) => void): () => void {
    this.socket.on("chat:tool", callback)
    return () => this.socket.off("chat:tool", callback)
  }

  onTyping(callback: (event: { isTyping: boolean; timestamp: number }) => void): () => void {
    this.socket.on("chat:typing", callback)
    return () => this.socket.off("chat:typing", callback)
  }

  onSuggestion(callback: (event: SuggestionEvent) => void): () => void {
    this.socket.on("suggestion", callback)
    return () => this.socket.off("suggestion", callback)
  }

  // HTTP fallback methods (for when Socket.IO isn't suitable)
  async getInterests(category?: InterestCategory): Promise<Interest[]> {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
    const url = category
      ? `${baseUrl}/api/interests?category=${category}`
      : `${baseUrl}/api/interests`

    const res = await fetch(url)
    if (!res.ok) throw new Error(`Failed to fetch interests: ${res.statusText}`)
    return res.json()
  }

  async getUserSummary(): Promise<UserSummary | null> {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
    const res = await fetch(`${baseUrl}/api/summary`)
    if (!res.ok) throw new Error(`Failed to fetch summary: ${res.statusText}`)
    return res.json()
  }
}

export const backendService = new BackendService()
