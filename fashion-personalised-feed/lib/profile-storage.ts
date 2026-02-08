import type { UserProfile } from "./profile-types"

const STORAGE_KEY = "friendos-profile-v1"

// ── Default profile (matches the current hardcoded data) ─────────────────────

export const DEFAULT_PROFILE: UserProfile = {
  name: "Abdussalam",
  onboardingComplete: true,
  favouriteBrands: [
    { name: "Nike", logoUrl: "https://img.logo.dev/nike.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw" },
    { name: "Carhartt WIP", logoUrl: "https://img.logo.dev/carhartt-wip.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw" },
    { name: "Stüssy", logoUrl: "https://img.logo.dev/stussy.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw" },
    { name: "COS", logoUrl: "https://img.logo.dev/cos.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw" },
    { name: "New Balance", logoUrl: "https://img.logo.dev/newbalance.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw" },
    { name: "Arket", logoUrl: "https://img.logo.dev/arket.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw" },
  ],
  preferredColours: [
    { name: "Black", hex: "#1a1a1a" },
    { name: "Navy", hex: "#1e3a5f" },
    { name: "Olive", hex: "#556b2f" },
    { name: "Cream", hex: "#f5f0e1" },
    { name: "Stone", hex: "#c2b280" },
    { name: "White", hex: "#f8f8f8" },
  ],
  sizes: {
    Tops: "UK M",
    Bottoms: "UK 32",
    Shoes: "UK 10",
  },
  priceRange: { min: 50, max: 200, currency: "£" },
  styleTags: ["Streetwear", "Smart Casual", "Minimalist", "Workwear", "Scandi"],
  recentPurchases: [
    { name: "Nike Air Max 90", price: "£129.99", date: "2 weeks ago" },
    { name: "Carhartt WIP Michigan Coat", price: "£269.00", date: "1 month ago" },
    { name: "COS Merino Crew Neck", price: "£65.00", date: "1 month ago" },
  ],
  socialConnections: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

// ── localStorage helpers ─────────────────────────────────────────────────────

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return
  try {
    const updated = { ...profile, updatedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // localStorage full or unavailable — silent fail
  }
}

export function clearProfile(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

export function hasCompletedOnboarding(): boolean {
  const profile = loadProfile()
  return profile?.onboardingComplete ?? false
}
