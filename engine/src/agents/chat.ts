import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { getWeather } from "../tools/weather";
import { webSearch, visitPage } from "../tools/webSearch";
import { listFiles, readFile, writeFile } from "../tools/fileTools";
import { fetchUserSummaryTool } from "../tools/user_summary";
import { fetchProactiveActionsTool, saveProactiveActionTool } from "../tools/proactive_action";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MultiServerMCPClient } from "@langchain/mcp-adapters";  
import { resolve } from "node:path";
import { suggestContentTool } from "../tools/suggest_content";
import { createFact, readFacts } from "../tools/facts";
import { getWindows } from "../tools/windows";
import { fetchContextNotesTool } from "../tools/context_notes";
import { getFashionLifestyleNews } from "../tools/FashionLifestyleNews";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
});

const client = new MultiServerMCPClient({  
  googleCalendar: {
    transport: "stdio",
    command: "bunx",
    args: ["@cocal/google-calendar-mcp"],
    env: {
      GOOGLE_OAUTH_CREDENTIALS: resolve(__dirname, "../../credentials/google_oauth_credentials.json"),
    },
  },
  spotify: {
    command: "uvx",
    args: [
      "--python", "3.12",
      "--from", "git+https://github.com/varunneal/spotify-mcp",
      "spotify-mcp"
    ],
    env: {
      SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID!,
      SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET!,
      SPOTIFY_REDIRECT_URI: "http://127.0.0.1:8080/callback"
    }
  },
});

const mcpTools = await client.getTools();

export const planningAgent = createReactAgent({
  llm,
  tools: [
    getWeather, 
    webSearch,
    visitPage,
    listFiles, 
    readFile, 
    writeFile,
    fetchUserSummaryTool,
    suggestContentTool,
    ...mcpTools,
    readFacts,
    createFact,
    getWindows,
    fetchContextNotesTool,
    fetchProactiveActionsTool,
    saveProactiveActionTool,
    getFashionLifestyleNews,
  ],
});
