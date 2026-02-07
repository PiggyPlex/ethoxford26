import { Effect, pipe, Schema, Data, Console } from "effect";
import { tool } from "langchain";
import z from "zod";

// export const LinkSuggestionContentSchema = z.object({
//     type: z.literal("link").describe("The type of content being suggested, in this case a link"),
//     content: z.url().describe("The URL of the link to suggest to the user"),
//     sponsored: z.boolean().describe("Whether this link is sponsored content or an ad"),
// }).describe("Schema for suggesting a link to the user");

// export const TextSuggestionContentSchema = z.object({
//     type: z.literal("text").describe("The type of content being suggested, in this case text"),
//     title: z.string().describe("A title or headline for the suggested content"),
//     content: z.string().describe("The text content to suggest to the user"),
// }).describe("Schema for suggesting text content to the user");

// export const SuggestionContentSchema = z.union([
//     LinkSuggestionContentSchema,
//     TextSuggestionContentSchema,
// ]).describe("Union schema for different types of content suggestions");

/**
 * Show content to the user to help them
 */
export const suggestContentTool = tool(
    async ({ type, content, title, sources, why }) => {
        console.log('Suggesting content to user:');
        console.log(`Type: ${type}`);
        if (title) {
            console.log(`Title: ${title}`);
        }
        console.log(`Content: ${content}`);
        if (sources && sources.length > 0) {
            console.log(`Sources: ${sources.join(", ")}`);
        }
        console.log(`Why: ${why}`);
        return `OK`;
    },
    {
        name: "suggest_content",
        description: "Suggest content to the user to help them with their query",
        schema: z.object({
            type: z.enum(["link", "text"]).describe("The type of content being suggested"),
            content: z.string().describe("The content to suggest to the user. For 'link' type, this should be a URL. For 'text' type, this should be the text content."),
            title: z.string().optional().describe("An optional title or headline for the suggested content. Example: If content is a summary of LangChain, title could be 'What is LangChain?'"),
            sources: z.array(z.string()).optional().describe("Optional list of URL sources or textual references for the suggested content. Example: If content is a summary of LangChain, sources could be ['https://www.langchain.com/docs/']"),
            why: z.string().describe("Very short explanation (one sentence) of why this content may be relevant for the user to check out. Example: 'I noticed you were working on LangChain"),
        })
    }
);