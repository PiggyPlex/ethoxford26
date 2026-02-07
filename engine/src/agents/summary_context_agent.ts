import { createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { fetchContextNotesTool } from "tools/context_notes";
import { saveUserSummaryTool } from "tools/user_summary";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
});

export const summaryContextAgent = createAgent({
  model: llm,
  tools: [fetchContextNotesTool, saveUserSummaryTool] as const,
});
