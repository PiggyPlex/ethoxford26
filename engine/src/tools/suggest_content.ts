import { Effect, pipe, Schema, Data, Console } from "effect";
import { tool } from "langchain";
import z from "zod";
import { emitSuggestion, type SuggestionEvent } from "../server/socket";

/**
 * Show content to the user to help them
 */
export const suggestContentTool = tool(
    async ({ type, content, title, imageUri, sources, why }) => {
        console.log('Suggesting content to user:');
        console.log(`Type: ${type}`);
        if (title) {
            console.log(`Title: ${title}`);
        }
        console.log(`Content: ${content}`);
        if (imageUri) {
            console.log(`Image URI: ${imageUri}`);
        }
        if (sources && sources.length > 0) {
            console.log(`Sources: ${sources.join(", ")}`);
        }
        console.log(`Why: ${why}`);

        // Emit suggestion via Socket.IO
        const suggestion: SuggestionEvent = {
            type,
            content,
            title,
            sources,
            why,
            timestamp: Date.now(),
        };

        await Effect.runPromise(emitSuggestion(suggestion));

        return `OK`;
    },
    {
        name: "suggest_content",
        description: "Suggest content to the user to help them with their query",
        schema: z.object({
            type: z.enum(["link", "text", "spotify"]).describe("The type of content being suggested"),
            content: z.string().describe("The content to suggest to the user. For 'link' type, this should be a URL. For 'text' type, this should be the text content. For the 'spotify' type, this should be a Spotify format track/album/playlist URL."),
            title: z.string().optional().describe("An optional title or headline for the suggested content. Example: If content is a summary of LangChain, title could be 'What is LangChain?'. For a Spotify track/album/artist/playlist, title could be the name."),
            imageUri: z.url().optional().describe("An optional URL to an image associated with the content. For example, a thumbnail for a link, link to e-commerce image, or the album art for a Spotify track/album."),
            sources: z.array(z.string()).optional().describe("Optional list of URL sources or textual references for the suggested content. Example: If content is a summary of LangChain, sources could be ['https://www.langchain.com/docs/']"),
            why: z.string().describe("Very short explanation (one sentence) of why this content may be relevant for the user to check out. Example: 'I noticed you were working on LangChain"),
        })
    }
);