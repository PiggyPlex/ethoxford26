import * as z from "zod";
import { tool } from "langchain";
import { Effect, pipe } from "effect";
import { GoogleGenerativeAI } from "@google/generative-ai";

/** ─────────────────────────────────────────
 *  1. Gemini client setup
 * ───────────────────────────────────────── */

const geminiApiKey = process.env.GOOGLE_API_KEY;
if (!geminiApiKey) {
  throw new Error("GOOGLE_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", // or another Gemini model you prefer
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
 *  3. User preferences (single user configuration)
 * ───────────────────────────────────────── */

const USER_PREFERENCES = {
  name: "User",
  fashionPreferences: ["streetwear", "sustainable", "indie designers"],
  lifestylePreferences: ["urban", "eco-conscious", "minimalist"],
  priceRange: "mid",
  regions: ["Europe", "Japan"],
};

/** ─────────────────────────────────────────
 *  4. Prompt builder: Gemini personalizes GNews results
 * ───────────────────────────────────────── */

function buildPersonalizationPrompt(articles: NewsArticle[]): string {
  return `
You are a fashion & lifestyle news assistant.

USER PROFILE:
- Fashion preferences: ${JSON.stringify(USER_PREFERENCES.fashionPreferences)}
- Lifestyle preferences: ${JSON.stringify(USER_PREFERENCES.lifestylePreferences)}
- Price range: ${JSON.stringify(USER_PREFERENCES.priceRange)}
- Regions: ${JSON.stringify(USER_PREFERENCES.regions)}

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

Personalized Fashion & Lifestyle News:

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
  async () => {
    const program = pipe(
      Effect.tryPromise({
        try: async () => {
          // 1. Fetch latest fashion/lifestyle news from GNews
          const articles = await fetchFashionLifestyleNewsFromGNews(15);

          if (articles.length === 0) {
            throw new Error("No articles returned from GNews");
          }

          // 2. Build Gemini prompt using user preferences + articles
          const prompt = buildPersonalizationPrompt(articles);

          // 3. Call Gemini to personalize and structure the news
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

          // 4. Return human-readable text
          return responseText;
        },
        catch: (error) =>
          new Error(
            `Fashion & lifestyle news (GNews + Gemini) failed: ${String(error)}`,
          ),
      }),
    );

    return Effect.runPromise(program);
  },
  {
    name: "get_fashion_lifestyle_news",
    description:
      "Fetches real-time fashion and lifestyle news from GNews and uses Gemini to personalize it based on user preferences.",
    schema: z.object({}),
  },
);