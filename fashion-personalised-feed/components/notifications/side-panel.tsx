"use client"

import { notifications } from "@/data/mockData"
import { NotificationCard } from "./notification-card"
import { X, ArrowRight, SlidersHorizontal, Search, Sparkles } from "lucide-react"

interface SidePanelProps {
  isOpen: boolean
  onClose: () => void
  onViewFullSummary: () => void
}

export function SidePanel({ isOpen, onClose, onViewFullSummary }: SidePanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-foreground/5 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose()
        }}
        role="button"
        tabIndex={-1}
        aria-label="Close panel"
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-[420px] flex-col bg-accent/60 backdrop-blur-xl transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-label="Notifications panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <button
            onClick={onClose}
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close notifications"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Journal</h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Filter"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">
            {notifications.map((n, i) => (
              <div
                key={n.id}
                className="animate-in slide-in-from-right fade-in"
                style={{
                  animationDelay: `${i * 60}ms`,
                  animationFillMode: "both",
                  animationDuration: "300ms",
                }}
              >
                <NotificationCard notification={n} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={onViewFullSummary}
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            View Full Summary
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  )
}
