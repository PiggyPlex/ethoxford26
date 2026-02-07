import { Effect, pipe } from "effect";
import * as z from "zod";
import { tool } from "langchain";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { connectToDatabase } from "../utils/mongodb";
import { generateEmbedding, cosineSimilarity } from "../utils/embeddings";
import { Interest, INTEREST_CATEGORIES, InterestCategory } from "../models/Interest";

const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
});

// Category descriptions for better LLM categorization
const CATEGORY_DESCRIPTIONS: Record<InterestCategory, string> = {
  fashion: "Clothing, brands, style, accessories, luxury goods, sneakers, designers",
  tech: "Technology, gadgets, software, apps, computers, AI, programming, electronics",
  social: "Social media, networking, relationships, communities, influencers",
  music: "Music, artists, bands, concerts, genres, instruments, streaming",
  news_politics: "News, politics, current events, government, elections, policy",
  art_media: "Art, movies, TV shows, streaming, photography, design, visual arts",
  history_literature: "History, books, literature, authors, historical events, classics",
  sports: "Sports, athletes, teams, fitness activities, competitions, leagues",
  gaming: "Video games, esports, gaming platforms, game developers, streamers",
  food_drink: "Food, restaurants, cooking, recipes, beverages, cuisines, dining",
  travel: "Travel, destinations, tourism, hotels, airlines, adventures",
  finance: "Finance, investing, cryptocurrency, stocks, banking, money management",
  health_fitness: "Health, fitness, wellness, nutrition, exercise, mental health",
  science: "Science, research, discoveries, space, biology, physics, chemistry",
  education: "Education, learning, courses, universities, skills, training",
};

// Tool to add a user interest from activity
export const addUserInterest = tool(
  async ({ activity, context }) => {
    const program = pipe(
      connectToDatabase(),
      Effect.flatMap(() =>
        Effect.tryPromise({
          try: async () => {
            // Use LLM to extract interest and categorize
            const response = await llm.invoke([
              {
                role: "system",
                content: `You are an interest extraction assistant. Analyze user activity and extract specific interests.

Available categories and their descriptions:
${Object.entries(CATEGORY_DESCRIPTIONS)
  .map(([cat, desc]) => `- ${cat}: ${desc}`)
  .join("\n")}

Return a JSON object with:
{
  "interest": "the specific interest/brand/topic extracted",
  "category": "one of the available categories",
  "confidence": 0.0-1.0 confidence score,
  "relatedTerms": ["array", "of", "related", "terms"]
}

If no clear interest can be extracted, return: {"interest": null}`,
              },
              {
                role: "user",
                content: `User activity: ${activity}${context ? `\nAdditional context: ${context}` : ""}`,
              },
            ]);

            const extraction = JSON.parse(response.content as string);

            if (!extraction.interest) {
              return "No clear interest could be extracted from the activity.";
            }

            const { interest, category, confidence, relatedTerms } = extraction;

            // Validate category
            if (!INTEREST_CATEGORIES.includes(category)) {
              return `Invalid category: ${category}`;
            }

            // Generate embedding for the interest
            const embedding = await generateEmbedding(
              `${interest} ${relatedTerms?.join(" ") || ""}`
            );

            // Check if similar interest already exists
            const existingInterests = await Interest.find({ category });
            let matchedInterest = null;

            for (const existing of existingInterests) {
              const similarity = cosineSimilarity(embedding, existing.embedding);
              if (similarity > 0.85) {
                matchedInterest = existing;
                break;
              }
            }

            if (matchedInterest) {
              // Update existing interest
              matchedInterest.occurrences += 1;
              matchedInterest.lastSeen = new Date();
              matchedInterest.confidence = Math.min(
                1,
                matchedInterest.confidence + confidence * 0.1
              );
              if (relatedTerms) {
                matchedInterest.relatedTerms = [
                  ...new Set([...matchedInterest.relatedTerms, ...relatedTerms]),
                ];
              }
              await matchedInterest.save();
              return `Updated existing interest "${matchedInterest.name}" in ${category} (occurrences: ${matchedInterest.occurrences})`;
            }

            // Create new interest
            const newInterest = await Interest.create({
              name: interest,
              category,
              embedding,
              confidence,
              relatedTerms: relatedTerms || [],
            });

            return `Added new interest "${interest}" to ${category} category with confidence ${confidence}`;
          },
          catch: (error) => new Error(`Failed to add interest: ${error}`),
        })
      )
    );

    return Effect.runPromise(program);
  },
  {
    name: "add_user_interest",
    description:
      "Analyze user activity and add detected interests to appropriate categories. Use this when user activity indicates interest in brands, topics, or subjects.",
    schema: z.object({
      activity: z
        .string()
        .describe("The user activity to analyze (e.g., 'user is browsing Nike website')"),
      context: z
        .string()
        .optional()
        .describe("Additional context about the activity"),
    }),
  }
);

// Tool to get user interests by category
export const getUserInterests = tool(
  async ({ category }) => {
    const program = pipe(
      connectToDatabase(),
      Effect.flatMap(() =>
        Effect.tryPromise({
          try: async () => {
            const query = category ? { category } : {};
            const interests = await Interest.find(query)
              .sort({ occurrences: -1, confidence: -1 })
              .limit(50);

            if (interests.length === 0) {
              return category
                ? `No interests found in ${category} category.`
                : "No user interests stored yet.";
            }

            const grouped = interests.reduce((acc, interest) => {
              if (!acc[interest.category]) {
                acc[interest.category] = [];
              }
              acc[interest.category].push({
                name: interest.name,
                confidence: interest.confidence.toFixed(2),
                occurrences: interest.occurrences,
                lastSeen: interest.lastSeen.toISOString().split("T")[0],
              });
              return acc;
            }, {} as Record<string, any[]>);

            return JSON.stringify(grouped, null, 2);
          },
          catch: (error) => new Error(`Failed to get interests: ${error}`),
        })
      )
    );

    return Effect.runPromise(program);
  },
  {
    name: "get_user_interests",
    description: "Retrieve user interests, optionally filtered by category",
    schema: z.object({
      category: z
        .enum(INTEREST_CATEGORIES as unknown as [string, ...string[]])
        .optional()
        .describe("Category to filter by (optional)"),
    }),
  }
);

// Tool to find similar interests using embeddings
export const findSimilarInterests = tool(
  async ({ query }) => {
    const program = pipe(
      connectToDatabase(),
      Effect.flatMap(() =>
        Effect.tryPromise({
          try: async () => {
            const queryEmbedding = await generateEmbedding(query);
            const allInterests = await Interest.find();

            if (allInterests.length === 0) {
              return "No interests stored yet to compare.";
            }

            const similarities = allInterests.map((interest) => ({
              name: interest.name,
              category: interest.category,
              similarity: cosineSimilarity(queryEmbedding, interest.embedding),
            }));

            const topMatches = similarities
              .sort((a, b) => b.similarity - a.similarity)
              .slice(0, 10)
              .filter((m) => m.similarity > 0.5);

            if (topMatches.length === 0) {
              return "No similar interests found.";
            }

            return JSON.stringify(
              topMatches.map((m) => ({
                ...m,
                similarity: m.similarity.toFixed(3),
              })),
              null,
              2
            );
          },
          catch: (error) => new Error(`Failed to find similar interests: ${error}`),
        })
      )
    );

    return Effect.runPromise(program);
  },
  {
    name: "find_similar_interests",
    description: "Find stored interests similar to a query using semantic search",
    schema: z.object({
      query: z.string().describe("The topic or interest to search for"),
    }),
  }
);

// Tool to remove an interest
export const removeUserInterest = tool(
  async ({ interestName, category }) => {
    const program = pipe(
      connectToDatabase(),
      Effect.flatMap(() =>
        Effect.tryPromise({
          try: async () => {
            const query: any = { name: new RegExp(interestName, "i") };
            if (category) {
              query.category = category;
            }

            const result = await Interest.deleteMany(query);

            if (result.deletedCount === 0) {
              return `No interest matching "${interestName}" found.`;
            }

            return `Removed ${result.deletedCount} interest(s) matching "${interestName}"`;
          },
          catch: (error) => new Error(`Failed to remove interest: ${error}`),
        })
      )
    );

    return Effect.runPromise(program);
  },
  {
    name: "remove_user_interest",
    description: "Remove a user interest by name",
    schema: z.object({
      interestName: z.string().describe("Name of the interest to remove"),
      category: z
        .enum(INTEREST_CATEGORIES as unknown as [string, ...string[]])
        .optional()
        .describe("Category to narrow down the search"),
    }),
  }
);
