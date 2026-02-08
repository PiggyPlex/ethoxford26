/**
 * Client-side cache for virtual try-on results.
 * Stores try-on image data URLs from Vertex AI Virtual Try-On.
 */

const CACHE_PREFIX = "friendos-tryon-"
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

interface CachedTryOn {
  imageUrl: string
  generatedAt: number
  photoHash: string
}

/** Simple hash of the user's photo for cache invalidation */
export function computePhotoHash(photoUrl: string): string {
  return `${photoUrl.slice(0, 50)}_${photoUrl.length}`
}

/** Get cached try-on result, or null if missing/expired/invalidated */
export function getCachedTryOn(
  notificationId: string,
  currentPhotoHash: string
): string | null {
  try {
    const key = `${CACHE_PREFIX}${notificationId}`
    const raw = localStorage.getItem(key)
    if (!raw) return null

    const cached: CachedTryOn = JSON.parse(raw)

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

/** Store a try-on result in cache */
export function setCachedTryOn(
  notificationId: string,
  imageUrl: string,
  photoHash: string
): void {
  const key = `${CACHE_PREFIX}${notificationId}`
  const entry: CachedTryOn = {
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

/** Clear all try-on cache entries (e.g., when user changes photo) */
export function clearAllTryOnCache(): void {
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
      const cached: CachedTryOn = JSON.parse(localStorage.getItem(key) ?? "")
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
