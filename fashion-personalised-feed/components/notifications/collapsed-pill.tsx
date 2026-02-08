"use client"

import { useState, useCallback } from "react"
import { notifications } from "@/data/mockData"
import { NotificationIcon } from "./notification-icon"
import { getTypeConfig } from "@/data/notification-type-config"
import { ArrowRight, X } from "lucide-react"

/* Card height (px) + gap between cards when expanded */
const CARD_H = 62
const GAP = 8

interface CollapsedPillProps {
  onClick: () => void
}

/**
 * Sonner-style notification stack — single DOM, morphing transition.
 *
 * All cards are always rendered. When collapsed, cards 1–N are stacked
 * behind card 0 using absolute positioning + scale/translateY transforms.
 * When expanded, every card moves to its natural vertical position.
 * Because the same DOM elements animate between states, it feels like
 * one continuous interaction.
 */
export function CollapsedPill({ onClick }: CollapsedPillProps) {
  const [expanded, setExpanded] = useState(false)
  const total = notifications.length

  const toggle = useCallback(() => setExpanded((p) => !p), [])
  const collapse = useCallback(() => setExpanded(false), [])

  const handleViewSummary = useCallback(() => {
    setExpanded(false)
    onClick()
  }, [onClick])

  /* Total height of the expanded list (cards + gaps) */
  const expandedListH = total * CARD_H + (total - 1) * GAP

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-foreground/5 backdrop-blur-sm transition-opacity duration-400 ${
          expanded ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={collapse}
        role="button"
        tabIndex={-1}
        aria-label="Close notifications"
      />

      {/* Container — fixed top-right, scrollable when expanded */}
      <div
        className={`fixed top-6 right-6 z-50 flex flex-col ${expanded ? "bottom-6 overflow-hidden" : ""}`}
        style={{ width: 372 }}
      >
        {/* Count badge */}
        {total > 1 && (
          <span
            className={`absolute -left-2 z-[60] flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-900 px-1.5 text-[10px] font-bold text-white shadow ring-2 ring-white transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              expanded ? "opacity-0 scale-75 -top-2" : "opacity-100 scale-100 -top-2"
            }`}
          >
            {total}
          </span>
        )}

        {/* Header — visible when expanded */}
        <div
          className={`flex items-center justify-between px-1 mb-2 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            expanded
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none absolute top-0 left-0 right-0"
          }`}
        >
          <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
            {total} notifications
          </span>
          <button
            onClick={collapse}
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground border border-border/50"
            aria-label="Collapse notifications"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* ── Scrollable card container that morphs ── */}
        <div
          className={`transition-[height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${expanded ? "flex-1 min-h-0 overflow-y-auto scrollbar-hide" : ""}`}
          style={{
            height: expanded
              ? undefined
              : CARD_H + (Math.min(total, 3) - 1) * 8,
          }}
        >
          <div
            className="relative"
            style={{ height: expanded ? expandedListH : undefined }}
          >
          {notifications.map((n, i) => {
            /* When collapsed: only show first 3, stacked */
            const visibleInStack = i < 3
            const stackIndex = i // 0 = front, 1 = behind, 2 = furthest

            /* Collapsed position: stacked behind using scale + translateY */
            const collapsedScale = 1 - stackIndex * 0.03
            const collapsedY = stackIndex * 8
            const collapsedOpacity = visibleInStack
              ? 1 - stackIndex * 0.12
              : 0

            /* Expanded position: natural vertical flow */
            const expandedY = i * (CARD_H + GAP)

            return (
              <div
                key={n.id}
                className="absolute top-0 left-0 right-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{
                  height: CARD_H,
                  zIndex: expanded ? total - i : (visibleInStack ? 3 - stackIndex : 0),
                  transform: expanded
                    ? `translateY(${expandedY}px) scale(1)`
                    : `translateY(${collapsedY}px) scale(${collapsedScale})`,
                  opacity: expanded ? 1 : collapsedOpacity,
                  transitionDelay: expanded ? `${i * 30}ms` : `${(total - 1 - i) * 20}ms`,
                }}
              >
                <button
                  type="button"
                  onClick={expanded ? undefined : toggle}
                  className={`flex h-full w-full items-center gap-3 rounded-2xl border border-border/50 bg-card px-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.04)] transition-shadow duration-200 ${
                    expanded
                      ? "cursor-pointer hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)]"
                      : "cursor-pointer"
                  } ${!expanded && i === 0 ? "hover:shadow-[0_2px_6px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.06)]" : ""}`}
                  aria-label={expanded ? n.title : `${total} notifications. Click to expand.`}
                >
                  {/* Icon */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-opacity duration-300 ${getTypeConfig(n.type).iconBg} ${
                      !expanded && i > 0 ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <NotificationIcon
                      name={n.iconName}
                      className="h-[18px] w-[18px]"
                    />
                  </div>

                  {/* Text content */}
                  <div
                    className={`min-w-0 flex-1 transition-opacity duration-300 ${
                      !expanded && i > 0 ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <p className="text-[13px] font-semibold leading-tight text-foreground truncate text-left">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground truncate text-left">
                      {n.summary}
                    </p>
                  </div>

                  {/* Tag + time */}
                  <div
                    className={`flex shrink-0 flex-col items-end gap-1 transition-opacity duration-300 ${
                      !expanded && i > 0 ? "opacity-0" : "opacity-100"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider ${getTypeConfig(n.type).tagColor}`}
                    >
                      {getTypeConfig(n.type).label}
                    </span>
                    <span className="text-[10px] text-muted-foreground/70">
                      {n.timestamp}
                    </span>
                  </div>
                </button>
              </div>
            )
          })}
          </div>
        </div>

        {/* Footer CTA */}
        <div
          className={`mt-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            expanded
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
          style={{
            transitionDelay: expanded ? `${total * 30 + 60}ms` : "0ms",
          }}
        >
          <button
            onClick={handleViewSummary}
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            View Full Summary
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </>
  )
}
