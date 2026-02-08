"use client"

import type { Notification } from "@/data/mockData"
import { NotificationIcon } from "./notification-icon"
import { ProvenanceSection } from "./provenance-section"
import { getTypeConfig } from "@/data/notification-type-config"
import { ShoppingCart, MapPin, CalendarDays } from "lucide-react"

export function DetailedResultCard({
  notification,
}: {
  notification: Notification
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-white/70 backdrop-blur-sm p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-all duration-200 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:bg-white/90">
      {/* Header row: icon + title/summary + tag/time */}
      <div className="flex items-start gap-3">
        {/* Brand logo or fallback icon */}
        {notification.details?.brandLogoUrl ? (
          <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-white border border-neutral-100 mt-0.5 p-1.5">
            <img
              src={notification.details.brandLogoUrl}
              alt={notification.details.brand ?? ""}
              className="h-full w-full object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = "none"
              }}
            />
          </div>
        ) : (
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5 ${getTypeConfig(notification.type).iconBg}`}
          >
            <NotificationIcon
              name={notification.iconName}
              className="h-[18px] w-[18px]"
            />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-[15px] font-semibold leading-snug text-foreground">
                {notification.title}
              </h3>
              <p className="mt-0.5 text-[13px] text-muted-foreground leading-relaxed">
                {notification.summary}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider ${getTypeConfig(notification.type).tagColor}`}
              >
                {getTypeConfig(notification.type).label}
              </span>
              <span className="text-[10px] text-muted-foreground/70">
                {notification.timestamp}
              </span>
            </div>
          </div>

          {/* Product Recommendation details */}
          {notification.type === "product" && notification.details && (
            <div className="mt-3 rounded-xl bg-neutral-50 border border-neutral-200/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm overflow-hidden">
                  {notification.image ? (
                    <img src={notification.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ShoppingCart className="h-5 w-5 text-neutral-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">
                    {notification.details.brand}
                  </p>
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {notification.details.productName}
                  </p>
                  <span className="text-[15px] font-bold text-foreground">
                    {notification.details.currentPrice}
                  </span>
                </div>
              </div>
              {notification.details.sizes && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {notification.details.sizes.map((size) => (
                    <span key={size} className="rounded-full border border-neutral-300 bg-white px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                      {size}
                    </span>
                  ))}
                </div>
              )}
              {notification.details.whyForYou && (
                <p className="mt-2 text-[12px] text-neutral-500">
                  {notification.details.whyForYou}
                </p>
              )}
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 hover:shadow-md"
              >
                <ShoppingCart className="h-3 w-3" />
                Buy Now
              </button>
            </div>
          )}

          {/* Trending Near You details */}
          {notification.type === "trending" && notification.details && (
            <div className="mt-3 rounded-xl bg-neutral-50 border border-neutral-200/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm overflow-hidden">
                  {notification.image ? (
                    <img src={notification.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <NotificationIcon name="arrow-trending-up" className="h-5 w-5 text-neutral-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">
                    {notification.details.brand}
                  </p>
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {notification.details.productName}
                  </p>
                  <span className="text-[15px] font-bold text-foreground">
                    {notification.details.currentPrice}
                  </span>
                </div>
              </div>
              {notification.details.socialProof && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-600">
                  <NotificationIcon name="arrow-trending-up" className="h-3 w-3" />
                  {notification.details.socialProof}
                </span>
              )}
              {notification.details.storeName && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {notification.details.storeName} · {notification.details.distance}
                </div>
              )}
            </div>
          )}

          {/* Deal Alert details */}
          {notification.type === "deal" && notification.details && (
            <div className="mt-3 rounded-xl bg-neutral-50 border border-neutral-200/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm overflow-hidden">
                  {notification.image ? (
                    <img src={notification.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <NotificationIcon name="tag" className="h-5 w-5 text-neutral-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">
                    {notification.details.brand}
                  </p>
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {notification.details.productName}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-[15px] font-bold text-foreground">
                      {notification.details.salePrice}
                    </span>
                    <span className="text-[12px] text-neutral-400 line-through">
                      {notification.details.originalPrice}
                    </span>
                    {notification.details.discount && (
                      <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-white">
                        {notification.details.discount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {notification.details.urgency && (
                <p className="mt-2 text-[12px] font-medium text-neutral-500">
                  {notification.details.urgency}
                </p>
              )}
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 hover:shadow-md"
              >
                <ShoppingCart className="h-3 w-3" />
                Buy Now
              </button>
            </div>
          )}

          {/* Style Drop details */}
          {notification.type === "drop" && notification.details && (
            <div className="mt-3 rounded-xl bg-neutral-50 border border-neutral-200/40 px-4 py-3">
              <p className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">
                {notification.details.brand}
              </p>
              <p className="mt-1 text-[14px] font-semibold text-foreground">
                {notification.details.collectionName}
              </p>
              {notification.details.dropDate && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-neutral-600">
                  <CalendarDays className="h-3 w-3" />
                  {notification.details.dropDate}
                </div>
              )}
              {notification.details.images && (
                <div className="mt-2 flex gap-2">
                  {notification.details.images.map((url, i) => (
                    <div
                      key={i}
                      className="h-16 flex-1 overflow-hidden rounded-lg bg-neutral-100"
                    >
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Shop Collection →
              </button>
            </div>
          )}

          {/* Outfit Suggestion details */}
          {notification.type === "outfit" && notification.details && (
            <div className="mt-3 rounded-xl bg-neutral-50 border border-neutral-200/40 px-4 py-3">
              {notification.details.occasion && (
                <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-600">
                  {notification.details.occasion}
                </span>
              )}
              {notification.details.outfitItems && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {notification.details.outfitItems.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
                      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingCart className="h-3 w-3 text-neutral-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.brand} · {item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {notification.details.totalPrice && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground">Total</span>
                  <span className="text-[15px] font-bold text-foreground">{notification.details.totalPrice}</span>
                </div>
              )}
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 hover:shadow-md"
              >
                <ShoppingCart className="h-3 w-3" />
                Buy All
              </button>
            </div>
          )}

          {/* Sponsored details */}
          {notification.type === "sponsored" && notification.details && (
            <div className="mt-3 rounded-xl bg-neutral-50 border border-neutral-200/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm overflow-hidden">
                  {notification.image ? (
                    <img src={notification.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <NotificationIcon name="megaphone" className="h-5 w-5 text-neutral-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-wide">
                    {notification.details.brand}
                  </p>
                  {notification.details.discount && (
                    <p className="text-[13px] font-medium text-foreground">
                      {notification.details.discount}
                    </p>
                  )}
                  {notification.details.currentPrice && (
                    <span className="text-[12px] text-muted-foreground">
                      {notification.details.currentPrice}
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-2 text-[11px] text-neutral-400">
                Sponsored · <button className="underline underline-offset-2 hover:text-neutral-600 transition-colors">Why am I seeing this?</button>
              </p>
            </div>
          )}

          {/* Provenance — "Why this?" expandable section */}
          {notification.provenance && (
            <ProvenanceSection
              provenance={notification.provenance}
              typeColor={getTypeConfig(notification.type).tagColor}
            />
          )}
        </div>
      </div>
    </div>
  )
}
