"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { useProfile } from "@/lib/profile-context"
import {
  getCachedTryOn,
  setCachedTryOn,
  computePhotoHash,
} from "@/lib/tryon-cache"
import { inferGarmentCategory } from "@/lib/garment-category"

// ── Concurrency limiter (module-level, shared across all hook instances) ────
const inFlightRequests = new Set<string>()
const MAX_CONCURRENT = 2

interface UseTryOnOptions {
  notificationId: string
  clothingImageUrl: string
  productName: string
  type: string
  enabled?: boolean
}

interface UseTryOnResult {
  tryOnImageUrl: string | null
  isGenerating: boolean
  error: string | null
  generate: () => void
}

/** Eligible types for virtual try-on (single garment images) */
const ELIGIBLE_TYPES = new Set(["product", "trending", "deal"])

export function useTryOn({
  notificationId,
  clothingImageUrl,
  productName,
  type,
  enabled = true,
}: UseTryOnOptions): UseTryOnResult {
  const { profile } = useProfile()
  const [tryOnImageUrl, setTryOnImageUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(false)

  // Determine if try-on is possible
  const canTryOn =
    enabled && !!profile?.photoUrl && ELIGIBLE_TYPES.has(type) && !!clothingImageUrl

  // Check cache on mount / when dependencies change
  useEffect(() => {
    if (!canTryOn || !profile?.photoUrl) return

    const hash = computePhotoHash(profile.photoUrl)
    const cached = getCachedTryOn(notificationId, hash)
    if (cached) {
      setTryOnImageUrl(cached)
    }
  }, [canTryOn, notificationId, profile?.photoUrl])

  const generate = useCallback(async () => {
    console.log(`[useTryOn] generate() called for notification ${notificationId}`)

    if (!canTryOn || !profile?.photoUrl) {
      console.log(`[useTryOn] Cannot try-on: canTryOn=${canTryOn}, hasPhoto=${!!profile?.photoUrl}`)
      return
    }
    if (isGenerating) {
      console.log(`[useTryOn] Already generating, skipping`)
      return
    }
    if (tryOnImageUrl) {
      console.log(`[useTryOn] Already have result, skipping`)
      return
    }

    // Check cache first
    const hash = computePhotoHash(profile.photoUrl)
    const cached = getCachedTryOn(notificationId, hash)
    if (cached) {
      console.log(`[useTryOn] Using cached result for ${notificationId}`)
      setTryOnImageUrl(cached)
      return
    }

    // Check concurrency limit
    if (inFlightRequests.size >= MAX_CONCURRENT) {
      console.log(`[useTryOn] Concurrency limit reached, queuing request`)
      // Queue by retrying after a delay
      setTimeout(() => {
        if (!abortRef.current) generate()
      }, 2000)
      return
    }

    console.log(`[useTryOn] Starting try-on generation for ${notificationId}`)
    abortRef.current = false
    setIsGenerating(true)
    setError(null)
    inFlightRequests.add(notificationId)

    try {
      const category = inferGarmentCategory(productName)

      const response = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personImageUrl: profile.photoUrl,
          clothingImageUrl,
          category,
        }),
      })

      if (abortRef.current) return

      const data = await response.json()

      if (data.fallback || !data.imageUrl) {
        const errorMsg = data.error ?? "Try-on generation failed"
        console.error(`[useTryOn] Try-on failed: ${errorMsg}`)
        setError(errorMsg)
        return
      }

      // Cache and set result
      console.log(`[useTryOn] Try-on successful for ${notificationId}, caching result`)
      setCachedTryOn(notificationId, data.imageUrl, hash)
      setTryOnImageUrl(data.imageUrl)
    } catch (err) {
      if (!abortRef.current) {
        setError(err instanceof Error ? err.message : "Network error")
      }
    } finally {
      inFlightRequests.delete(notificationId)
      if (!abortRef.current) {
        setIsGenerating(false)
      }
    }
  }, [canTryOn, profile?.photoUrl, isGenerating, tryOnImageUrl, notificationId, clothingImageUrl, productName])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current = true
    }
  }, [])

  return {
    tryOnImageUrl: canTryOn ? tryOnImageUrl : null,
    isGenerating,
    error,
    generate,
  }
}
