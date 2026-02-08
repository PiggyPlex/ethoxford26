// Chat types (matching backend)
export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

export interface ThinkingEvent {
  chatId: string
  thought: string
  timestamp: number
}

export interface ToolExecutionEvent {
  id: string
  chatId: string
  tool: string
  input: Record<string, unknown>
  status: "running" | "completed" | "error"
  output?: string
  timestamp: number
}

export interface SuggestionEvent {
  type: "link" | "text" | "spotify"
  content: string
  title?: string
  sources?: string[]
  why: string
  timestamp: number
}

// Interest types
export interface Interest {
  _id: string
  name: string
  category: InterestCategory
  confidence: number
  occurrences: number
  lastSeen: string
  relatedTerms: string[]
  createdAt: string
  updatedAt: string
}

export type InterestCategory =
  | "fashion"
  | "tech"
  | "social"
  | "music"
  | "news_politics"
  | "art_media"
  | "history_literature"
  | "sports"
  | "gaming"
  | "food_drink"
  | "travel"
  | "finance"
  | "health_fitness"
  | "science"
  | "education"

// Context types
export interface ContextNote {
  _id: string
  timestamp: string
  mainWindow: string
  openWindows: string[]
  summary: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface UserSummary {
  _id: string
  timestamp: string
  currentActivity: string
  recentActivities: string
  inferredGoals: string
  potentialNeeds: string
  futureActions?: string
  createdAt: string
  updatedAt: string
}
