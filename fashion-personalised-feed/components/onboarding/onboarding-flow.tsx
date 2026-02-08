"use client"

import { useState, useCallback } from "react"
import { OnboardingProgress } from "./onboarding-progress"
import { WelcomeNameStep } from "./welcome-name-step"
import { PhotoCaptureStep } from "./photo-capture-step"
import { StyleBrandsStep } from "./style-brands-step"
import { SizesBudgetStep } from "./sizes-budget-step"
import { SocialPreviewStep } from "./social-preview-step"
import { useProfile } from "@/lib/profile-context"
import { DEFAULT_PROFILE } from "@/lib/profile-storage"
import { STYLE_ARCHETYPES } from "@/data/onboarding-data"
import type { UserProfile, BrandEntry, ColourEntry, SocialConnection } from "@/lib/profile-types"

const TOTAL_STEPS = 5

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { setProfile } = useProfile()
  const [step, setStep] = useState(0)

  // Accumulated data across steps
  const [name, setName] = useState("")
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined)
  const [styleTags, setStyleTags] = useState<string[]>([])
  const [brands, setBrands] = useState<BrandEntry[]>([])
  const [sizes, setSizes] = useState<Record<string, string>>({})
  const [priceRange, setPriceRange] = useState<[number, number]>([50, 200])
  const [importedColours, setImportedColours] = useState<ColourEntry[]>([])
  const [socialConnections, setSocialConnections] = useState<SocialConnection[]>([])

  // ── Step handlers ────────────────────────────────────────────────────────

  const handleSkip = useCallback(() => {
    setProfile({ ...DEFAULT_PROFILE, onboardingComplete: true })
    onComplete()
  }, [setProfile, onComplete])

  // Step 0: Name
  const handleNameStep = useCallback((n: string) => {
    setName(n)
    setStep(1)
  }, [])

  // Step 1: Photo
  const handlePhotoStep = useCallback((photo: string | undefined) => {
    setPhotoUrl(photo)
    setStep(2)
  }, [])

  // Step 2: Style & Brands
  const handleStyleStep = useCallback(
    (selectedStyleIds: string[], selectedBrands: BrandEntry[]) => {
      const labels = selectedStyleIds
        .map((id) => STYLE_ARCHETYPES.find((a) => a.id === id)?.label)
        .filter(Boolean) as string[]
      setStyleTags(labels)
      setBrands(selectedBrands)
      setStep(3)
    },
    []
  )

  // Step 3: Sizes & Budget
  const handleSizesStep = useCallback(
    (s: Record<string, string>, pr: [number, number]) => {
      setSizes(s)
      setPriceRange(pr)
      setStep(4)
    },
    []
  )

  // Social import (from step 4)
  const handleSocialImport = useCallback(
    (data: {
      brands: BrandEntry[]
      colours: ColourEntry[]
      tags: string[]
      connection: { platform: "instagram" | "pinterest" | "tiktok"; handle: string }
    }) => {
      setBrands((prev) => {
        const existing = new Set(prev.map((b) => b.name))
        const newBrands = data.brands.filter((b) => !existing.has(b.name))
        return [...prev, ...newBrands]
      })
      setStyleTags((prev) => {
        const existing = new Set(prev)
        const newTags = data.tags.filter((t) => !existing.has(t))
        return [...prev, ...newTags]
      })
      setImportedColours((prev) => {
        const existing = new Set(prev.map((c) => c.hex))
        const newColours = data.colours.filter((c) => !existing.has(c.hex))
        return [...prev, ...newColours]
      })
      setSocialConnections((prev) => [
        ...prev,
        {
          platform: data.connection.platform,
          handle: data.connection.handle,
          connectedAt: new Date().toISOString(),
        },
      ])
    },
    []
  )

  // Step 4: Complete
  const handleComplete = useCallback(() => {
    const mergedColours = importedColours.length > 0
      ? importedColours
      : DEFAULT_PROFILE.preferredColours
    const profile: UserProfile = {
      name,
      onboardingComplete: true,
      photoUrl,
      favouriteBrands: brands,
      preferredColours: mergedColours,
      sizes,
      priceRange: { min: priceRange[0], max: priceRange[1], currency: "£" },
      styleTags,
      recentPurchases: [],
      socialConnections,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setProfile(profile)
    onComplete()
  }, [name, photoUrl, brands, sizes, priceRange, styleTags, importedColours, socialConnections, setProfile, onComplete])

  // ── Build partial profile for preview ────────────────────────────────────

  const previewProfile: Partial<UserProfile> = {
    name,
    photoUrl,
    styleTags,
    favouriteBrands: brands,
    preferredColours: importedColours.length > 0 ? importedColours : undefined,
    sizes,
    priceRange: { min: priceRange[0], max: priceRange[1], currency: "£" },
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto"
      style={{
        background:
          "linear-gradient(180deg, #FAFAFA 0%, #F5F5F5 40%, #FAFAFA 100%)",
      }}
    >
      <OnboardingProgress current={step} total={TOTAL_STEPS} />

      <div
        className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
      >
        {step === 0 && (
          <WelcomeNameStep onContinue={handleNameStep} onSkip={handleSkip} />
        )}
        {step === 1 && (
          <PhotoCaptureStep
            onContinue={handlePhotoStep}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <StyleBrandsStep
            initialStyles={[]}
            initialBrands={brands}
            onContinue={handleStyleStep}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <SizesBudgetStep
            initialSizes={sizes}
            initialPriceRange={priceRange}
            onContinue={handleSizesStep}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <SocialPreviewStep
            profile={previewProfile}
            onComplete={handleComplete}
            onBack={() => setStep(3)}
            onImportData={handleSocialImport}
          />
        )}
      </div>
    </div>
  )
}
