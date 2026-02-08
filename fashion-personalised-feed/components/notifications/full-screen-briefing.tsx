"use client"

import { useState } from "react"
import { notifications } from "@/data/mockData"
import type { Notification } from "@/data/mockData"
import { MoodboardCard } from "./moodboard-card"
import { MoodboardDetailSheet } from "./moodboard-detail-sheet"
import { TryOnPhotoPrompt } from "./tryon-photo-prompt"
import { useProfile } from "@/lib/profile-context"
import { ArrowRight, X } from "lucide-react"

interface FullScreenBriefingProps {
  isOpen: boolean
  onClose: () => void
  onDashboard: () => void
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

export function FullScreenBriefing({
  isOpen,
  onClose,
  onDashboard,
}: FullScreenBriefingProps) {
  const { profile } = useProfile()
  const userName = profile?.name ?? "there"
  const [selected, setSelected] = useState<Notification | null>(null)

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col overflow-y-auto transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-[0.98] opacity-0"
      }`}
      style={{
        background:
          "linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 40%, #FAFAFA 100%)",
      }}
      role="dialog"
      aria-label="Daily briefing"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        type="button"
        className="fixed right-6 top-6 z-[70] flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-neutral-500 shadow-sm backdrop-blur-sm border border-neutral-200/40 transition-all hover:bg-white hover:text-neutral-900 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-neutral-400"
        aria-label="Close briefing"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header — centered */}
        <header
          className={`mb-10 text-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
          style={{ transitionDelay: isOpen ? "50ms" : "0ms" }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-400">
            Your Daily Style Brief
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
            {getGreeting()}, {userName}
          </h1>
          <p className="mt-1.5 text-[14px] text-neutral-500">
            {notifications.length} items curated for you today
          </p>
        </header>

        {/* Masonry grid */}
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4">
          {notifications.filter(n => n.type !== "outfit").map((n, i) => {
            // Insert TryOnPhotoPrompt at position 2 for users without a photo
            const showPrompt =
              i === 2 &&
              profile?.onboardingComplete &&
              !profile?.photoUrl

            return (
              <div key={n.id}>
                {showPrompt && <TryOnPhotoPrompt index={i} isVisible={isOpen} />}
                <MoodboardCard
                  notification={n}
                  index={showPrompt ? i + 1 : i}
                  isVisible={isOpen}
                  onClick={() => setSelected(n)}
                />
              </div>
            )
          })}
        </div>

        {/* Floating CTA */}
        <div
          className={`sticky bottom-6 mt-10 flex justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-3"
          }`}
          style={{ transitionDelay: isOpen ? "600ms" : "0ms" }}
        >
          <button
            onClick={onDashboard}
            type="button"
            className="flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-[13px] font-semibold text-white shadow-lg transition-all hover:bg-neutral-800 hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
          >
            Browse All Items
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Detail sheet */}
      <MoodboardDetailSheet
        notification={selected}
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
