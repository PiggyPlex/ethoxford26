"use client"

import { useState, useEffect } from "react"
import { ChatBubbleIcon } from "./chat-bubble-icon"
import { ChatPanel } from "./chat-panel"

/**
 * Standalone chat wrapper (unused — page.tsx manages chat directly).
 * Kept for potential future use as an embeddable component.
 */
export function FriendOSChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(true)
  const [bubblePos, setBubblePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setBubblePos({
      x: window.innerWidth - 48 - 16,
      y: window.innerHeight - 48 - 16,
    })
  }, [])

  const handleOpen = () => {
    setIsOpen(true)
    setHasUnread(false)
  }

  return (
    <>
      {!isOpen && (
        <ChatBubbleIcon
          onClick={handleOpen}
          hasUnread={hasUnread}
          position={bubblePos}
          onPositionChange={setBubblePos}
        />
      )}
      <ChatPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        bubblePosition={bubblePos}
      />
    </>
  )
}
