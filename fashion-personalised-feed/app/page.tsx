"use client"

import { useState, useCallback, useEffect } from "react"
import { DesktopBackground } from "@/components/notifications/desktop-background"
import { CollapsedPill } from "@/components/notifications/collapsed-pill"
import { FullScreenBriefing } from "@/components/notifications/full-screen-briefing"
import { Dashboard } from "@/components/dashboard/dashboard"
import { ChatBubbleIcon } from "@/components/chat/chat-bubble-icon"
import { ChatPanel } from "@/components/chat/chat-panel"
import { ProfileProvider, useProfile } from "@/lib/profile-context"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth/auth-modal"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"

export default function Page() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <AppShell />
      </ProfileProvider>
    </AuthProvider>
  )
}

// ── Main app shell (must be inside ProfileProvider to use useProfile) ────────

type ViewState = "desktop" | "briefing" | "dashboard"

interface BubblePosition {
  x: number
  y: number
}

function AppShell() {
  const { profile, isLoaded } = useProfile()
  const { user, isLoading: authLoading } = useAuth()
  const [view, setView] = useState<ViewState>("desktop")
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatUnread, setChatUnread] = useState(true)

  // Feature flag: Set to true to require authentication, false to make it optional
  const REQUIRE_AUTH = false

  // Bubble position — default bottom-right, initialized after mount
  const [bubblePos, setBubblePos] = useState<BubblePosition>({
    x: 0,
    y: 0,
  })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setBubblePos({
      x: window.innerWidth - 48 - 16,
      y: window.innerHeight - 48 - 16,
    })
    setMounted(true)
  }, [])

  // Determine if onboarding should show (after localStorage is read)
  useEffect(() => {
    if (isLoaded) {
      setShowOnboarding(!profile?.onboardingComplete)
    }
  }, [isLoaded, profile?.onboardingComplete])

  // View transitions
  const openBriefing = useCallback(() => setView("briefing"), [])
  const openDashboard = useCallback(() => setView("dashboard"), [])
  const backToDesktop = useCallback(() => setView("desktop"), [])

  // Chat toggle — independent of view state
  const toggleChat = useCallback(() => {
    setChatOpen((prev) => {
      if (!prev) setChatUnread(false)
      return !prev
    })
  }, [])

  // Keyboard shortcut: Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (chatOpen) {
          setChatOpen(false)
        } else if (view === "briefing") {
          setView("desktop")
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [view, chatOpen])

  const handleOnboardingComplete = useCallback(() => {
    setShowOnboarding(false)
  }, [])

  // Don't render anything until localStorage has been read (prevents flash)
  if (!isLoaded || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 text-white font-bold text-xl mb-4">
            F
          </div>
          <p className="text-sm text-neutral-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth modal if authentication is required and user is not logged in
  if (REQUIRE_AUTH && !user) {
    return <AuthModal />
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      {/* Layer 0: Desktop background — always rendered */}
      <DesktopBackground dimmed={false} />

      {/* Onboarding overlay — shown when no profile or onboarding incomplete */}
      {showOnboarding && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}

      {/* Layer 1: Desktop clock */}
      {!showOnboarding && (
        <div
          className={`absolute inset-0 z-10 transition-opacity duration-300 ${
            view === "desktop" ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="absolute bottom-8 left-8 select-none">
            <DesktopClock />
          </div>
        </div>
      )}

      {/* Layer 2: Expandable notification stack — visible on desktop */}
      {!showOnboarding && view === "desktop" && (
        <CollapsedPill onClick={openBriefing} />
      )}

      {/* Layer 3: Full-screen briefing */}
      {!showOnboarding && (
        <FullScreenBriefing
          isOpen={view === "briefing"}
          onClose={backToDesktop}
          onDashboard={openDashboard}
        />
      )}

      {/* Layer 4: Dashboard */}
      {!showOnboarding && (
        <div
          className={`absolute inset-0 z-30 overflow-y-auto transition-all duration-500 ease-out ${
            view === "dashboard"
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          <Dashboard onBack={backToDesktop} />
        </div>
      )}

      {/* Layer 5: Chat — independent overlay, always available (not during onboarding) */}
      {!showOnboarding && mounted && !chatOpen && (
        <ChatBubbleIcon
          onClick={toggleChat}
          hasUnread={chatUnread}
          position={bubblePos}
          onPositionChange={setBubblePos}
        />
      )}
      {!showOnboarding && (
        <ChatPanel
          isOpen={chatOpen}
          onClose={toggleChat}
          bubblePosition={bubblePos}
        />
      )}
    </main>
  )
}

// ── Desktop clock ────────────────────────────────────────────────────────────

function DesktopClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const hours = time.getHours()
  const minutes = time.getMinutes().toString().padStart(2, "0")
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12

  return (
    <div className="text-foreground/70">
      <p className="text-5xl font-light tabular-nums tracking-tight">
        {displayHours}:{minutes} <span className="text-2xl">{period}</span>
      </p>
      <p className="mt-1 text-sm font-medium text-foreground/50">
        {time.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  )
}
