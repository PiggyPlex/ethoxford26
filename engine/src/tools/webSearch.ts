import * as z from "zod";
import { tool } from "langchain";
import { Effect, pipe } from "effect";
import type { LangSearchResponse } from "../types";

const LANGSEARCH_API_URL = "https://api.langsearch.com/v1/web-search";

export const webSearch = tool(
  async ({ query, freshness = "noLimit", summary = true, count = 5 }) => {
    const program = pipe(
      Effect.tryPromise({
        try: async () => {
          const response = await fetch(LANGSEARCH_API_URL, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.LANGSEARCH_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query,
              freshness,
              summary,
              count,
            }),
          });

          if (!response.ok) {
            throw new Error(`LangSearch API error: ${response.status} ${response.statusText}`);
          }

          const data: LangSearchResponse = await response.json();

          if (data.code !== 200) {
            throw new Error(`LangSearch error: ${data.msg || "Unknown error"}`);
          }

          const results: string[] = [];
          const webPages = data.data.webPages.value;

          if (webPages && webPages.length > 0) {
            for (const page of webPages) {
              let resultText = `**${page.name}**\nURL: ${page.url}`;
              if (page.summary) {
                resultText += `\nSummary: ${page.summary}`;
              } else if (page.snippet) {
                resultText += `\nSnippet: ${page.snippet}`;
              }
              results.push(resultText);
            }
          }

          return results.length > 0
            ? `Search results for "${query}":\n\n${results.join("\n\n---\n\n")}`
            : `No results found for "${query}". Try a different query.`;
        },
        catch: (error) => new Error(`Search failed: ${error}`),
      })
    );

    return Effect.runPromise(program);
  },
  {
    name: "web_search",
    description: "Search the web for information using LangSearch API",
    schema: z.object({
      query: z.string().describe("The search query"),
      freshness: z.enum(["oneDay", "oneWeek", "oneMonth", "oneYear", "noLimit"])
        .optional()
        .describe("Time range for results: oneDay, oneWeek, oneMonth, oneYear, or noLimit (default)"),
      summary: z.boolean().optional().describe("Whether to include full summaries (default: true)"),
      count: z.number().min(1).max(10).optional().describe("Number of results to return (1-10, default: 5)"),
    }),
  }
);

export const visitPage = tool(
  async ({ url }) => {
    const program = pipe(
      Effect.tryPromise({
        try: async () => {
          const response = await fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; AssistantBot/1.0)",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
          }

          const contentType = response.headers.get("content-type") || "";
          
          if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
            return `Page at ${url} is not HTML/text content (${contentType}). Cannot extract text.`;
          }

          const html = await response.text();
          
          // Basic HTML to text extraction - remove scripts, styles, and HTML tags
          const textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, " ")
            .trim();

          // Truncate if too long
          const maxLength = 8000;
          const truncated = textContent.length > maxLength
            ? textContent.slice(0, maxLength) + "... [truncated]"
            : textContent;

          return `Content from ${url}:\n\n${truncated}`;
        },
        catch: (error) => new Error(`Failed to visit page: ${error}`),
      })
    );

    return Effect.runPromise(program);
  },
  {
    name: "visit_page",
    description: "Fetch and extract text content from a web page URL",
    schema: z.object({
      url: z.url().describe("The URL of the page to visit"),
    }),
  }
);
