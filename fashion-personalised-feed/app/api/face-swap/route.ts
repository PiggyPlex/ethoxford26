import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// ── Single-Step Virtual Try-On (Gemini) ──────────────────────────────────────
//
// Uses Gemini's image generation to show user wearing product directly.
// Single API call, no face-swap required.

// ── Types ────────────────────────────────────────────────────────────────────

interface FaceSwapRequest {
  userPhotoUrl: string // base64 data URL from localStorage (user's face)
  productImageUrl: string // HTTPS URL (product image - clothing only)
}

interface FaceSwapResponse {
  imageUrl: string
  fallback: boolean
  error?: string
}

// Reduced timeout since we only have 1 API call now
export const maxDuration = 60

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Fetch an image from a URL and return its content as base64 + mime type.
 */
async function fetchImageAsBase64(
  url: string
): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")
  const mimeType = response.headers.get("content-type") || "image/jpeg"
  return { base64, mimeType }
}

/**
 * Parse a data URL into base64 and mime type
 */
function parseDataUrl(dataUrl: string): { base64: string; mimeType: string } {
  const match = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/)
  if (match) {
    return { mimeType: match[1], base64: match[2] }
  }
  return { mimeType: "image/jpeg", base64: dataUrl }
}

// ── Single-Step: Generate user wearing product (Gemini) ──────────────────────

async function generateUserWearingProduct(
  userPhotoDataUrl: string,
  productImageUrl: string
): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY) {
    console.error("[generateUserWearingProduct] GEMINI_API_KEY not configured")
    return null
  }

  console.log(`[generateUserWearingProduct] Fetching product image from: ${productImageUrl}`)
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

  // Fetch and parse both images
  const productImage = await fetchImageAsBase64(productImageUrl)
  const userPhoto = parseDataUrl(userPhotoDataUrl)

  console.log(`[generateUserWearingProduct] Product image fetched, mime type: ${productImage.mimeType}`)
  console.log(`[generateUserWearingProduct] User photo parsed, mime type: ${userPhoto.mimeType}`)

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image",
  })
  console.log(`[generateUserWearingProduct] Using Gemini model: gemini-2.5-flash-image`)

  const prompt = `Look at these two images:
1. A person's photo (their face and appearance)
2. A clothing item

Generate a high-quality fashion photograph showing THIS EXACT PERSON wearing THIS EXACT CLOTHING ITEM.

Requirements:
- Keep the person's face, features, skin tone, and appearance EXACTLY as shown in their photo
- Full body or 3/4 body shot showing the clothing clearly
- The person should be facing the camera
- Studio lighting with a clean, neutral background
- Professional fashion photography style
- The clothing must match the item shown exactly
- Natural, confident pose

Generate only the image, no text.`

  console.log(`[generateUserWearingProduct] Calling Gemini API with both images...`)
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: userPhoto.mimeType,
              data: userPhoto.base64,
            },
          },
          {
            inlineData: {
              mimeType: productImage.mimeType,
              data: productImage.base64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      // @ts-expect-error - responseModalities is valid for image generation
      responseModalities: ["TEXT", "IMAGE"],
    },
  })

  console.log(`[generateUserWearingProduct] Gemini API call completed`)
  const response = result.response
  const candidates = response.candidates

  if (candidates && candidates.length > 0) {
    const parts = candidates[0].content?.parts
    if (parts) {
      console.log(`[generateUserWearingProduct] Response has ${parts.length} parts`)
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          console.log(`[generateUserWearingProduct] Found generated image, mime type: ${part.inlineData.mimeType}`)
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
        }
      }
    }
  }

  console.warn(`[generateUserWearingProduct] No image found in Gemini response`)
  return null
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  try {
    const { userPhotoUrl, productImageUrl } =
      (await request.json()) as FaceSwapRequest

    // ── Guard: validate inputs ──
    if (!productImageUrl?.startsWith("http")) {
      return NextResponse.json<FaceSwapResponse>({
        imageUrl: productImageUrl,
        fallback: true,
        error: "No valid product image URL provided",
      })
    }

    if (!userPhotoUrl?.startsWith("data:image")) {
      return NextResponse.json<FaceSwapResponse>({
        imageUrl: productImageUrl,
        fallback: true,
        error: "No valid user photo provided",
      })
    }

    // ── Guard: check required env vars ──
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json<FaceSwapResponse>({
        imageUrl: productImageUrl,
        fallback: true,
        error: "GEMINI_API_KEY not configured",
      })
    }

    try {
      // ── Single step: Generate user wearing product ──
      console.log("Generating virtual try-on with Gemini...")
      const resultImageDataUrl = await generateUserWearingProduct(userPhotoUrl, productImageUrl)

      if (!resultImageDataUrl) {
        return NextResponse.json<FaceSwapResponse>({
          imageUrl: productImageUrl,
          fallback: true,
          error: "Failed to generate try-on image",
        })
      }
      console.log("Virtual try-on generation complete")

      return NextResponse.json<FaceSwapResponse>({
        imageUrl: resultImageDataUrl,
        fallback: false,
      })
    } catch (genError) {
      console.error("Virtual try-on generation error:", genError)
      return NextResponse.json<FaceSwapResponse>({
        imageUrl: productImageUrl,
        fallback: true,
        error: genError instanceof Error ? genError.message : "Generation error",
      })
    }
  } catch (error) {
    console.error("Face swap route error:", error)
    return NextResponse.json(
      { error: "Failed to process face swap request" },
      { status: 500 }
    )
  }
}
