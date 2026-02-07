import * as z from "zod";
import { tool } from "langchain";
import { Effect, pipe } from "effect";

export const webSearch = tool(
  async ({ query }) => {
    const program = pipe(
      Effect.tryPromise({
        try: async () => {
          const response = await fetch(
            `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`
          );
          const data = await response.json();
          
          const results: string[] = [];
          
          if (data.Abstract) {
            results.push(`Summary: ${data.Abstract}`);
          }
          
          if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            const topics = data.RelatedTopics
              .filter((t: any) => t.Text)
              .slice(0, 5)
              .map((t: any) => `- ${t.Text}`);
            if (topics.length > 0) {
              results.push(`Related topics:\n${topics.join("\n")}`);
            }
          }
          
          return results.length > 0 
            ? results.join("\n\n") 
            : `No instant results found for "${query}". Try a more specific query.`;
        },
        catch: (error) => new Error(`Search failed: ${error}`),
      })
    );
    
    return Effect.runPromise(program);
  },
  {
    name: "web_search",
    description: "Search the web for information using DuckDuckGo",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);
