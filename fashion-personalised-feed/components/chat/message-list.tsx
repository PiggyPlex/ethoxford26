"use client"

import { useEffect, useRef } from "react"
import ReactMarkdown from "react-markdown"
import { TypingIndicator } from "./typing-indicator"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

interface MessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages or loading state change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      role="log"
      aria-label="Chat messages"
    >
      {messages.map((msg) => {
        if (msg.role === "user") {
          return (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-primary px-4 py-2.5">
                <p className="text-sm leading-relaxed text-primary-foreground">
                  {msg.content}
                </p>
              </div>
            </div>
          )
        }

        return (
          <div key={msg.id} className="flex gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              F
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-secondary px-4 py-2.5">
              <div className="chat-markdown text-sm leading-relaxed text-secondary-foreground">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        )
      })}

      {/* Typing indicator while waiting for response */}
      {isLoading && (
        <div className="flex gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            F
          </div>
          <div className="rounded-2xl rounded-tl-md bg-secondary px-4 py-2.5">
            <TypingIndicator />
          </div>
        </div>
      )}
    </div>
  )
}
