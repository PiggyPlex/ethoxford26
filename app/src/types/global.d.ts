interface SuggestionEvent {
  type: "link" | "text" | "spotify";
  content: string;
  title?: string;
  sources?: string[];
  why: string;
  timestamp: number;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface ToolExecutionEvent {
  id: string;
  chatId: string;
  tool: string;
  input: Record<string, unknown>;
  status: "running" | "completed" | "error";
  output?: string;
  timestamp: number;
}

interface ThinkingEvent {
  chatId: string;
  thought: string;
  timestamp: number;
}

interface TypingEvent {
  isTyping: boolean;
  timestamp: number;
}

interface ElectronAPI {
  openExternal: (url: string) => void;
  dismissSuggestion: (timestamp: number) => void;
  onSuggestion: (callback: (suggestion: SuggestionEvent) => void) => void;
  onConnectionStatus: (callback: (connected: boolean) => void) => void;
  getConnectionStatus: () => Promise<boolean>;
  // Chat API
  sendChatMessage: (message: ChatMessage) => void;
  onChatResponse: (callback: (message: ChatMessage) => void) => void;
  onChatThinking: (callback: (event: ThinkingEvent) => void) => void;
  onChatTool: (callback: (event: ToolExecutionEvent) => void) => void;
  onChatTyping: (callback: (event: TypingEvent) => void) => void;
}

interface Window {
  electronAPI: ElectronAPI;
}
