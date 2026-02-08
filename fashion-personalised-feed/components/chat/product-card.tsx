interface ProductCardProps {
  name: string
  price: string
  retailer: string
}

export function ProductCard({ name, price, retailer }: ProductCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-muted/50">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-card-foreground">
          {name}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-sm font-semibold text-primary">{price}</span>
          <span className="text-xs text-muted-foreground">{retailer}</span>
        </div>
      </div>
      <button
        className="ml-3 shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        aria-label={`View ${name}`}
      >
        View
      </button>
    </div>
  )
}
