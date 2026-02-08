import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { notifications, runningAgents } from "@/data/mockData"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "")

function buildSystemPrompt(userProfile?: ProfileData): string {
  const brandList = userProfile?.brands?.join(", ") ?? "Nike, Carhartt WIP, Stüssy, COS, New Balance, Arket"
  const priceRange = userProfile?.priceRange
    ? `${userProfile.priceRange.currency}${userProfile.priceRange.min}–${userProfile.priceRange.currency}${userProfile.priceRange.max}`
    : "£50–£200"
  const style = userProfile?.styleTags?.join(", ") ?? "Streetwear meets smart casual"
  const sizes = userProfile?.sizes
    ? Object.entries(userProfile.sizes).map(([k, v]) => `${k}: ${v}`).join(", ")
    : "UK M tops, UK 10 shoes"
  const name = userProfile?.name ?? "there"

  return `You are FriendOS, a personal shopping and style assistant for ${name}. You know their taste profile, favourite brands, and shopping habits. You're warm, knowledgeable about fashion, and help them find great deals.

Current shopping notifications:
${notifications.map((n) => `- [${n.type}] ${n.title}: ${n.summary}`).join("\n")}

Currently running shopping agents:
${runningAgents.map((a) => `- ${a.text} (${a.progress}% complete)`).join("\n")}

User's style profile:
- Name: ${name}
- Favourite brands: ${brandList}
- Preferred price range: ${priceRange}
- Style: ${style}
- Sizes: ${sizes}

Guidelines:
- Be concise (2-3 sentences max) unless the user asks for detail
- Reference the user's actual shopping data when relevant
- You can help with: finding deals, outfit suggestions, brand recommendations, price tracking, style advice
- Use a warm, friendly tone — you're their style-savvy friend
- When suggesting products, include price and retailer
- Use markdown for product lists and comparisons
- If asked about something not in the data, be honest but offer to search`
}

interface ChatMessageInput {
  role: "user" | "assistant"
  content: string
}

interface ProfileData {
  name?: string
  brands?: string[]
  priceRange?: { min: number; max: number; currency: string }
  styleTags?: string[]
  sizes?: Record<string, string>
}

export async function POST(request: Request) {
  try {
    const { messages, profile, mode } = (await request.json()) as {
      messages: ChatMessageInput[]
      profile?: ProfileData
      mode?: "chat" | "stylist"
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          reply:
            "I'm not connected to my brain yet! Add GEMINI_API_KEY to .env.local to wake me up.",
        },
        { status: 200 }
      )
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Build conversation history for Gemini.
    const raw = messages.slice(0, -1).map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.content }],
    }))

    // Drop leading model messages so history always begins with "user"
    const firstUserIdx = raw.findIndex((m) => m.role === "user")
    const history = firstUserIdx === -1 ? [] : raw.slice(firstUserIdx)

    let systemPrompt = buildSystemPrompt(profile)

    // Stylist mode: add richer prompt
    if (mode === "stylist" && profile) {
      systemPrompt += `\n\nYou are now in PERSONAL STYLIST mode. Be opinionated, specific, and reference actual brands and items.
When building outfits:
1. Always consider their sizes (${profile.sizes ? Object.entries(profile.sizes).map(([k, v]) => `${k}: ${v}`).join(", ") : "not specified"}) and budget (${profile.priceRange ? `${profile.priceRange.currency}${profile.priceRange.min}–${profile.priceRange.currency}${profile.priceRange.max}` : "flexible"})
2. Reference brands they love (${profile.brands?.join(", ") ?? "various"}) but also introduce adjacent brands they might like
3. Provide specific item names, approximate prices, and where to buy them
4. Format outfit suggestions as structured markdown lists with brand, item, price, retailer
5. If they mention a changing preference, note it explicitly so it can be saved to their profile`
    }

    const chat = model.startChat({
      history,
      systemInstruction: {
        role: "user" as const,
        parts: [{ text: systemPrompt }],
      },
    })

    // Send the latest user message
    const lastMessage = messages[messages.length - 1]
    const result = await chat.sendMessage(lastMessage.content)
    const reply = result.response.text()

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Gemini API error:", error)
    return NextResponse.json(
      {
        reply:
          "Sorry, I had a moment there. Could you try again?",
      },
      { status: 200 }
    )
  }
}
