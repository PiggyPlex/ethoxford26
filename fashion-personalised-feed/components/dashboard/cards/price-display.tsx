import { cn } from "@/lib/utils"

interface PriceDisplayProps {
  /** The current or sale price (displayed prominently) */
  currentPrice: string
  /** The original price before discount (strikethrough) */
  originalPrice?: string
  /** Discount label, e.g. "-40%" */
  discount?: string
  className?: string
}

export function PriceDisplay({
  currentPrice,
  originalPrice,
  discount,
  className,
}: PriceDisplayProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm font-medium text-neutral-900">
        {currentPrice}
      </span>
      {originalPrice && (
        <span className="text-[12px] text-neutral-400 line-through">
          {originalPrice}
        </span>
      )}
      {discount && (
        <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white">
          {discount}
        </span>
      )}
    </div>
  )
}
