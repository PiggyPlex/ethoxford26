import { Effect, pipe } from "effect";
import * as z from "zod";
import { tool } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { connectToDatabase } from "../utils/mongodb";
import { Fact } from "../models/Fact";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
});

// Tool to read all facts from MongoDB
export const readFacts = tool(
  async () => {
    const program = pipe(
      connectToDatabase(),
      Effect.flatMap(() =>
        Effect.tryPromise({
          try: async () => {
            const facts = await Fact.find().sort({ createdAt: -1 });
            if (facts.length === 0) {
              return "# User Facts\n\nNo facts stored yet.";
            }
            const content = facts.map(f => f.formattedContent).join("\n");
            return `Current facts:\n\n# User Facts\n\n${content}`;
          },
          catch: (error) => new Error(`Failed to read facts: ${error}`),
        })
      )
    );

    return Effect.runPromise(program);
  },
  {
    name: "read_facts",
    description: "Read all stored user facts from the memory layer",
    schema: z.object({}),
  }
);

// Tool to create a new fact with LLM validation and formatting
export const createFact = tool(
  async ({ fact }) => {
    const program = pipe(
      connectToDatabase(),
      Effect.flatMap(() =>
        Effect.tryPromise({
          try: async () => {
            // Get existing facts for context
            const existingFacts = await Fact.find().sort({ createdAt: -1 });
            const existingContent = existingFacts.length > 0
              ? existingFacts.map(f => f.formattedContent).join("\n")
              : "No existing facts.";

            // Process with LLM
            const response = await llm.invoke([
              {
                role: "system",
                content: `You are a memory manager. Your job is to:
1. Analyze the new fact for relevance and accuracy
2. Check if it conflicts with or duplicates existing facts
3. Format it as a markdown bullet point with a timestamp
4. Return ONLY the formatted fact line, nothing else

Current date: ${new Date().toISOString().split('T')[0]}`,
              },
              {
                role: "user",
                content: `Existing facts:\n${existingContent}\n\nNew fact to add: ${fact}`,
              },
            ]);

            const formattedFact = response.content as string;

            // Save to MongoDB
            await Fact.create({
              content: fact,
              formattedContent: formattedFact.trim(),
            });

            return `Successfully added fact:\n${formattedFact}`;
          },
          catch: (error) => new Error(`Failed to create fact: ${error}`),
        })
      )
    );

    return Effect.runPromise(program);
  },
  {
    name: "create_fact",
    description: "Create and store a new user fact. The fact will be validated and formatted by an LLM before storage.",
    schema: z.object({
      fact: z.string().describe("The new fact to store about the user"),
    }),
  }
);

// Tool to search facts using LLM
export const searchFacts = tool(
  async ({ query }) => {
    const program = pipe(
      connectToDatabase(),
      Effect.flatMap(() =>
        Effect.tryPromise({
          try: async () => {
            const facts = await Fact.find().sort({ createdAt: -1 });
            const factsContent = facts.length > 0
              ? `# User Facts\n\n${facts.map(f => f.formattedContent).join("\n")}`
              : "# User Facts\n\nNo facts stored yet.";

            const response = await llm.invoke([
              {
                role: "system",
                content: "You are a memory search assistant. Find and return relevant facts based on the user's query. If no relevant facts exist, say so clearly.",
              },
              {
                role: "user",
                content: `Facts database:\n${factsContent}\n\nSearch query: ${query}`,
              },
            ]);

            return response.content as string;
          },
          catch: (error) => new Error(`Search failed: ${error}`),
        })
      )
    );

    return Effect.runPromise(program);
  },
  {
    name: "search_facts",
    description: "Search through stored facts using natural language queries",
    schema: z.object({
      query: z.string().describe("The search query to find relevant facts"),
    }),
  }
);

// Tool to update or remove facts
export const updateFact = tool(
  async ({ instruction }) => {
    const program = pipe(
      connectToDatabase(),
      Effect.flatMap(() =>
        Effect.tryPromise({
          try: async () => {
            const facts = await Fact.find().sort({ createdAt: -1 });
            const factsContent = facts.length > 0
              ? `# User Facts\n\n${facts.map(f => f.formattedContent).join("\n")}`
              : "# User Facts\n\nNo facts stored yet.";

            const response = await llm.invoke([
              {
                role: "system",
                content: `You are a memory editor. Based on the user's instruction, determine which facts to update or remove. Return a JSON object with:
{
  "action": "update" | "remove",
  "factsToRemove": [array of fact indices to remove, 0-based],
  "updatedFacts": [array of updated fact objects with {index: number, newContent: string}]
}`,
              },
              {
                role: "user",
                content: `Current facts:\n${factsContent}\n\nInstruction: ${instruction}`,
              },
            ]);

            const updates = JSON.parse(response.content as string);

            // Remove facts
            if (updates.factsToRemove && updates.factsToRemove.length > 0) {
              const idsToRemove = updates.factsToRemove.map((idx: number) => facts[idx]._id);
              await Fact.deleteMany({ _id: { $in: idsToRemove } });
            }

            // Update facts
            if (updates.updatedFacts && updates.updatedFacts.length > 0) {
              for (const update of updates.updatedFacts) {
                const fact = facts[update.index];
                if (fact) {
                  await Fact.findByIdAndUpdate(fact._id, {
                    content: update.newContent,
                    formattedContent: update.newContent,
                  });
                }
              }
            }

            const updatedFactsList = await Fact.find().sort({ createdAt: -1 });
            const result = updatedFactsList.map(f => f.formattedContent).join("\n");
            
            return `Facts updated successfully:\n\n${result}`;
          },
          catch: (error) => new Error(`Update failed: ${error}`),
        })
      )
    );

    return Effect.runPromise(program);
  },
  {
    name: "update_fact",
    description: "Update or remove facts based on natural language instructions",
    schema: z.object({
      instruction: z.string().describe("Instructions for updating or removing facts (e.g., 'remove the fact about pizza' or 'update my favorite color to blue')"),
    }),
  }
);
