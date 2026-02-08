"use client"

import { useState } from "react"
import { useProfile } from "@/lib/profile-context"
import { Check, X } from "lucide-react"

interface ProfileUpdatePromptProps {
  /** e.g. "You seem to be into techwear lately" */
  suggestion: string
  /** The style tag or brand to add */
  value: string
  /** Where to add it: styleTags or brands */
  field: "styleTags" | "brands"
  onDismiss: () => void
}

export function ProfileUpdatePrompt({
  suggestion,
  value,
  field,
  onDismiss,
}: ProfileUpdatePromptProps) {
  const { profile, updateProfile } = useProfile()
  const [applied, setApplied] = useState(false)

  if (!profile || applied) return null

  const handleAccept = () => {
    if (field === "styleTags") {
      const existing = profile.styleTags ?? []
      if (!existing.includes(value)) {
        updateProfile({ styleTags: [...existing, value] })
      }
    } else if (field === "brands") {
      const existing = profile.favouriteBrands ?? []
      if (!existing.find((b) => b.name === value)) {
        updateProfile({
          favouriteBrands: [
            ...existing,
            { name: value, logoUrl: `https://img.logo.dev/${value.toLowerCase().replace(/\s+/g, "")}.com?token=pk_VAMPsVSMSC-VYyGOEOYXqw` },
          ],
        })
      }
    }
    setApplied(true)
    setTimeout(onDismiss, 1500)
  }

  return (
    <div className="mx-4 mb-2 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 animate-fade-in">
      <div className="min-w-0 flex-1">
        <p className="text-[12px] text-neutral-600">{suggestion}</p>
        <p className="text-[11px] text-neutral-400 mt-0.5">
          Add &ldquo;{value}&rdquo; to your profile?
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleAccept}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white transition-colors hover:bg-neutral-700"
          aria-label="Accept suggestion"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDismiss}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition-colors hover:text-neutral-600 hover:bg-neutral-100"
          aria-label="Dismiss suggestion"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
