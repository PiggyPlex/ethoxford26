"use client"

import { useState, useEffect } from "react"
import type { Notification } from "@/data/mockData"
import { BrandLogo } from "@/components/shared/brand-logo"
import { ProvenanceSection } from "./provenance-section"
import { getTypeConfig } from "@/data/notification-type-config"
import { useFaceSwap } from "@/hooks/use-faceswap"
import { useProfile } from "@/lib/profile-context"
import { X, ShoppingCart, Heart, Sparkles, MapPin, CalendarDays, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetClose,
} from "@/components/ui/sheet"

interface MoodboardDetailSheetProps {
  notification: Notification | null
  isOpen: boolean
  onClose: () => void
}

const ELIGIBLE_TYPES = new Set(["product", "trending", "deal"])

export function MoodboardDetailSheet({
  notification,
  isOpen,
  onClose,
}: MoodboardDetailSheetProps) {
  const { profile } = useProfile()
  const [saved, setSaved] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  // Reset states when notification changes
  const notificationId = notification?.id
  const [lastId, setLastId] = useState<string | undefined>(undefined)
  if (notificationId !== lastId) {
    setLastId(notificationId)
    setSaved(false)
    setShowOriginal(false)
  }

  // Face-swap hook for the detail sheet (same as moodboard cards)
  const faceSwapEligible =
    !!notification &&
    ELIGIBLE_TYPES.has(notification?.type ?? "") &&
    !!profile?.photoUrl
  const { faceSwapImageUrl, isGenerating, generate } = useFaceSwap({
    productId: notification?.id ?? "",
    productImageUrl: notification?.image ?? "",
    enabled: faceSwapEligible,
  })

  // Trigger face-swap generation when detail sheet opens
  useEffect(() => {
    if (faceSwapEligible && !faceSwapImageUrl && isOpen) {
      generate()
    }
  }, [faceSwapEligible, faceSwapImageUrl, isOpen, generate])

  const details = notification?.details
  const isOutfit = notification?.type === "outfit" && details?.outfitItems
  const priceDisplay =
    details?.salePrice ?? details?.currentPrice ?? details?.totalPrice
  const typeConfig = notification ? getTypeConfig(notification.type) : { label: "" }

  // Determine which image to show in hero
  const heroImage =
    faceSwapImageUrl && !showOriginal ? faceSwapImageUrl : notification?.image

  // Conditional aspect ratio: wider for try-on images
  const detailAspect = faceSwapImageUrl && !showOriginal
    ? "aspect-[4/5]"
    : "aspect-[3/4]"

  return (
    <Sheet open={isOpen && notification !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="p-0 w-full sm:max-w-md z-[81] overflow-hidden"
      >
        <div className="h-full overflow-y-auto scrollbar-hide">
          {/* Close button */}
          <SheetClose asChild>
            <button
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-neutral-500 transition-colors hover:bg-white hover:text-neutral-900 shadow-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </SheetClose>

        {/* Hero image area */}
        <div className={`relative overflow-hidden bg-neutral-100 ${detailAspect}`}>
          {isOutfit && details?.outfitItems ? (
            <div className="grid grid-cols-2 gap-0.5 h-full w-full bg-neutral-200">
              {details.outfitItems.slice(0, 4).map((item) => (
                <div key={item.name} className="overflow-hidden bg-neutral-100">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-neutral-200" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <>
              <img
                src={heroImage}
                alt={notification?.title ?? "Product"}
                className="h-full w-full object-cover transition-opacity duration-500"
              />

              {/* Original/Try-on toggle */}
              {faceSwapImageUrl && (
                <button
                  type="button"
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="absolute left-3 bottom-20 z-20 flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5 text-[11px] font-medium text-neutral-700 shadow-sm border border-white/40 transition-all hover:bg-white"
                >
                  <Eye className="h-3 w-3" />
                  {showOriginal ? "See Try-On" : "See Original"}
                </button>
              )}

              {/* Try-on badge */}
              {faceSwapImageUrl && !showOriginal && (
                <span className="absolute right-3 top-14 z-20 flex items-center gap-1 rounded-full bg-white/80 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium text-neutral-500 shadow-sm border border-white/40">
                  <Sparkles className="h-3 w-3" />
                  Try-On
                </span>
              )}
            </>
          )}

          {/* Brand logo overlay */}
          {details?.brandLogoUrl && (
            <div className="absolute left-3 top-3 z-10">
              <BrandLogo
                logoUrl={details.brandLogoUrl}
                brandName={details.brand}
                size="md"
                overlay
              />
            </div>
          )}

          {/* Gradient scrim + product info */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-5 pb-5 pt-20">
            {/* Type tag */}
            <span className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold text-white/90 uppercase tracking-wider mb-2">
              {typeConfig.label}
            </span>

            <h2 className="text-[18px] font-bold text-white leading-snug">
              {details?.productName ?? details?.collectionName ?? notification?.title}
            </h2>

            {priceDisplay && (
              <div className="mt-1 flex items-center gap-2.5">
                <span className="text-[16px] font-bold text-white">
                  {priceDisplay}
                </span>
                {details?.originalPrice && details.salePrice && (
                  <span className="text-[13px] text-white/60 line-through">
                    {details.originalPrice}
                  </span>
                )}
                {details?.discount && (
                  <span className="rounded-full bg-white/20 backdrop-blur-sm px-2 py-0.5 text-[11px] font-bold text-white">
                    {details.discount}
                  </span>
                )}
              </div>
            )}

            {details?.brand && (
              <p className="mt-1 text-[13px] text-white/70">
                {details.brand}
                {details.storeName ? ` · ${details.storeName}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="p-5 space-y-4">
          {/* Size chips — for product/deal types */}
          {details?.sizes && details.sizes.length > 0 && (
            <div>
              <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-2">
                Available Sizes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {details.sizes.map((size) => (
                  <span
                    key={size}
                    className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-[11px] font-medium text-neutral-600 transition-colors hover:border-neutral-900 hover:bg-neutral-900 hover:text-white cursor-pointer"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social proof — trending */}
          {notification?.type === "trending" && details?.socialProof && (
            <div className="flex items-center gap-2 rounded-xl bg-neutral-50 border border-neutral-100 px-3.5 py-2.5">
              <span className="text-[12px] font-medium text-neutral-600">
                📈 {details.socialProof}
              </span>
            </div>
          )}

          {/* Location — trending */}
          {notification?.type === "trending" && details?.storeName && (
            <div className="flex items-center gap-2 text-[12px] text-neutral-500">
              <MapPin className="h-3.5 w-3.5" />
              {details.storeName}
              {details.distance ? ` · ${details.distance}` : ""}
            </div>
          )}

          {/* Urgency — deals */}
          {notification?.type === "deal" && details?.urgency && (
            <div className="flex items-center gap-2 rounded-xl bg-neutral-900 px-3.5 py-2.5">
              <span className="text-[12px] font-semibold text-white">
                ⏰ {details.urgency}
              </span>
            </div>
          )}

          {/* Drop date — drops */}
          {notification?.type === "drop" && details?.dropDate && (
            <div className="flex items-center gap-2 text-[13px] font-medium text-neutral-700">
              <CalendarDays className="h-4 w-4" />
              {details.dropDate}
            </div>
          )}

          {/* Drop preview images */}
          {notification?.type === "drop" && details?.images && (
            <div className="flex gap-2">
              {details.images.map((url, i) => (
                <div
                  key={i}
                  className="h-20 flex-1 overflow-hidden rounded-xl bg-neutral-100"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Outfit items breakdown */}
          {isOutfit && details?.outfitItems && (
            <div>
              {details.occasion && (
                <span className="inline-flex rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-600 mb-3">
                  {details.occasion}
                </span>
              )}
              <div className="grid grid-cols-1 gap-2">
                {details.outfitItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 rounded-xl bg-neutral-50 border border-neutral-100 p-3"
                  >
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingCart className="h-4 w-4 text-neutral-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-neutral-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {item.brand} · {item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {details.totalPrice && (
                <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
                  <span className="text-[12px] text-neutral-500">Total</span>
                  <span className="text-[16px] font-bold text-neutral-900">
                    {details.totalPrice}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Sponsored disclosure */}
          {notification?.type === "sponsored" && (
            <p className="text-[11px] text-neutral-400">
              Sponsored · Based on your browsing profile and style preferences
            </p>
          )}

          {/* Why for you */}
          {details?.whyForYou && (
            <p className="text-[12px] text-neutral-500 leading-relaxed">
              💡 {details.whyForYou}
            </p>
          )}

          {/* Provenance — "Why this?" expandable */}
          {notification?.provenance && (
            <ProvenanceSection
              provenance={notification.provenance}
              typeColor={typeConfig.tagColor}
            />
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            {notification?.type === "outfit" ? (
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-[13px] font-semibold text-white transition-all hover:bg-neutral-800"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Buy All
              </button>
            ) : notification?.type === "drop" ? (
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-[13px] font-semibold text-white transition-all hover:bg-neutral-800"
              >
                Shop Collection
              </button>
            ) : notification?.type === "sponsored" ? (
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-[13px] font-semibold text-white transition-all hover:bg-neutral-800"
              >
                Shop Now
              </button>
            ) : (
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-[13px] font-semibold text-white transition-all hover:bg-neutral-800"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Buy Now
              </button>
            )}

            <button
              type="button"
              onClick={() => setSaved(true)}
              disabled={saved}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-[13px] font-medium transition-all",
                saved
                  ? "border-neutral-200 bg-neutral-100 text-neutral-400"
                  : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50"
              )}
            >
              <Heart
                className={cn("h-3.5 w-3.5", saved && "fill-current")}
              />
              {saved ? "Saved" : "Save"}
            </button>

            {/* Style This — for non-drop, non-sponsored types */}
            {notification?.type !== "drop" && notification?.type !== "sponsored" && (
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[13px] font-medium text-neutral-600 transition-all hover:bg-neutral-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
