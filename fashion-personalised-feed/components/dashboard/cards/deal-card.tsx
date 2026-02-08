"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { CardActions } from "@/components/dashboard/card-actions"
import { BrandLogo } from "@/components/shared/brand-logo"
import { StylingPreview } from "@/components/dashboard/cards/styling-preview"
import { cn } from "@/lib/utils"

interface DealCardProps {
  compact?: boolean
}

export function DealCard({ compact = false }: DealCardProps) {
  const [showStyling, setShowStyling] = useState(false)

  return (
    <>
      <Card className={cn("overflow-hidden border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]", compact && "shadow-none")}>
        {/* Hero image with discount sticker */}
        <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
          <img
            src="https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/e4fb1f97-3315-45f5-9249-6d4262a1de19/M+NK+DF+FORM+HD+JKT.png"
            alt="COS Wool Overcoat"
            className="h-full w-full object-cover"
          />
          {/* Brand logo — top-left */}
          {!compact && (
            <div className="absolute left-3 top-3">
              <BrandLogo
                logoUrl="https://img.logo.dev/cos.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw"
                brandName="COS"
                size="md"
                overlay
              />
            </div>
          )}
          {/* Discount sticker badge — bottom-right */}
          <span className="absolute bottom-3 right-3 rounded-full bg-neutral-900 px-3 py-1.5 text-[12px] font-bold text-white shadow-md">
            -40%
          </span>
        </div>

        <CardContent className={cn("flex flex-col gap-3", compact ? "p-3 gap-2" : "p-4")}>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">COS</p>
            <h3 className={cn("font-medium text-neutral-900 leading-snug", compact ? "text-sm" : "text-sm")}>
              Relaxed-Fit Wool Overcoat
            </h3>
            {/* Bold price treatment */}
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-lg font-bold text-neutral-900">£105</span>
              <span className="text-[13px] text-neutral-400 line-through">£175</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              ⏱ 2h left · Only 3 left in your size
            </p>
          </div>

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
              { label: "Price History", variant: "outline" },
              { label: "Dismiss", variant: "ghost" },
            ]}
          />
        </CardContent>
      </Card>

      <StylingPreview
        isOpen={showStyling}
        onClose={() => setShowStyling(false)}
        productName="COS Relaxed-Fit Wool Overcoat"
        brand="COS"
      />
    </>
  )
}
