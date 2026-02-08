/**
 * Client-side cache for face-swap results.
 * Stores face-swapped image data URLs from Replicate.
 */

const CACHE_PREFIX = "friendos-faceswap-"
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

interface CachedFaceSwap {
  imageUrl: string
  generatedAt: number
  photoHash: string
}

/** Simple hash of the user's photo for cache invalidation */
export function computePhotoHash(photoUrl: string): string {
  return `${photoUrl.slice(0, 50)}_${photoUrl.length}`
}

/**
 * Generate a short hash from a URL for cache key purposes
 * Uses a simple hash algorithm to create a consistent 8-character identifier
 */
function hashUrl(url: string): string {
  let hash = 0
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  // Convert to base36 and take first 8 chars for readability
  return Math.abs(hash).toString(36).substring(0, 8)
}

/** Get cached face-swap result, or null if missing/expired/invalidated */
export function getCachedFaceSwap(
  productId: string,
  productImageUrl: string,
  currentPhotoHash: string
): string | null {
  try {
    const imageHash = hashUrl(productImageUrl)
    const key = `${CACHE_PREFIX}${productId}__${imageHash}`
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const cached: CachedFaceSwap = JSON.parse(raw)

    // Check TTL
    if (Date.now() - cached.generatedAt > CACHE_TTL) {
      localStorage.removeItem(key)
      return null
    }

    // Check photo hash (invalidate if user changed their photo)
    if (cached.photoHash !== currentPhotoHash) {
      localStorage.removeItem(key)
      return null
    }

    return cached.imageUrl
  } catch {
    return null
  }
}

/** Store a face-swap result in cache */
export function setCachedFaceSwap(
  productId: string,
  productImageUrl: string,
  imageUrl: string,
  photoHash: string
): void {
  const imageHash = hashUrl(productImageUrl)
  const key = `${CACHE_PREFIX}${productId}__${imageHash}`
  const entry: CachedFaceSwap = {
    imageUrl,
    generatedAt: Date.now(),
    photoHash,
  }

  try {
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // QuotaExceededError — evict oldest entry and retry
    evictOldest()
    try {
      localStorage.setItem(key, JSON.stringify(entry))
    } catch {
      // Give up silently
    }
  }
}

/** Clear all face-swap cache entries (e.g., when user changes photo) */
export function clearAllFaceSwapCache(): void {
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(CACHE_PREFIX)) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key))
}

/** Evict the oldest cache entry (LRU) */
function evictOldest(): void {
  let oldestKey: string | null = null
  let oldestTime = Infinity

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(CACHE_PREFIX)) continue

    try {
      const cached: CachedFaceSwap = JSON.parse(localStorage.getItem(key) ?? "")
      if (cached.generatedAt < oldestTime) {
        oldestTime = cached.generatedAt
        oldestKey = key
      }
    } catch {
      // Corrupted entry — remove it
      if (key) localStorage.removeItem(key)
      return
    }
  }

  if (oldestKey) localStorage.removeItem(oldestKey)
}
