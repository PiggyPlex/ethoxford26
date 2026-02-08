import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

interface StylingRequest {
  productName: string
  brand: string
  userProfile?: {
    name?: string
    styleTags?: string[]
    sizes?: Record<string, string>
  }
}

// Curated fallback images by product type (when Gemini is unavailable) — Nike CDN
const FALLBACK_IMAGES: Record<string, string> = {
  default:
    "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/77902123-b424-4ad4-a0fd-fb177c82232d/M+NK+DF+MILER+SS.png",
  sneaker:
    "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/a7e41722-a82a-42ae-90f2-1f74bc79cfd9/M+NK+DF+MILER+SS.png",
  outerwear:
    "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/e4fb1f97-3315-45f5-9249-6d4262a1de19/M+NK+DF+FORM+HD+JKT.png",
  beanie:
    "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/958ae8fb-c27c-4441-9637-eeeb69f1ce78/M+NK+DF+FORM+HD+JKT.png",
  outfit:
    "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/i1-eef263ba-75a2-4bea-8e2f-e19d92bfeb36/M+NSW+CLUB+TEE.png",
}

function detectProductType(productName: string, brand: string): string {
  const combined = `${productName} ${brand}`.toLowerCase()
  if (combined.includes("max") || combined.includes("990") || combined.includes("shoe") || combined.includes("sneaker")) return "sneaker"
  if (combined.includes("coat") || combined.includes("jacket") || combined.includes("blazer")) return "outerwear"
  if (combined.includes("beanie") || combined.includes("hat") || combined.includes("cap")) return "beanie"
  if (combined.includes("outfit") || combined.includes("look")) return "outfit"
  return "default"
}

export async function POST(request: Request) {
  try {
    const { productName, brand, userProfile } = (await request.json()) as StylingRequest

    // If no API key, return fallback
    if (!process.env.GEMINI_API_KEY) {
      const productType = detectProductType(productName, brand)
      return NextResponse.json({
        imageUrl: FALLBACK_IMAGES[productType] ?? FALLBACK_IMAGES.default,
        fallback: true,
        description: `A styled look featuring the ${productName} by ${brand}`,
      })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    // Build styling prompt
    const styleTags = userProfile?.styleTags?.join(", ") ?? "modern, clean, minimal"
    const sizeContext = userProfile?.sizes
      ? Object.entries(userProfile.sizes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      : ""
    const nameRef = userProfile?.name ? ` for ${userProfile.name}` : ""

    const prompt = `Create a fashion editorial photograph featuring the ${productName} by ${brand}, styled in a ${styleTags} aesthetic.${
      sizeContext ? ` The person wearing it is size ${sizeContext}.` : ""
    } Studio lighting, neutral background, high fashion magazine look. Clean, minimal composition. Full outfit styled around the featured piece. Professional model photography.`

    try {
      // Try Gemini image generation with Imagen model
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-preview-image-generation",
      })

      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          // @ts-expect-error - responseModalities is valid for image generation
          responseModalities: ["TEXT", "IMAGE"],
        },
      })

      const response = result.response
      const candidates = response.candidates

      if (candidates && candidates.length > 0) {
        const parts = candidates[0].content?.parts
        if (parts) {
          // Look for inline image data
          for (const part of parts) {
            if (part.inlineData?.mimeType?.startsWith("image/")) {
              return NextResponse.json({
                imageData: part.inlineData.data,
                mimeType: part.inlineData.mimeType,
                fallback: false,
                description: `Styled look${nameRef}: ${productName} by ${brand}`,
              })
            }
          }

          // If text only came back, extract description
          const textPart = parts.find((p) => p.text)
          if (textPart?.text) {
            const productType = detectProductType(productName, brand)
            return NextResponse.json({
              imageUrl: FALLBACK_IMAGES[productType] ?? FALLBACK_IMAGES.default,
              fallback: true,
              description: textPart.text.slice(0, 200),
            })
          }
        }
      }

      // Fallback if no image generated
      const productType = detectProductType(productName, brand)
      return NextResponse.json({
        imageUrl: FALLBACK_IMAGES[productType] ?? FALLBACK_IMAGES.default,
        fallback: true,
        description: `A styled look featuring the ${productName} by ${brand}`,
      })
    } catch (genError) {
      console.error("Gemini image generation error:", genError)
      // Return fallback on Gemini error
      const productType = detectProductType(productName, brand)
      return NextResponse.json({
        imageUrl: FALLBACK_IMAGES[productType] ?? FALLBACK_IMAGES.default,
        fallback: true,
        description: `A styled look featuring the ${productName} by ${brand}`,
      })
    }
  } catch (error) {
    console.error("Styling API error:", error)
    return NextResponse.json(
      { error: "Failed to generate styling" },
      { status: 500 }
    )
  }
}
