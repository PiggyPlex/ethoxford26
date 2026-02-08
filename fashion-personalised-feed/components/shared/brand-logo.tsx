"use client"

import { cn } from "@/lib/utils"

interface BrandLogoProps {
  logoUrl?: string
  brandName?: string
  size?: "sm" | "md" | "lg"
  /** When true, adds frosted-glass background for use over images */
  overlay?: boolean
  className?: string
}

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
} as const

const textSizeMap = {
  sm: "text-[10px]",
  md: "text-[12px]",
  lg: "text-[14px]",
} as const

export function BrandLogo({
  logoUrl,
  brandName,
  size = "md",
  overlay = false,
  className,
}: BrandLogoProps) {
  const baseClasses = cn(
    sizeMap[size],
    "shrink-0 overflow-hidden rounded-full flex items-center justify-center",
    overlay
      ? "bg-white/90 backdrop-blur-sm shadow-sm border border-white/60"
      : "bg-white border border-neutral-100",
    className,
  )

  if (logoUrl) {
    return (
      <div className={baseClasses}>
        <img
          src={logoUrl}
          alt={brandName ?? ""}
          className="h-[65%] w-[65%] object-contain"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = "none"
            // Show fallback letter if image fails
            const parent = (e.target as HTMLImageElement).parentElement
            if (parent && brandName) {
              const fallback = document.createElement("span")
              fallback.className = `${textSizeMap[size]} font-bold text-neutral-400`
              fallback.textContent = brandName.charAt(0).toUpperCase()
              parent.appendChild(fallback)
            }
          }}
        />
      </div>
    )
  }

  // Fallback: first letter of brand name
  if (brandName) {
    return (
      <div className={baseClasses}>
        <span className={cn(textSizeMap[size], "font-bold text-neutral-400")}>
          {brandName.charAt(0).toUpperCase()}
        </span>
      </div>
    )
  }

  return null
}
