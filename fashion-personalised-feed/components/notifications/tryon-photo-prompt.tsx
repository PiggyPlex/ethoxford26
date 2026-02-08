"use client"

import { useState } from "react"
import { Camera, X } from "lucide-react"
import { PhotoUpload } from "@/components/shared/photo-upload"
import { useProfile } from "@/lib/profile-context"
import { cn } from "@/lib/utils"

interface TryOnPhotoPromptProps {
  isVisible: boolean
  index: number
}

export function TryOnPhotoPrompt({ isVisible, index }: TryOnPhotoPromptProps) {
  const { profile, updateProfile } = useProfile()
  const [dismissed, setDismissed] = useState(false)
  const [showUpload, setShowUpload] = useState(false)

  // Don't show if: already has photo, or dismissed, or hasn't completed onboarding
  if (profile?.photoUrl || dismissed || !profile?.onboardingComplete) {
    return null
  }

  return (
    <div
      className={cn(
        "break-inside-avoid mb-4 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-3 scale-[0.97]",
      )}
      style={{
        transitionDelay: isVisible ? `${index * 50 + 100}ms` : "0ms",
      }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        {/* Dismiss button */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white transition-colors"
        >
          <X className="h-3 w-3" />
        </button>

        {showUpload ? (
          // Upload mode
          <div className="flex flex-col items-center gap-4 py-2">
            <PhotoUpload
              onPhotoChange={(dataUrl) => {
                updateProfile({ photoUrl: dataUrl })
                setShowUpload(false)
              }}
              size="lg"
            />
            <button
              type="button"
              onClick={() => setShowUpload(false)}
              className="text-[11px] text-white/40 hover:text-white/60 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          // Prompt mode
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Camera className="h-6 w-6 text-white/80" />
            </div>
            <h3 className="text-[14px] font-semibold text-white">
              See yourself in these
            </h3>
            <p className="mt-1 text-[12px] text-white/50 leading-relaxed">
              Add your photo for personalized
              <br />
              virtual try-on
            </p>
            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className="mt-4 rounded-full bg-white px-5 py-2 text-[12px] font-semibold text-neutral-900 transition-all hover:bg-white/90 hover:shadow-lg"
            >
              Add Photo
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="mt-2 text-[11px] text-white/30 hover:text-white/50 transition-colors"
            >
              Maybe later
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
