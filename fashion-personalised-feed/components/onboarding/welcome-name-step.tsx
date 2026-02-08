"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

interface WelcomeNameStepProps {
  onContinue: (name: string) => void
  onSkip: () => void
}

export function WelcomeNameStep({ onContinue, onSkip }: WelcomeNameStepProps) {
  const [name, setName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) onContinue(name.trim())
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            className="text-white"
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

        {/* Tagline */}
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          FriendOS
        </h1>
        <p className="mt-2 text-base text-neutral-500">
          Your personal stylist, always on.
        </p>

        {/* Name input */}
        <form onSubmit={handleSubmit} className="mt-12">
          <label className="block text-sm font-medium text-neutral-500 mb-3">
            What should we call you?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoFocus
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-center text-lg font-medium text-neutral-900 placeholder:text-neutral-300 focus:border-neutral-400 focus:outline-none focus:ring-0 transition-colors"
          />

          <button
            type="submit"
            disabled={!name.trim()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Skip */}
        <button
          onClick={onSkip}
          type="button"
          className="mt-6 text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          Skip, I&apos;ll set up later
        </button>
      </div>
    </div>
  )
}
