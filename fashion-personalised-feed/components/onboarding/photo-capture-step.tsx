"use client"

import { useState } from "react"
import { ArrowRight, ArrowLeft, Camera } from "lucide-react"
import { PhotoUpload } from "@/components/shared/photo-upload"

interface PhotoCaptureStepProps {
  onContinue: (photoUrl: string | undefined) => void
  onBack: () => void
}

export function PhotoCaptureStep({ onContinue, onBack }: PhotoCaptureStepProps) {
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100">
          <Camera className="h-7 w-7 text-neutral-500" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          Add your photo
        </h2>
        <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
          See yourself wearing the clothes we find for you.
          <br />
          <span className="text-neutral-400">
            Your photo stays on your device.
          </span>
        </p>

        {/* Photo upload */}
        <div className="mt-10 flex justify-center">
          <PhotoUpload
            currentPhotoUrl={photoUrl}
            onPhotoChange={setPhotoUrl}
            size="lg"
          />
        </div>

        {/* Status text */}
        <p className="mt-8 text-[12px] text-neutral-400">
          {photoUrl
            ? "Looking good! This will be used for virtual try-on."
            : "A clear, well-lit selfie works best."}
        </p>

        {/* Continue button */}
        <button
          type="button"
          onClick={() => onContinue(photoUrl)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800"
        >
          {photoUrl ? "Continue" : "Continue without photo"}
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Back + Skip */}
        <div className="mt-4 flex items-center justify-center gap-6">
          <button
            onClick={onBack}
            type="button"
            className="flex items-center gap-1 text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back
          </button>
          {!photoUrl && (
            <button
              onClick={() => onContinue(undefined)}
              type="button"
              className="text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
