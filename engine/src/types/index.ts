export interface WeatherResponse {
  temperature: number;
  windSpeed: number;
  humidity: number;
  city: string;
  country: string;
}

export interface WebSearchResult {
  id: string;
  name: string;
  url: string;
  displayUrl: string;
  snippet: string;
  summary?: string;
  datePublished?: string;
  dateLastCrawled?: string;
}

export interface LangSearchResponse {
  code: number;
  log_id: string;
  msg: string | null;
  data: {
    _type: string;
    queryContext: {
      originalQuery: string;
    };
    webPages: {
      webSearchUrl: string;
      totalEstimatedMatches: number | null;
      value: WebSearchResult[];
      someResultsRemoved?: boolean;
    };
  };
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