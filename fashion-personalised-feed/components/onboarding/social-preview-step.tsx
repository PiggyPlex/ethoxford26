"use client"

import { useState, useCallback } from "react"
import { ArrowLeft, ArrowRight, Instagram, Check } from "lucide-react"
import { SocialImportSheet } from "./social-import-sheet"
import type { UserProfile, BrandEntry, ColourEntry } from "@/lib/profile-types"

interface SocialPreviewStepProps {
  profile: Partial<UserProfile>
  onComplete: () => void
  onBack: () => void
  onImportData?: (data: {
    brands: BrandEntry[]
    colours: ColourEntry[]
    tags: string[]
    connection: { platform: "instagram" | "pinterest" | "tiktok"; handle: string }
  }) => void
}

export function SocialPreviewStep({
  profile,
  onComplete,
  onBack,
  onImportData,
}: SocialPreviewStepProps) {
  const [importSheet, setImportSheet] = useState<"instagram" | "pinterest" | "tiktok" | null>(null)
  const [connectedPlatforms, setConnectedPlatforms] = useState<
    { platform: string; handle: string }[]
  >([])

  const handleImport = useCallback(
    (data: {
      platform: string
      handle: string
      brands: BrandEntry[]
      colours: ColourEntry[]
      tags: string[]
    }) => {
      setConnectedPlatforms((prev) => [
        ...prev,
        { platform: data.platform, handle: data.handle },
      ])
      onImportData?.({
        brands: data.brands,
        colours: data.colours,
        tags: data.tags,
        connection: {
          platform: data.platform as "instagram" | "pinterest" | "tiktok",
          handle: data.handle,
        },
      })
    },
    [onImportData]
  )

  const isConnected = (platform: string) =>
    connectedPlatforms.some((c) => c.platform === platform)

  // Merge imported data with existing profile for preview
  const previewBrands = profile.favouriteBrands ?? []
  const previewTags = profile.styleTags ?? []

  return (
    <div className="flex min-h-screen flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Back button */}
        <button
          onClick={onBack}
          type="button"
          className="mb-8 flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Social import section */}
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          Connect your accounts
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Optional — we&apos;ll auto-detect your style from who you follow.
        </p>

        <div className="mt-6 flex gap-3">
          {/* Instagram card */}
          <SocialCard
            platform="Instagram"
            connected={isConnected("instagram")}
            connectedHandle={connectedPlatforms.find((c) => c.platform === "instagram")?.handle}
            gradient="from-purple-500 via-pink-500 to-orange-400"
            icon={<Instagram className="h-5 w-5 text-white" />}
            onConnect={() => setImportSheet("instagram")}
          />

          {/* Pinterest card */}
          <SocialCard
            platform="Pinterest"
            connected={isConnected("pinterest")}
            connectedHandle={connectedPlatforms.find((c) => c.platform === "pinterest")?.handle}
            gradient="from-red-600 to-red-500"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.94s-.36-.72-.36-1.78c0-1.67.97-2.92 2.17-2.92 1.02 0 1.52.77 1.52 1.69 0 1.03-.66 2.57-.99 3.99-.28 1.19.6 2.16 1.77 2.16 2.13 0 3.76-2.25 3.76-5.49 0-2.87-2.06-4.87-5.01-4.87-3.41 0-5.42 2.56-5.42 5.2 0 1.03.4 2.13.89 2.73.1.12.11.22.08.34l-.33 1.36c-.05.22-.18.27-.4.16-1.5-.7-2.43-2.89-2.43-4.65 0-3.78 2.75-7.26 7.92-7.26 4.16 0 7.4 2.97 7.4 6.93 0 4.14-2.61 7.46-6.23 7.46-1.22 0-2.36-.63-2.75-1.38l-.75 2.85c-.27 1.04-1 2.35-1.49 3.14A12 12 0 1 0 12 0z" />
              </svg>
            }
            onConnect={() => setImportSheet("pinterest")}
          />

          {/* TikTok card */}
          <SocialCard
            platform="TikTok"
            connected={isConnected("tiktok")}
            connectedHandle={connectedPlatforms.find((c) => c.platform === "tiktok")?.handle}
            gradient="from-neutral-900 to-neutral-800"
            icon={
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.77 1.53V6.81a4.83 4.83 0 0 1-1.01-.12z" />
              </svg>
            }
            onConnect={() => setImportSheet("tiktok")}
          />
        </div>

        {/* Profile Preview */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
            Your style profile
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Here&apos;s what we know about you so far.
          </p>

          <div className="mt-6 space-y-4">
            {/* Name */}
            <PreviewRow label="Name" value={profile.name ?? ""} />

            {/* Style tags */}
            {previewTags.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
                  Style DNA
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {previewTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-neutral-100 px-3 py-1 text-[12px] font-medium text-neutral-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Brands */}
            {previewBrands.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
                  Favourite Brands
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {previewBrands.map((brand) => (
                    <span
                      key={brand.name}
                      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1 text-[12px] font-medium text-neutral-700 shadow-sm"
                    >
                      <img
                        src={brand.logoUrl}
                        alt=""
                        className="h-3.5 w-auto"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                      {brand.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Colours */}
            {profile.preferredColours && profile.preferredColours.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
                  Colour Palette
                </p>
                <div className="flex gap-3">
                  {profile.preferredColours.map((c) => (
                    <div key={c.name} className="flex flex-col items-center gap-1">
                      <div
                        className="h-8 w-8 rounded-full border border-neutral-200/60 shadow-sm"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[10px] text-neutral-500">
                        {c.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {profile.sizes && Object.keys(profile.sizes).length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
                  Sizes
                </p>
                <div className="flex gap-3">
                  {Object.entries(profile.sizes).map(([cat, size]) =>
                    size ? (
                      <span
                        key={cat}
                        className="rounded-full bg-neutral-100 px-2.5 py-1 text-[12px] font-medium text-neutral-700"
                      >
                        {cat}: {size}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Budget */}
            {profile.priceRange && (
              <PreviewRow
                label="Budget"
                value={`${profile.priceRange.currency}${profile.priceRange.min} — ${profile.priceRange.currency}${profile.priceRange.max}`}
              />
            )}
          </div>
        </div>

        {/* Complete */}
        <button
          type="button"
          onClick={onComplete}
          className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800"
        >
          Looks Good, Let&apos;s Go
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Social Import Sheet */}
      {importSheet && (
        <SocialImportSheet
          platform={importSheet}
          isOpen={!!importSheet}
          onClose={() => setImportSheet(null)}
          onImport={handleImport}
        />
      )}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-medium text-neutral-900">{value}</span>
    </div>
  )
}

function SocialCard({
  platform,
  connected,
  connectedHandle,
  gradient,
  icon,
  onConnect,
}: {
  platform: string
  connected: boolean
  connectedHandle?: string
  gradient: string
  icon: React.ReactNode
  onConnect: () => void
}) {
  return (
    <div className="flex-1 rounded-xl border border-neutral-200 bg-white p-4 text-center">
      <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
        {icon}
      </div>
      <p className="text-sm font-medium text-neutral-900">{platform}</p>
      {connected ? (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <Check className="h-3.5 w-3.5 text-neutral-500" />
          <span className="text-[12px] font-medium text-neutral-500">
            {connectedHandle ?? "Connected"}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          className="mt-3 w-full rounded-lg bg-neutral-900 px-3 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Connect
        </button>
      )}
    </div>
  )
}
