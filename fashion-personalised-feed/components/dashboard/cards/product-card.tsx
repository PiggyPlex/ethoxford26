"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { CardActions } from "@/components/dashboard/card-actions"
import { BrandLogo } from "@/components/shared/brand-logo"
import { StylingPreview } from "@/components/dashboard/cards/styling-preview"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  compact?: boolean
}

export function ProductCard({ compact = false }: ProductCardProps) {
  const [showStyling, setShowStyling] = useState(false)

  return (
    <>
      <Card className={cn("overflow-hidden border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]", compact && "shadow-none")}>
        {/* Full-bleed hero image with brand logo overlay */}
        <div className={cn("relative overflow-hidden bg-neutral-100", compact ? "aspect-[4/3]" : "aspect-[3/4]")}>
          <img
            src="https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/77902123-b424-4ad4-a0fd-fb177c82232d/M+NK+DF+MILER+SS.png"
            alt="Nike Air Max 90"
            className="h-full w-full object-cover"
          />
          {/* Brand logo — top-left overlay */}
          {!compact && (
            <div className="absolute left-3 top-3">
              <BrandLogo
                logoUrl="https://img.logo.dev/nike.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw"
                brandName="Nike"
                size="md"
                overlay
              />
            </div>
          )}
          {/* Gradient scrim + text overlay */}
          {!compact && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent px-4 pb-4 pt-16">
              <h3 className="text-[15px] font-semibold text-white leading-snug">
                Air Max 90 Sail/Gum
              </h3>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[14px] font-bold text-white">£129.99</span>
                <span className="text-[11px] text-white/70">END Clothing</span>
              </div>
            </div>
          )}
        </div>

        <CardContent className={cn("flex flex-col gap-3", compact ? "p-3 gap-2" : "p-4")}>
          {/* Compact mode: show title/price below image */}
          {compact && (
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Nike</p>
              <h3 className="text-sm font-medium text-neutral-900 leading-snug">
                Nike Air Max 90 Sail/Gum
              </h3>
              <span className="text-sm font-medium text-neutral-900">£129.99</span>
            </div>
          )}

          {/* Size chips */}
          <div className="flex flex-wrap gap-1.5">
            {["UK 8", "UK 9", "UK 10", "UK 11"].map((size) => (
              <span key={size} className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                size === "UK 10"
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-300 bg-white text-neutral-600"
              )}>
                {size}
              </span>
            ))}
          </div>

          <p className="text-[11px] text-neutral-500">
            Matches brands you follow on IG
          </p>

          {/* Style This button */}
          <button
            type="button"
            onClick={() => setShowStyling(true)}
            className="flex items-center gap-1.5 self-start rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[11px] font-medium text-neutral-600 transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:shadow-sm"
          >
            <Sparkles className="h-3 w-3" />
            Style This
          </button>

          <CardActions
            compact={compact}
            actions={[
              { label: "Buy Now" },
              { label: "Save", variant: "outline" },
              { label: "Not My Style", variant: "ghost" },
            ]}
          />
        </CardContent>
      </Card>

      <StylingPreview
        isOpen={showStyling}
        onClose={() => setShowStyling(false)}
        productName="Nike Air Max 90"
        brand="Nike"
      />
    </>
  )
}
