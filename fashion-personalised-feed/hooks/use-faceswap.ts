"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useProfile } from "@/lib/profile-context"
import {
  getCachedFaceSwap,
  setCachedFaceSwap,
  computePhotoHash,
} from "@/lib/faceswap-cache"

// ── Concurrency limiter (module-level, shared across all hook instances) ────
const inFlightRequests = new Set<string>()
const MAX_CONCURRENT = 8  // Allow all eligible cards to process in parallel

interface UseFaceSwapOptions {
  productId: string
  productImageUrl: string
  enabled?: boolean
}

interface UseFaceSwapResult {
  faceSwapImageUrl: string | null
  isGenerating: boolean
  error: string | null
  generate: () => void
}

/** Eligible types for face-swap (single garment images with models) */
const ELIGIBLE_TYPES = new Set(["product", "trending", "deal"])

export function useFaceSwap({
  productId,
  productImageUrl,
  enabled = true,
}: UseFaceSwapOptions): UseFaceSwapResult {
  const { profile } = useProfile()
  const [faceSwapImageUrl, setFaceSwapImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(false)

  // Determine if face-swap is possible
  const canFaceSwap = enabled && !!profile?.photoUrl && !!productImageUrl

  // Check cache on mount / when dependencies change
  useEffect(() => {
    if (!canFaceSwap || !profile?.photoUrl) return

    const hash = computePhotoHash(profile.photoUrl)
    const cached = getCachedFaceSwap(productId, productImageUrl, hash)
    if (cached) {
      setFaceSwapImageUrl(cached)
    }
  }, [canFaceSwap, productId, productImageUrl, profile?.photoUrl])

  const generate = useCallback(async () => {
    console.log(`[useFaceSwap] generate() called for product ${productId}`)

    if (!canFaceSwap || !profile?.photoUrl) {
      console.log(`[useFaceSwap] Cannot face-swap: canFaceSwap=${canFaceSwap}, hasPhoto=${!!profile?.photoUrl}`)
      return
    }
    if (isGenerating) {
      console.log(`[useFaceSwap] Already generating, skipping`)
      return
    }
    if (faceSwapImageUrl) {
      console.log(`[useFaceSwap] Already have result, skipping`)
      return
    }

    // Check cache first
    const hash = computePhotoHash(profile.photoUrl)
    const cached = getCachedFaceSwap(productId, productImageUrl, hash)
    if (cached) {
      console.log(`[useFaceSwap] Using cached result for ${productId}`)
      setFaceSwapImageUrl(cached)
      return
    }

    // Check concurrency limit
    if (inFlightRequests.size >= MAX_CONCURRENT) {
      console.log(`[useFaceSwap] Concurrency limit reached, queuing request`)
      // Queue by retrying after a delay
      setTimeout(() => {
        if (!abortRef.current) generate()
      }, 2000)
      return
    }

    console.log(`[useFaceSwap] Starting face-swap generation for ${productId}`)
    abortRef.current = false
    setIsGenerating(true)
    setError(null)
    inFlightRequests.add(productId)

    try {
      const response = await fetch("/api/face-swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPhotoUrl: profile.photoUrl,
          productImageUrl,
        }),
      })

      if (abortRef.current) return

      const data = await response.json()

      if (data.fallback || !data.imageUrl) {
        const errorMsg = data.error ?? "Face swap failed"
        console.error(`[useFaceSwap] Face swap failed: ${errorMsg}`)
        setError(errorMsg)
        return
      }

      // Cache and set result
      console.log(`[useFaceSwap] Face swap successful for ${productId}, caching result`)
      setCachedFaceSwap(productId, productImageUrl, data.imageUrl, hash)
      setFaceSwapImageUrl(data.imageUrl)
    } catch (err) {
      if (!abortRef.current) {
        setError(err instanceof Error ? err.message : "Network error")
      }
    } finally {
      inFlightRequests.delete(productId)
      if (!abortRef.current) {
        setIsGenerating(false)
      }
    }
  }, [
    canFaceSwap,
    profile?.photoUrl,
    isGenerating,
    faceSwapImageUrl,
    productId,
    productImageUrl,
  ])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current = true
    }
  }, [])

  return {
    faceSwapImageUrl: canFaceSwap ? faceSwapImageUrl : null,
    isGenerating,
    error,
    generate,
  }
}
