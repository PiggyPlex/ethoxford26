import * as z from "zod";
import { tool } from "langchain";
import { Effect, pipe } from "effect";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

/** ─────────────────────────────────────────
 *  1. Gemini client setup
 * ───────────────────────────────────────── */

const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-3-pro", // or another Gemini model you prefer
});

/** ─────────────────────────────────────────
 *  2. GNews configuration
 * ───────────────────────────────────────── */

const gnewsApiKey = process.env.GNEWS_API_KEY;
if (!gnewsApiKey) {
  throw new Error("GNEWS_API_KEY is not set in environment variables");
}

type NewsArticle = {
  id: string;
  title: string;
  source: string;
  url: string;
  published_at: string;
  description: string;
  content: string;
};

/**
 * Fetch real-time fashion & lifestyle news from GNews.
 * You can tune the query string to better fit your domain.
 */
async function fetchFashionLifestyleNewsFromGNews(
  maxResults: number = 15,
): Promise<NewsArticle[]> {
  const query = encodeURIComponent(
    // You can tweak these keywords:
    'fashion OR "streetwear" OR "runway" OR "designer" OR "lifestyle" OR "street style" OR "sustainable fashion"',
  );

  // Docs: https://gnews.io/docs/v4#operation/search
  const url = `https://gnews.io/api/v4/search?q=${query}&lang=en&sortby=publishedAt&max=${maxResults}&apikey=${gnewsApiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `GNews API error: ${res.status} ${res.statusText} – ${text}`,
    );
  }

  const data = await res.json();

  const articles = (data.articles || []) as any[];

  return articles.map((a, idx) => ({
    id: String(a.url || idx),
    title: a.title ?? "",
    source: a.source?.name ?? "Unknown",
    url: a.url ?? "",
    published_at: a.publishedAt ?? "",
    description: a.description ?? "",
    content: a.content ?? "",
  }));
}

/** ─────────────────────────────────────────
 *  3. User preferences (replace with your real user DB)
 * ───────────────────────────────────────── */

type User = {
  id: string;
  name: string;
  fashionPreferences: string[];
  lifestylePreferences: string[];
  priceRange?: string;
  regions?: string[];
};

/**
 * TEMP: in-memory user store. Replace this with DB/API lookup.
 * Keep the User shape identical so the tool code doesn't change.
 */
const mockUsers: User[] = [
  {
    id: "u123",
    name: "Test User",
    fashionPreferences: ["streetwear", "sustainable", "indie designers"],
    lifestylePreferences: ["urban", "eco-conscious", "minimalist"],
    priceRange: "mid",
    regions: ["Europe", "Japan"],
  },
];

async function getUserById(userId: string): Promise<User | null> {
  const user = mockUsers.find((u) => u.id === userId);
  return user ?? null;
}

/** ─────────────────────────────────────────
 *  4. Prompt builder: Gemini personalizes GNews results
 * ───────────────────────────────────────── */

function buildPersonalizationPrompt(user: User, articles: NewsArticle[]): string {
  return `
You are a fashion & lifestyle news assistant.

USER PROFILE:
- Fashion preferences: ${JSON.stringify(user.fashionPreferences)}
- Lifestyle preferences: ${JSON.stringify(user.lifestylePreferences)}
- Price range (if any): ${JSON.stringify(user.priceRange || null)}
- Regions (if any): ${JSON.stringify(user.regions || [])}

YOU ARE GIVEN RAW NEWS ARTICLES (FROM A NEWS API), WITH FIELDS:
- id
- title
- source
- url
- published_at
- description
- content

ARTICLES:
${JSON.stringify(articles, null, 2)}

TASK:
1. From the given list of articles, select only those that:
   - Clearly relate to fashion and/or lifestyle.
   - Are likely to be interesting to this specific user, based on their fashion and lifestyle preferences.
2. For each selected article, provide:
   - Title
   - Source
   - A 1–3 sentence summary
   - A 1–2 sentence explanation of why this is relevant to this user.
   - The URL
3. If few or none of the articles are strongly relevant, still:
   - Include the best matches.
   - Optionally add 1–3 "Tailored Insight" items, where you synthesize trends or advice
     that match the user's niche (clearly marked as insights, not direct news articles).

FORMAT YOUR RESPONSE LIKE THIS (PLAIN TEXT, HUMAN-READABLE):

Personalized Fashion & Lifestyle News for <User Name>:

Relevant Articles:
1. Title:...
   Source:...
   Summary:...
   Why it's relevant:...
   URL:...

Tailored Insights (if applicable):
1. Title:...
   Summary:...
   Why it's relevant:...
`;
}

/** ─────────────────────────────────────────
 *  5. LangChain tool: getFashionLifestyleNews
 *     Uses GNews for real-time news + Gemini for personalization
 * ───────────────────────────────────────── */

export const getFashionLifestyleNews = tool(
  async ({ userId }) => {
    const program = pipe(
      Effect.tryPromise({
        try: async () => {
          // 1. Load user
          const user = await getUserById(userId);
          if (!user) {
            throw new Error(`User with id "${userId}" not found`);
          }

          // 2. Fetch latest fashion/lifestyle news from GNews (REAL API)
          const articles = await fetchFashionLifestyleNewsFromGNews(15);

          if (articles.length === 0) {
            throw new Error("No articles returned from GNews");
          }

          // 3. Build Gemini prompt using user + articles
          const prompt = buildPersonalizationPrompt(user, articles);

          // 4. Call Gemini to personalize and structure the news for this user
          const result = await model.generateContent({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
          });

          const responseText = result.response.text().trim();
          if (!responseText) {
            throw new Error("Empty response from Gemini");
          }

          // 5. Return human-readable text (your agent/UI can display this)
          return responseText;
        },
        catch: (error) =>
          new Error(
            `Fashion & lifestyle news (GNews + Gemini) failed: ${String(
              error,
            )}`,
          ),
      }),
    );

    return Effect.runPromise(program);
  },
  {
    name: "get_fashion_lifestyle_news",
    description:
      "Fetches real-time fashion and lifestyle news from GNews and uses Gemini to personalize it to a user's niche.",
    schema: z.object({
      userId: z.string().describe("The ID of the user to fetch news for"),
    }),
  },
);