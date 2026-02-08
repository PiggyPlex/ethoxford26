import { NextResponse } from "next/server"
import { GoogleAuth } from "google-auth-library"

// ── Types ────────────────────────────────────────────────────────────────────

interface TryOnRequest {
  personImageUrl: string // base64 data URL from localStorage
  clothingImageUrl: string // HTTPS URL (e.g. Unsplash)
  category?: string // kept for interface compat; Vertex ignores it
}

interface VertexPrediction {
  bytesBase64Encoded: string
}

interface VertexResponse {
  predictions: VertexPrediction[]
}

// Allow up to 60s for Vertex AI processing (important for Vercel deployments)
export const maxDuration = 60

// ── Auth singleton ───────────────────────────────────────────────────────────

let authClient: GoogleAuth | null = null

function getAuthClient(): GoogleAuth {
  if (!authClient) {
    authClient = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    })
  }
  return authClient
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Strip the `data:image/...;base64,` prefix from a data URL,
 * returning only the raw base64 payload.
 */
function stripDataUrlPrefix(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(",")
  if (commaIndex === -1) return dataUrl
  return dataUrl.slice(commaIndex + 1)
}

/**
 * Fetch an image from a URL and return its content as a base64 string.
 * Used for clothing images which arrive as HTTPS URLs.
 */
async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image: ${response.status} ${response.statusText}`
    )
  }
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return buffer.toString("base64")
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const { personImageUrl, clothingImageUrl } =
      (await request.json()) as TryOnRequest

    // ── Guard: check required env vars ──
    const project = process.env.GOOGLE_CLOUD_PROJECT
    const location = process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1"

    if (!project) {
      return NextResponse.json({
        imageUrl: clothingImageUrl,
        fallback: true,
        error: "GOOGLE_CLOUD_PROJECT not configured",
      })
    }

    try {
      // ── Guard: need a valid clothing image URL ──
      if (!clothingImageUrl || !clothingImageUrl.startsWith("http")) {
        return NextResponse.json({
          imageUrl: clothingImageUrl,
          fallback: true,
          error: "No valid clothing image URL provided",
        })
      }

      // ── 1. Prepare images as raw base64 ──
      const personBase64 = stripDataUrlPrefix(personImageUrl)
      const productBase64 = await urlToBase64(clothingImageUrl)

      // ── 2. Get access token ──
      const auth = getAuthClient()
      const accessToken = await auth.getAccessToken()

      // ── 3. Call Vertex AI Virtual Try-On ──
      const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/virtual-try-on-001:predict`

      const vertexResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instances: [
            {
              personImage: {
                image: { bytesBase64Encoded: personBase64 },
              },
              productImages: [
                {
                  image: { bytesBase64Encoded: productBase64 },
                },
              ],
            },
          ],
          parameters: {
            sampleCount: 1,
            personGeneration: "allow_adult",
          },
        }),
      })

      if (!vertexResponse.ok) {
        const errorBody = await vertexResponse.text()
        console.error("Vertex AI error:", vertexResponse.status, errorBody)
        return NextResponse.json({
          imageUrl: clothingImageUrl,
          fallback: true,
          error: `Vertex AI returned ${vertexResponse.status}`,
        })
      }

      const result: VertexResponse = await vertexResponse.json()

      if (!result.predictions?.length) {
        console.error("Vertex AI returned no predictions")
        return NextResponse.json({
          imageUrl: clothingImageUrl,
          fallback: true,
          error: "No predictions returned",
        })
      }

      // ── 4. Return as data URL ──
      const outputBase64 = result.predictions[0].bytesBase64Encoded
      const dataUrl = `data:image/png;base64,${outputBase64}`

      return NextResponse.json({
        imageUrl: dataUrl,
        fallback: false,
      })
    } catch (genError) {
      console.error("Vertex AI try-on error:", genError)
      return NextResponse.json({
        imageUrl: clothingImageUrl,
        fallback: true,
        error: genError instanceof Error ? genError.message : "API error",
      })
    }
  } catch (error) {
    console.error("Try-on route error:", error)
    return NextResponse.json(
      { error: "Failed to process try-on request" },
      { status: 500 }
    )
  }
}
