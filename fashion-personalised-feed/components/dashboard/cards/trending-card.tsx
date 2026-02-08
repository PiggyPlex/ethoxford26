"use client"

import { useState } from "react"
import { MapPin, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { CardActions } from "@/components/dashboard/card-actions"
import { BrandLogo } from "@/components/shared/brand-logo"
import { StylingPreview } from "@/components/dashboard/cards/styling-preview"
import { cn } from "@/lib/utils"

interface TrendingCardProps {
  compact?: boolean
}

export function TrendingCard({ compact = false }: TrendingCardProps) {
  const [showStyling, setShowStyling] = useState(false)

  return (
    <>
      <Card className={cn("overflow-hidden border-0 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]", compact && "shadow-none")}>
        {/* Full-bleed hero image with social proof overlay */}
        <div className={cn("relative overflow-hidden bg-neutral-100", compact ? "aspect-[4/3]" : "aspect-[3/4]")}>
          <img
            src="https://static.nike.com/a/images/t_web_pdp_535_v2/f_auto/a7e41722-a82a-42ae-90f2-1f74bc79cfd9/M+NK+DF+MILER+SS.png"
            alt="Carhartt WIP Beanie"
            className="h-full w-full object-cover"
          />
          {/* Brand logo — top-left */}
          {!compact && (
            <div className="absolute left-3 top-3">
              <BrandLogo
                logoUrl="https://img.logo.dev/carhartt-wip.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw"
                brandName="Carhartt WIP"
                size="md"
                overlay
              />
            </div>
          )}
          {/* Frosted glass social proof — bottom */}
          {!compact && (
            <div className="absolute inset-x-3 bottom-3">
              <div className="rounded-xl bg-white/80 backdrop-blur-md px-3.5 py-2.5 shadow-sm border border-white/40">
                <p className="text-[12px] font-semibold text-neutral-800">
                  12 friends bought this
                </p>
                <p className="text-[11px] text-neutral-500">
                  Trending in Shoreditch
                </p>
              </div>
            </div>
          )}
        </div>

        <CardContent className={cn("flex flex-col gap-3", compact ? "p-3 gap-2" : "p-4")}>
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wider">Carhartt WIP</p>
            <h3 className={cn("font-medium text-neutral-900 leading-snug", compact ? "text-sm" : "text-sm")}>
              Acrylic Watch Hat
            </h3>
            <span className="text-sm font-medium text-neutral-900">£19.00</span>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
              <MapPin className="h-3 w-3" />
              Carhartt WIP Shoreditch · 0.3 miles
            </div>
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
              { label: "View" },
              { label: "Save", variant: "outline" },
              { label: "Dismiss", variant: "ghost" },
            ]}
          />
        </CardContent>
      </Card>

      <StylingPreview
        isOpen={showStyling}
        onClose={() => setShowStyling(false)}
        productName="Carhartt WIP Acrylic Watch Hat"
        brand="Carhartt WIP"
      />
    </>
  )
}
