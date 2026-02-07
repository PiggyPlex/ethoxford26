export interface WeatherResponse {
  temperature: number;
  windSpeed: number;
  humidity: number;
  city: string;
  country: string;
}

export interface WebSearchResult {
  summary?: string;
  relatedTopics?: string[];
}

export interface FileToolResult {
  success: boolean;
  message: string;
  content?: string;
}

export interface PlanningAction {
  type: string;
  payload?: any;
}

export interface PlanningAgentContext {
  recentActivities: string[];
  currentTask: string;
}