"use client"

import { useState } from "react"
import { ArrowRight } from "lucide-react"

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState("")

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue("")
  }

  return (
    <div className="border-t border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30 transition-all">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder="Ask about styles, deals, outfits..."
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
          aria-label="Type a message"
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
