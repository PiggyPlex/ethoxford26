"use client"

import { List, Columns3, ArrowLeft, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useProfile } from "@/lib/profile-context"

type LayoutMode = "feed" | "kanban" | "profile"

interface TopBarProps {
  layout: LayoutMode
  onSetLayout: (layout: LayoutMode) => void
  onBack?: () => void
}

function isProfileIncomplete(profile: ReturnType<typeof useProfile>["profile"]): boolean {
  if (!profile) return true
  return (
    profile.favouriteBrands.length === 0 ||
    profile.styleTags.length === 0 ||
    Object.keys(profile.sizes).length === 0 ||
    profile.socialConnections.length === 0
  )
}

export function TopBar({ layout, onSetLayout, onBack }: TopBarProps) {
  const { profile } = useProfile()
  const showProfileDot = isProfileIncomplete(profile)
  return (
    <header className="flex items-center justify-between px-8 py-5">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Back to desktop"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="text-primary-foreground"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <circle cx="9" cy="10" r="1.5" fill="currentColor" />
            <circle cx="15" cy="10" r="1.5" fill="currentColor" />
            <path
              d="M8.5 14.5C9.33 15.83 10.6 16.5 12 16.5C13.4 16.5 14.67 15.83 15.5 14.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="text-lg font-semibold text-foreground tracking-tight">
          FriendOS
        </span>
      </div>

      {/* Feed / Kanban / Profile segmented control */}
      <div className="flex rounded-lg border border-border bg-white/60 p-0.5">
        <button
          type="button"
          onClick={() => onSetLayout("feed")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            layout === "feed"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <List className="h-3.5 w-3.5" />
          Feed
        </button>
        <button
          type="button"
          onClick={() => onSetLayout("kanban")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            layout === "kanban"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Columns3 className="h-3.5 w-3.5" />
          Kanban
        </button>
        <button
          type="button"
          onClick={() => onSetLayout("profile")}
          className={cn(
            "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
            layout === "profile"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User className="h-3.5 w-3.5" />
          Profile
          {showProfileDot && layout !== "profile" && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-neutral-900 animate-pulse-dot" />
          )}
        </button>
      </div>
    </header>
  )
}
