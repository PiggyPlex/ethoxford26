import type { BrandEntry, ColourEntry } from "@/lib/profile-types"

export interface SocialImportResult {
  platform: "instagram" | "pinterest" | "tiktok"
  handle: string
  followersAnalyzed: number
  discoveredBrands: BrandEntry[]
  discoveredColours: ColourEntry[]
  discoveredTags: string[]
  scanMessages: string[]
}

function logo(domain: string) {
  return `https://img.logo.dev/${domain}?token=pk_VAMPsVSMSC-VYyGOEOYXqw`
}

export const SOCIAL_IMPORT_RESULTS: Record<string, SocialImportResult> = {
  instagram: {
    platform: "instagram",
    handle: "@style.scout",
    followersAnalyzed: 847,
    discoveredBrands: [
      { name: "Jacquemus", logoUrl: logo("jacquemus.com") },
      { name: "Aime Leon Dore", logoUrl: logo("aimeleondore.com") },
      { name: "Rowing Blazers", logoUrl: logo("rowingblazers.com") },
      { name: "Kith", logoUrl: logo("kith.com") },
    ],
    discoveredColours: [
      { name: "Sage", hex: "#9CAF88" },
      { name: "Terracotta", hex: "#C67D5B" },
      { name: "Cream", hex: "#F5F0E8" },
    ],
    discoveredTags: ["Quiet Luxury", "Coastal", "Linen"],
    scanMessages: [
      "Connecting to @style.scout...",
      "Analyzing 847 followed accounts...",
      "Detecting brand preferences...",
      "Extracting colour palette from recent posts...",
      "Identifying style signals...",
    ],
  },
  pinterest: {
    platform: "pinterest",
    handle: "@pinboard_style",
    followersAnalyzed: 1243,
    discoveredBrands: [
      { name: "The Frankie Shop", logoUrl: logo("thefrankieshop.com") },
      { name: "Toteme", logoUrl: logo("toteme-studio.com") },
      { name: "Lemaire", logoUrl: logo("lemaire.fr") },
    ],
    discoveredColours: [
      { name: "Ecru", hex: "#E8DCC8" },
      { name: "Slate", hex: "#6B7B8D" },
      { name: "Onyx", hex: "#353839" },
    ],
    discoveredTags: ["Minimalist", "Scandinavian", "Quiet Luxury"],
    scanMessages: [
      "Connecting to @pinboard_style...",
      "Scanning 1,243 pinned items...",
      "Analyzing board aesthetics...",
      "Matching brands from your saves...",
      "Building colour profile...",
    ],
  },
  tiktok: {
    platform: "tiktok",
    handle: "@fit.check",
    followersAnalyzed: 562,
    discoveredBrands: [
      { name: "Corteiz", logoUrl: logo("corteiz.com") },
      { name: "Represent", logoUrl: logo("representclo.com") },
      { name: "Trapstar", logoUrl: logo("trapstarlondon.com") },
    ],
    discoveredColours: [
      { name: "Charcoal", hex: "#36454F" },
      { name: "Forest", hex: "#228B22" },
      { name: "Off-White", hex: "#FAF9F6" },
    ],
    discoveredTags: ["Streetwear", "Gorpcore", "Athleisure"],
    scanMessages: [
      "Connecting to @fit.check...",
      "Analyzing 562 liked videos...",
      "Detecting outfit styles...",
      "Matching brand mentions...",
      "Finalizing style analysis...",
    ],
  },
}
