import { createAgent } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { screenshotTool } from "tools/screenshot";
import { getWindows } from "tools/windows";
import { saveContextNoteTool } from "tools/context_notes";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
});

export const screenshotContextAgent = createAgent({
  model: llm,
  tools: [screenshotTool, getWindows, saveContextNoteTool] as const,
});
