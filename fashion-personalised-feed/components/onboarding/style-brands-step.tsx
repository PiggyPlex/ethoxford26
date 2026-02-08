"use client"

import { useState, useMemo } from "react"
import { ArrowLeft, ArrowRight, Check, Search, X } from "lucide-react"
import { STYLE_ARCHETYPES, BRAND_DIRECTORY } from "@/data/onboarding-data"
import type { BrandEntry } from "@/lib/profile-types"

interface StyleBrandsStepProps {
  initialStyles?: string[]
  initialBrands?: BrandEntry[]
  onContinue: (styles: string[], brands: BrandEntry[]) => void
  onBack: () => void
}

export function StyleBrandsStep({
  initialStyles = [],
  initialBrands = [],
  onContinue,
  onBack,
}: StyleBrandsStepProps) {
  const [selectedStyles, setSelectedStyles] = useState<string[]>(initialStyles)
  const [selectedBrands, setSelectedBrands] = useState<BrandEntry[]>(initialBrands)
  const [brandQuery, setBrandQuery] = useState("")

  const filteredBrands = useMemo(() => {
    if (!brandQuery.trim()) return []
    const q = brandQuery.toLowerCase()
    return BRAND_DIRECTORY.filter(
      (b) =>
        b.name.toLowerCase().includes(q) &&
        !selectedBrands.some((s) => s.name === b.name)
    ).slice(0, 6)
  }, [brandQuery, selectedBrands])

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const addBrand = (brand: BrandEntry) => {
    setSelectedBrands((prev) => [...prev, brand])
    setBrandQuery("")
  }

  const removeBrand = (name: string) => {
    setSelectedBrands((prev) => prev.filter((b) => b.name !== name))
  }

  const canContinue = selectedStyles.length >= 1 && selectedBrands.length >= 1

  return (
    <div className="flex min-h-screen flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Back button */}
        <button
          onClick={onBack}
          type="button"
          className="mb-8 flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Style DNA section */}
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          Pick styles that speak to you
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Select 2–4 that match your vibe.
        </p>

        <div className="mt-6 grid grid-cols-4 gap-3">
          {STYLE_ARCHETYPES.map((arch) => {
            const selected = selectedStyles.includes(arch.id)
            return (
              <button
                key={arch.id}
                type="button"
                onClick={() => toggleStyle(arch.id)}
                className={`group relative overflow-hidden rounded-xl transition-all duration-200 ${
                  selected
                    ? "ring-2 ring-neutral-900 ring-offset-2"
                    : "ring-1 ring-neutral-200 hover:ring-neutral-300"
                }`}
              >
                <div className="aspect-[3/4] bg-neutral-100">
                  <img
                    src={arch.imageUrl}
                    alt={arch.label}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* Overlay label */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-6">
                  <span className="text-[11px] font-semibold text-white">
                    {arch.label}
                  </span>
                </div>
                {/* Check badge */}
                {selected && (
                  <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Brand picker section */}
        <h2 className="mt-10 text-2xl font-bold tracking-tight text-neutral-900">
          Brands you love
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Pick at least 1 to get started.
        </p>

        {/* Search input */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={brandQuery}
            onChange={(e) => setBrandQuery(e.target.value)}
            placeholder="Search brands..."
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none transition-colors"
          />
          {/* Dropdown results */}
          {filteredBrands.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
              {filteredBrands.map((brand) => (
                <button
                  key={brand.name}
                  type="button"
                  onClick={() => addBrand(brand)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  <img
                    src={brand.logoUrl}
                    alt=""
                    className="h-5 w-5 object-contain"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                  {brand.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected brands */}
        {selectedBrands.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedBrands.map((brand) => (
              <span
                key={brand.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-[12px] font-medium text-neutral-700 shadow-sm"
              >
                <img
                  src={brand.logoUrl}
                  alt=""
                  className="h-3.5 w-auto"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = "none"
                  }}
                />
                {brand.name}
                <button
                  type="button"
                  onClick={() => removeBrand(brand.name)}
                  className="ml-0.5 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Continue */}
        <button
          type="button"
          onClick={() => canContinue && onContinue(selectedStyles, selectedBrands)}
          disabled={!canContinue}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
