"use client"

import { useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { SIZE_OPTIONS } from "@/data/onboarding-data"

interface SizesBudgetStepProps {
  initialSizes?: Record<string, string>
  initialPriceRange?: [number, number]
  onContinue: (sizes: Record<string, string>, priceRange: [number, number]) => void
  onBack: () => void
}

export function SizesBudgetStep({
  initialSizes,
  initialPriceRange,
  onContinue,
  onBack,
}: SizesBudgetStepProps) {
  const [sizes, setSizes] = useState<Record<string, string>>(
    initialSizes ?? { Tops: "", Bottoms: "", Shoes: "" }
  )
  const [priceRange, setPriceRange] = useState<[number, number]>(
    initialPriceRange ?? [50, 200]
  )

  const updateSize = (category: string, value: string) => {
    setSizes((prev) => ({ ...prev, [category]: value }))
  }

  const hasSizes = Object.values(sizes).some((v) => v !== "")

  return (
    <div className="flex min-h-screen flex-col px-6 py-12">
      <div className="mx-auto w-full max-w-lg">
        {/* Back button */}
        <button
          onClick={onBack}
          type="button"
          className="mb-8 flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Sizes section */}
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">
          Your fit
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          So we only show things in your size.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {Object.entries(SIZE_OPTIONS).map(([category, options]) => (
            <div key={category}>
              <label className="mb-1.5 block text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                {category}
              </label>
              <select
                value={sizes[category] ?? ""}
                onChange={(e) => updateSize(category, e.target.value)}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm font-medium text-neutral-900 focus:border-neutral-400 focus:outline-none transition-colors appearance-none cursor-pointer"
              >
                <option value="">Select</option>
                {options.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Budget section */}
        <h2 className="mt-10 text-2xl font-bold tracking-tight text-neutral-900">
          Budget sweet spot
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          We&apos;ll focus on items in this range.
        </p>

        <div className="mt-6">
          {/* Range display */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-neutral-900">
              £{priceRange[0]} — £{priceRange[1]}
            </span>
          </div>

          {/* Min slider */}
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Minimum
              </label>
              <input
                type="range"
                min={0}
                max={500}
                step={10}
                value={priceRange[0]}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setPriceRange(([, max]) => [Math.min(val, max - 10), max])
                }}
                className="w-full accent-neutral-900"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                Maximum
              </label>
              <input
                type="range"
                min={0}
                max={500}
                step={10}
                value={priceRange[1]}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  setPriceRange(([min]) => [min, Math.max(val, min + 10)])
                }}
                className="w-full accent-neutral-900"
              />
            </div>
          </div>

          <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
            <span>£0</span>
            <span>£500+</span>
          </div>
        </div>

        {/* Continue */}
        <button
          type="button"
          onClick={() => hasSizes && onContinue(sizes, priceRange)}
          disabled={!hasSizes}
          className="mt-10 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
