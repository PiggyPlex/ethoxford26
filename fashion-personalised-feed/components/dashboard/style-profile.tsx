"use client"

import { useState, useCallback } from "react"
import { Heart, Ruler, Palette, PoundSterling, ShoppingBag, Instagram, Plus, User, Camera } from "lucide-react"
import { useProfile } from "@/lib/profile-context"
import { DEFAULT_PROFILE } from "@/lib/profile-storage"
import { SocialImportSheet } from "@/components/onboarding/social-import-sheet"
import { PhotoUpload } from "@/components/shared/photo-upload"
import { clearAllTryOnCache } from "@/lib/tryon-cache"
import type { BrandEntry, ColourEntry } from "@/lib/profile-types"

// ── Component ─────────────────────────────────────────────────────────────────

export function StyleProfile() {
  const { profile, updateProfile } = useProfile()
  const p = profile ?? DEFAULT_PROFILE
  const [importPlatform, setImportPlatform] = useState<"instagram" | "pinterest" | "tiktok" | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const handleSocialImport = useCallback(
    (data: {
      platform: string
      handle: string
      brands: BrandEntry[]
      colours: ColourEntry[]
      tags: string[]
    }) => {
      if (!profile) return
      // Merge brands
      const existingBrandNames = new Set(profile.favouriteBrands.map((b) => b.name))
      const newBrands = data.brands.filter((b) => !existingBrandNames.has(b.name))
      // Merge tags
      const existingTags = new Set(profile.styleTags)
      const newTags = data.tags.filter((t) => !existingTags.has(t))
      // Merge colours
      const existingHexes = new Set(profile.preferredColours.map((c) => c.hex))
      const newColours = data.colours.filter((c) => !existingHexes.has(c.hex))

      updateProfile({
        favouriteBrands: [...profile.favouriteBrands, ...newBrands],
        styleTags: [...profile.styleTags, ...newTags],
        preferredColours: [...profile.preferredColours, ...newColours],
        socialConnections: [
          ...profile.socialConnections,
          {
            platform: data.platform as "instagram" | "pinterest" | "tiktok",
            handle: data.handle,
            connectedAt: new Date().toISOString(),
          },
        ],
      })
    },
    [profile, updateProfile]
  )

  return (
    <div className="flex flex-col gap-6 px-8 pb-12 animate-fade-in">
      {/* Photo section */}
      <div className="flex items-center gap-5 rounded-2xl border border-border/50 bg-white/70 backdrop-blur-sm p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <PhotoUpload
          currentPhotoUrl={p.photoUrl}
          onPhotoChange={(dataUrl) => {
            updateProfile({ photoUrl: dataUrl })
            clearAllTryOnCache()
          }}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Camera className="h-4 w-4 text-neutral-500" />
            Your Photo
          </h3>
          <p className="mt-0.5 text-[12px] text-neutral-500">
            {p.photoUrl
              ? "Used for virtual try-on in your moodboard."
              : "Add a photo to see yourself wearing products."}
          </p>
        </div>
      </div>

      {/* Header with Edit button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Your inferred style profile, built from browsing, purchases, and
          preferences.
        </p>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm font-medium text-primary hover:underline transition-all"
        >
          {isEditing ? "Done" : "Edit"}
        </button>
      </div>

      {/* Profile completeness banner */}
      {(p.favouriteBrands.length === 0 ||
        p.styleTags.length === 0 ||
        Object.keys(p.sizes).length === 0 ||
        p.socialConnections.length === 0) && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-white">
            <User className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-neutral-900">
              Complete your profile
            </p>
            <p className="text-[11px] text-neutral-500">
              {[
                p.favouriteBrands.length === 0 && "brands",
                p.styleTags.length === 0 && "style tags",
                Object.keys(p.sizes).length === 0 && "sizes",
                p.socialConnections.length === 0 && "social accounts",
              ]
                .filter(Boolean)
                .join(", ")}{" "}
              still needed for better recommendations.
            </p>
          </div>
        </div>
      )}

      {/* Grid layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Favourite Brands */}
        <SectionCard
          icon={<Heart className="h-4 w-4" />}
          title="Favourite Brands"
        >
          {isEditing ? (
            <input
              type="text"
              value={p.favouriteBrands.map(b => b.name).join(", ")}
              onChange={(e) => {
                const brands = e.target.value.split(",").map(name => ({
                  name: name.trim(),
                  logoUrl: `https://img.logo.dev/${name.trim().toLowerCase().replace(/\s+/g, '')}.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw`
                })).filter(b => b.name)
                updateProfile({ favouriteBrands: brands })
              }}
              placeholder="Nike, Adidas, Zara..."
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {p.favouriteBrands.map((b) => (
                <span
                  key={b.name}
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 shadow-sm"
                >
                  <img
                    src={b.logoUrl}
                    alt=""
                    className="h-4 w-auto"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  {b.name}
                </span>
              ))}
              {p.favouriteBrands.length === 0 && (
                <span className="text-[12px] text-neutral-400">No brands added yet</span>
              )}
            </div>
          )}
        </SectionCard>

        {/* Preferred Colours */}
        <SectionCard
          icon={<Palette className="h-4 w-4" />}
          title="Preferred Colours"
        >
          <div className="flex flex-wrap gap-3">
            {p.preferredColours.map((c) => (
              <div key={c.name} className="flex flex-col items-center gap-1">
                <div
                  className="h-8 w-8 rounded-full border border-neutral-200/60 shadow-sm"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Sizes */}
        <SectionCard
          icon={<Ruler className="h-4 w-4" />}
          title="Sizes"
        >
          <div className="flex flex-col gap-2">
            {Object.entries(p.sizes).map(([category, size]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground">
                  {category}
                </span>
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[12px] font-semibold text-neutral-700">
                  {size}
                </span>
              </div>
            ))}
            {Object.keys(p.sizes).length === 0 && (
              <span className="text-[12px] text-neutral-400">No sizes set</span>
            )}
          </div>
        </SectionCard>

        {/* Price Range */}
        <SectionCard
          icon={<PoundSterling className="h-4 w-4" />}
          title="Price Range"
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[12px] text-muted-foreground">
                Sweet spot
              </span>
              <span className="text-[13px] font-bold text-foreground">
                {p.priceRange.currency}{p.priceRange.min} &ndash; {p.priceRange.currency}{p.priceRange.max}
              </span>
            </div>
            {/* Range bar visualisation */}
            <div className="relative h-2 w-full rounded-full bg-neutral-100">
              <div
                className="absolute h-2 rounded-full bg-neutral-400"
                style={{
                  left: `${(p.priceRange.min / 500) * 100}%`,
                  width: `${((p.priceRange.max - p.priceRange.min) / 500) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground/60">
              <span>{p.priceRange.currency}0</span>
              <span>{p.priceRange.currency}500+</span>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Full-width sections */}

      {/* Style Tags */}
      <div className="rounded-2xl border border-border/50 bg-white/70 backdrop-blur-sm p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Palette className="h-4 w-4 text-neutral-500" />
          Style DNA
        </h3>
        <div className="flex flex-wrap gap-2">
          {p.styleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-3.5 py-1.5 text-[12px] font-semibold text-neutral-700"
            >
              {tag}
            </span>
          ))}
          {p.styleTags.length === 0 && (
            <span className="text-[12px] text-neutral-400">No style tags yet</span>
          )}
        </div>
      </div>

      {/* Recent Purchases */}
      {p.recentPurchases.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-white/70 backdrop-blur-sm p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShoppingBag className="h-4 w-4 text-neutral-500" />
            Recent Purchases
          </h3>
          <div className="flex flex-col gap-2">
            {p.recentPurchases.map((purchase) => (
              <div
                key={purchase.name}
                className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {purchase.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{purchase.date}</p>
                </div>
                <span className="text-[13px] font-bold text-foreground">
                  {purchase.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connected Accounts */}
      <div className="rounded-2xl border border-border/50 bg-white/70 backdrop-blur-sm p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="text-neutral-500">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </span>
          Connected Accounts
        </h3>
        {p.socialConnections.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {p.socialConnections.map((conn) => (
              <div key={conn.platform} className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-neutral-700 capitalize">{conn.platform}</span>
                  <span className="text-[11px] text-neutral-500">{conn.handle}</span>
                </div>
                <span className="text-[10px] text-neutral-400">Connected</span>
              </div>
            ))}
          </div>
        )}
        {/* Connect buttons for platforms not yet connected */}
        <div className="flex gap-2">
          {!p.socialConnections.find((c) => c.platform === "instagram") && (
            <button
              type="button"
              onClick={() => setImportPlatform("instagram")}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[12px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              <Instagram className="h-3.5 w-3.5" />
              Instagram
              <Plus className="h-3 w-3 text-neutral-400" />
            </button>
          )}
          {!p.socialConnections.find((c) => c.platform === "pinterest") && (
            <button
              type="button"
              onClick={() => setImportPlatform("pinterest")}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[12px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.94s-.36-.72-.36-1.78c0-1.67.97-2.92 2.17-2.92 1.02 0 1.52.77 1.52 1.69 0 1.03-.66 2.57-.99 3.99-.28 1.19.6 2.16 1.77 2.16 2.13 0 3.76-2.25 3.76-5.49 0-2.87-2.06-4.87-5.01-4.87-3.41 0-5.42 2.56-5.42 5.2 0 1.03.4 2.13.89 2.73.1.12.11.22.08.34l-.33 1.36c-.05.22-.18.27-.4.16-1.5-.7-2.43-2.89-2.43-4.65 0-3.78 2.75-7.26 7.92-7.26 4.16 0 7.4 2.97 7.4 6.93 0 4.14-2.61 7.46-6.23 7.46-1.22 0-2.36-.63-2.75-1.38l-.75 2.85c-.27 1.04-1 2.35-1.49 3.14A12 12 0 1 0 12 0z" /></svg>
              Pinterest
              <Plus className="h-3 w-3 text-neutral-400" />
            </button>
          )}
          {!p.socialConnections.find((c) => c.platform === "tiktok") && (
            <button
              type="button"
              onClick={() => setImportPlatform("tiktok")}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-[12px] font-medium text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.77 1.53V6.81a4.83 4.83 0 0 1-1.01-.12z" /></svg>
              TikTok
              <Plus className="h-3 w-3 text-neutral-400" />
            </button>
          )}
        </div>
      </div>

      {/* Social Import Sheet */}
      {importPlatform && (
        <SocialImportSheet
          platform={importPlatform}
          isOpen={!!importPlatform}
          onClose={() => setImportPlatform(null)}
          onImport={handleSocialImport}
        />
      )}
    </div>
  )
}

// ── Reusable card wrapper ─────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-white/70 backdrop-blur-sm p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="text-neutral-500">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  )
}
