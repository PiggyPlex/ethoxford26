import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { fetchContextNotesTool } from "../tools/context_notes";
import { saveUserSummaryTool, fetchUserSummaryTool } from "../tools/user_summary";
import { addUserInterest } from "../tools/interests";
import { createAgent } from "langchain";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0.3,
});

export const summaryContextAgent = createAgent({
  model: llm,
  tools: [
    fetchContextNotesTool,
    saveUserSummaryTool,
    fetchUserSummaryTool,
    addUserInterest,
  ],
});
