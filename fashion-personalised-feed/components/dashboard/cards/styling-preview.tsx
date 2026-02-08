"use client"

import { useState, useCallback, useEffect } from "react"
import { X, Sparkles, RefreshCw, Heart } from "lucide-react"
import { useProfile } from "@/lib/profile-context"

interface StylingPreviewProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  brand: string
}

interface StylingResult {
  imageUrl?: string
  imageData?: string
  mimeType?: string
  fallback: boolean
  description: string
}

export function StylingPreview({
  isOpen,
  onClose,
  productName,
  brand,
}: StylingPreviewProps) {
  const { profile } = useProfile()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<StylingResult | null>(null)
  const [saved, setSaved] = useState(false)

  const generateStyling = useCallback(async () => {
    setLoading(true)
    setSaved(false)
    setResult(null)

    try {
      const res = await fetch("/api/generate-styling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          brand,
          userProfile: profile
            ? {
                name: profile.name,
                styleTags: profile.styleTags,
                sizes: profile.sizes,
              }
            : undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setResult(data)
      } else {
        setResult({
          imageUrl:
            "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/77902123-b424-4ad4-a0fd-fb177c82232d/M+NK+DF+MILER+SS.png",
          fallback: true,
          description: `A styled look featuring the ${productName} by ${brand}`,
        })
      }
    } catch {
      setResult({
        imageUrl:
          "https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/77902123-b424-4ad4-a0fd-fb177c82232d/M+NK+DF+MILER+SS.png",
        fallback: true,
        description: `A styled look featuring the ${productName} by ${brand}`,
      })
    } finally {
      setLoading(false)
    }
  }, [productName, brand, profile])

  // Trigger generation when opened
  useEffect(() => {
    if (isOpen && !result && !loading) {
      generateStyling()
    }
  }, [isOpen, result, loading, generateStyling])

  // Reset state when closed
  useEffect(() => {
    if (!isOpen) {
      setResult(null)
      setSaved(false)
      setLoading(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const imageSrc = result?.imageData
    ? `data:${result.mimeType ?? "image/png"};base64,${result.imageData}`
    : result?.imageUrl

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl animate-slide-up overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-neutral-500 transition-colors hover:bg-white hover:text-neutral-900 shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Image area */}
        <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              {/* Shimmer loading */}
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-neutral-200 animate-pulse" />
                <Sparkles className="absolute inset-0 m-auto h-7 w-7 text-neutral-400 animate-spin" style={{ animationDuration: "3s" }} />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-neutral-700">
                  Styling this for you...
                </p>
                <p className="mt-1 text-[11px] text-neutral-400">
                  Generating with AI · Takes a few seconds
                </p>
              </div>
              {/* Shimmer bars */}
              <div className="w-48 space-y-2 mt-2">
                <div className="h-2 w-full rounded-full bg-neutral-200 animate-pulse" />
                <div className="h-2 w-3/4 rounded-full bg-neutral-200 animate-pulse" style={{ animationDelay: "150ms" }} />
                <div className="h-2 w-1/2 rounded-full bg-neutral-200 animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {!loading && imageSrc && (
            <img
              src={imageSrc}
              alt={result?.description ?? "Styled look"}
              className="h-full w-full object-cover animate-fade-in"
            />
          )}

          {/* Styled for badge */}
          {!loading && result && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-4 pb-4 pt-12">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-white/80" />
                <span className="text-[11px] font-medium text-white/80">
                  Styled{profile?.name ? ` for ${profile.name}` : ""} by AI
                </span>
              </div>
              <p className="mt-1 text-[14px] font-semibold text-white">
                {productName}
              </p>
              <p className="text-[12px] text-white/70">{brand}</p>
            </div>
          )}

          {/* Fallback notice */}
          {!loading && result?.fallback && (
            <div className="absolute top-4 left-4">
              <span className="rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium text-neutral-500 shadow-sm">
                Similar look
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 space-y-3">
          {result?.description && (
            <p className="text-[12px] text-neutral-500 leading-relaxed">
              {result.description}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => setSaved(true)}
              disabled={saved}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-[13px] font-semibold text-white transition-all hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500"
            >
              <Heart className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
              {saved ? "Saved" : "Save Look"}
            </button>
            <button
              onClick={generateStyling}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[13px] font-medium text-neutral-600 transition-all hover:bg-neutral-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Try Another
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
