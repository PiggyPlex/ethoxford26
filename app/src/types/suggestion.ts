export interface SuggestionEvent {
  type: "link" | "text" | "spotify";
  content: string;
  title?: string;
  sources?: string[];
  why: string;
  timestamp: number;
}
