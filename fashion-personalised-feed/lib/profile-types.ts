// ── Canonical user profile type ──────────────────────────────────────────────

export interface UserProfile {
  /** Display name */
  name: string
  /** Whether the user has completed onboarding */
  onboardingComplete: boolean

  /** Style preferences */
  favouriteBrands: BrandEntry[]
  preferredColours: ColourEntry[]
  sizes: Record<string, string>
  priceRange: PriceRange
  styleTags: string[]

  /** Shopping history (mock) */
  recentPurchases: PurchaseEntry[]

  /** Connected social accounts */
  socialConnections: SocialConnection[]

  /** Base64 data URL of user's selfie for virtual try-on */
  photoUrl?: string

  /** Timestamps */
  createdAt: string
  updatedAt: string
}

export interface BrandEntry {
  name: string
  logoUrl: string
}

export interface ColourEntry {
  name: string
  hex: string
}

export interface PriceRange {
  min: number
  max: number
  currency: string
}

export interface PurchaseEntry {
  name: string
  price: string
  date: string
}

export interface SocialConnection {
  platform: "instagram" | "pinterest" | "tiktok"
  handle: string
  connectedAt: string
}
