"use client"

import { useState, useEffect, useCallback } from "react"
import { X, Check, Loader2 } from "lucide-react"
import { SOCIAL_IMPORT_RESULTS, type SocialImportResult } from "@/data/social-import-mocks"
import type { BrandEntry, ColourEntry } from "@/lib/profile-types"

type Screen = "auth" | "scanning" | "results"

interface SocialImportSheetProps {
  platform: "instagram" | "pinterest" | "tiktok"
  isOpen: boolean
  onClose: () => void
  onImport: (data: {
    platform: string
    handle: string
    brands: BrandEntry[]
    colours: ColourEntry[]
    tags: string[]
  }) => void
}

export function SocialImportSheet({
  platform,
  isOpen,
  onClose,
  onImport,
}: SocialImportSheetProps) {
  const [screen, setScreen] = useState<Screen>("auth")
  const [scanProgress, setScanProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState(0)
  const [resultsRevealed, setResultsRevealed] = useState(0)

  const mockData: SocialImportResult = SOCIAL_IMPORT_RESULTS[platform]

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setScreen("auth")
      setScanProgress(0)
      setCurrentMessage(0)
      setResultsRevealed(0)
    }
  }, [isOpen])

  // Scanning animation
  useEffect(() => {
    if (screen !== "scanning") return

    const messages = mockData.scanMessages
    const totalDuration = 3500
    const messageInterval = totalDuration / messages.length
    const progressInterval = 50

    // Progress bar
    const progressTimer = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer)
          return 100
        }
        return prev + 100 / (totalDuration / progressInterval)
      })
    }, progressInterval)

    // Messages
    const messageTimers = messages.map((_, i) =>
      setTimeout(() => setCurrentMessage(i), i * messageInterval)
    )

    // Transition to results
    const resultTimer = setTimeout(() => {
      setScreen("results")
    }, totalDuration + 300)

    return () => {
      clearInterval(progressTimer)
      messageTimers.forEach(clearTimeout)
      clearTimeout(resultTimer)
    }
  }, [screen, mockData.scanMessages])

  // Results stagger animation
  useEffect(() => {
    if (screen !== "results") return

    const totalItems = 3 // brands, colours, tags
    const timers = Array.from({ length: totalItems }, (_, i) =>
      setTimeout(() => setResultsRevealed(i + 1), (i + 1) * 400)
    )

    return () => timers.forEach(clearTimeout)
  }, [screen])

  const handleLogin = useCallback(() => {
    setScreen("scanning")
  }, [])

  const handleImport = useCallback(() => {
    onImport({
      platform,
      handle: mockData.handle,
      brands: mockData.discoveredBrands,
      colours: mockData.discoveredColours,
      tags: mockData.discoveredTags,
    })
    onClose()
  }, [platform, mockData, onImport, onClose])

  const platformConfig = {
    instagram: {
      name: "Instagram",
      gradient: "from-purple-500 via-pink-500 to-orange-400",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    pinterest: {
      name: "Pinterest",
      gradient: "from-red-600 to-red-500",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.94-.2-2.4.04-3.44l1.4-5.94s-.36-.72-.36-1.78c0-1.67.97-2.92 2.17-2.92 1.02 0 1.52.77 1.52 1.69 0 1.03-.66 2.57-.99 3.99-.28 1.19.6 2.16 1.77 2.16 2.13 0 3.76-2.25 3.76-5.49 0-2.87-2.06-4.87-5.01-4.87-3.41 0-5.42 2.56-5.42 5.2 0 1.03.4 2.13.89 2.73.1.12.11.22.08.34l-.33 1.36c-.05.22-.18.27-.4.16-1.5-.7-2.43-2.89-2.43-4.65 0-3.78 2.75-7.26 7.92-7.26 4.16 0 7.4 2.97 7.4 6.93 0 4.14-2.61 7.46-6.23 7.46-1.22 0-2.36-.63-2.75-1.38l-.75 2.85c-.27 1.04-1 2.35-1.49 3.14A12 12 0 1 0 12 0z" />
        </svg>
      ),
    },
    tiktok: {
      name: "TikTok",
      gradient: "from-neutral-900 to-neutral-800",
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.73a8.19 8.19 0 0 0 4.77 1.53V6.81a4.83 4.83 0 0 1-1.01-.12z" />
        </svg>
      ),
    },
  }

  const config = platformConfig[platform]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl animate-slide-up overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6">
          {/* Screen 1: Mock OAuth */}
          {screen === "auth" && (
            <div className="animate-fade-in">
              <div className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${config.gradient}`}>
                {config.icon}
              </div>

              <h3 className="text-center text-lg font-bold text-neutral-900">
                Connect {config.name}
              </h3>
              <p className="mt-1 text-center text-sm text-neutral-500">
                We&apos;ll scan your follows to detect your style.
              </p>

              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                    Username
                  </label>
                  <p className="mt-0.5 text-sm font-medium text-neutral-900">
                    {mockData.handle}
                  </p>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                  <label className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                    Password
                  </label>
                  <p className="mt-0.5 text-sm font-medium text-neutral-400">
                    ••••••••••
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogin}
                type="button"
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${config.gradient} px-5 py-3 text-sm font-semibold text-white transition-all hover:opacity-90`}
              >
                Log In
              </button>

              <p className="mt-3 text-center text-[11px] text-neutral-400">
                This is a simulated login. No real data is accessed.
              </p>
            </div>
          )}

          {/* Screen 2: Scanning Animation */}
          {screen === "scanning" && (
            <div className="animate-fade-in py-8">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center">
                <Loader2 className="h-10 w-10 text-neutral-400 animate-spin" />
              </div>

              <h3 className="text-center text-lg font-bold text-neutral-900">
                Analyzing your style
              </h3>

              {/* Progress bar */}
              <div className="mt-6 h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-neutral-900 transition-all duration-100 ease-linear"
                  style={{ width: `${Math.min(scanProgress, 100)}%` }}
                />
              </div>

              {/* Scan messages */}
              <div className="mt-4 h-6 flex items-center justify-center">
                {mockData.scanMessages.map((msg, i) => (
                  <p
                    key={msg}
                    className={`text-[12px] text-neutral-500 transition-all duration-300 absolute ${
                      i === currentMessage
                        ? "opacity-100 translate-y-0"
                        : i < currentMessage
                          ? "opacity-0 -translate-y-2"
                          : "opacity-0 translate-y-2"
                    }`}
                  >
                    {msg}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Screen 3: Results Reveal */}
          {screen === "results" && (
            <div className="animate-fade-in">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900">
                <Check className="h-6 w-6 text-white" />
              </div>

              <h3 className="text-center text-lg font-bold text-neutral-900">
                Style profile detected
              </h3>
              <p className="mt-1 text-center text-sm text-neutral-500">
                Found from {mockData.followersAnalyzed.toLocaleString()} accounts
              </p>

              <div className="mt-6 space-y-4">
                {/* Discovered Brands */}
                <div
                  className={`transition-all duration-500 ease-out ${
                    resultsRevealed >= 1
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3"
                  }`}
                >
                  <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
                    {mockData.discoveredBrands.length} new brands detected
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {mockData.discoveredBrands.map((brand) => (
                      <span
                        key={brand.name}
                        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 shadow-sm"
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

                {/* Discovered Colours */}
                <div
                  className={`transition-all duration-500 ease-out ${
                    resultsRevealed >= 2
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3"
                  }`}
                >
                  <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
                    Colour palette
                  </p>
                  <div className="flex gap-3">
                    {mockData.discoveredColours.map((colour) => (
                      <div key={colour.name} className="flex flex-col items-center gap-1">
                        <div
                          className="h-10 w-10 rounded-full border border-neutral-200/60 shadow-sm"
                          style={{ backgroundColor: colour.hex }}
                        />
                        <span className="text-[10px] text-neutral-500">
                          {colour.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discovered Tags */}
                <div
                  className={`transition-all duration-500 ease-out ${
                    resultsRevealed >= 3
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-3"
                  }`}
                >
                  <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider mb-2">
                    Style signals
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {mockData.discoveredTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-neutral-100 px-3 py-1.5 text-[12px] font-semibold text-neutral-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col gap-2">
                <button
                  onClick={handleImport}
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800"
                >
                  Add to Profile
                </button>
                <button
                  onClick={onClose}
                  type="button"
                  className="flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700"
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
