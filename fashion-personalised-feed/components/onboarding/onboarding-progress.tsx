interface OnboardingProgressProps {
  current: number
  total: number
}

export function OnboardingProgress({ current, total }: OnboardingProgressProps) {
  const pct = ((current + 1) / total) * 100

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[2px] bg-neutral-200">
      <div
        className="h-full bg-neutral-900 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
