"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { MessageSquare } from "lucide-react"

interface Position {
  x: number
  y: number
}

interface ChatBubbleIconProps {
  onClick: () => void
  hasUnread: boolean
  position: Position
  onPositionChange: (pos: Position) => void
}

const BUBBLE_SIZE = 48

export function ChatBubbleIcon({
  onClick,
  hasUnread,
  position,
  onPositionChange,
}: ChatBubbleIconProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    hasMoved: false,
  })

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        offsetX: e.clientX - position.x,
        offsetY: e.clientY - position.y,
        hasMoved: false,
      }
      setIsDragging(true)
    },
    [position]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return

      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY

      // Only count as drag if moved more than 5px
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragRef.current.hasMoved = true
      }

      // Clamp to viewport
      const newX = Math.max(
        0,
        Math.min(
          window.innerWidth - BUBBLE_SIZE,
          e.clientX - dragRef.current.offsetX
        )
      )
      const newY = Math.max(
        0,
        Math.min(
          window.innerHeight - BUBBLE_SIZE,
          e.clientY - dragRef.current.offsetY
        )
      )

      onPositionChange({ x: newX, y: newY })
    },
    [isDragging, onPositionChange]
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
    if (!dragRef.current.hasMoved) {
      onClick()
    }
  }, [onClick])

  return (
    <div
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y,
        width: BUBBLE_SIZE,
        height: BUBBLE_SIZE,
        touchAction: "none",
      }}
    >
      {/* Tooltip */}
      {isHovered && !isDragging && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 rounded-lg bg-foreground px-3 py-1.5 text-xs text-primary-foreground shadow-md whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 duration-200">
          Ask FriendOS
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 bg-foreground" />
        </div>
      )}

      {/* Bubble */}
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative flex h-12 w-12 items-center justify-center rounded-xl bg-foreground shadow-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          isDragging
            ? "scale-110 shadow-2xl cursor-grabbing"
            : "hover:scale-110 hover:shadow-xl cursor-grab"
        }`}
        aria-label="Open FriendOS chat"
      >
        <MessageSquare className="h-5 w-5 text-primary-foreground" />
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-primary animate-pulse" />
        )}
      </button>
    </div>
  )
}
