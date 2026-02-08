"use client"

import React, { useState, useCallback } from "react"

import { Progress } from "@/components/ui/progress"
import { ProductCard } from "@/components/dashboard/cards/product-card"
import { TrendingCard } from "@/components/dashboard/cards/trending-card"
import { DealCard } from "@/components/dashboard/cards/deal-card"
import { DropCard } from "@/components/dashboard/cards/drop-card"
import { OutfitCard } from "@/components/dashboard/cards/outfit-card"
import { SponsoredCard } from "@/components/dashboard/cards/sponsored-card"
import { cn } from "@/lib/utils"
import { Heart, ShoppingCart } from "lucide-react"

type ColumnId = "saved" | "cart"

const CARD_MAP: Record<string, (compact: boolean) => React.ReactNode> = {
  product: (c) => <ProductCard compact={c} />,
  trending: (c) => <TrendingCard compact={c} />,
  deal: (c) => <DealCard compact={c} />,
  drop: (c) => <DropCard compact={c} />,
  outfit: (c) => <OutfitCard compact={c} />,
  sponsored: (c) => <SponsoredCard compact={c} />,
}

const INITIAL_COLUMNS: Record<ColumnId, { id: string; label: string }[]> = {
  "saved": [
    { id: "product", label: "Product" },
    { id: "trending", label: "Trending" },
    { id: "drop", label: "Drop" },
  ],
  "cart": [
    { id: "deal", label: "Deal" },
  ],
}

const COLUMN_META: { id: ColumnId; title: string; icon: typeof Heart; color: string }[] = [
  { id: "saved", title: "Saved Items", icon: Heart, color: "text-primary" },
  { id: "cart", title: "Cart", icon: ShoppingCart, color: "text-green-600" },
]

interface DraggableCardProps {
  itemId: string
  columnId: ColumnId
  onDragStart: (itemId: string, fromColumn: ColumnId) => void
  onDragEnd: () => void
  isDragging: boolean
  children: React.ReactNode
}

function DraggableCard({
  itemId,
  columnId,
  onDragStart,
  onDragEnd,
  isDragging,
  children,
}: DraggableCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move"
        e.dataTransfer.setData("text/plain", itemId)
        requestAnimationFrame(() => onDragStart(itemId, columnId))
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab rounded-2xl transition-all duration-200 active:cursor-grabbing",
        isDragging && "opacity-40 scale-95 rotate-1",
      )}
    >
      {children}
    </div>
  )
}

interface KanbanColumnProps {
  columnId: ColumnId
  title: string
  count: number
  icon: typeof Heart
  color: string
  isOver: boolean
  onDragOver: (e: React.DragEvent, columnId: ColumnId) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, columnId: ColumnId) => void
  children: React.ReactNode
}

function KanbanColumn({
  columnId,
  title,
  count,
  icon: Icon,
  color,
  isOver,
  onDragOver,
  onDragLeave,
  onDrop,
  children,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <Icon className={cn("h-4 w-4", color)} />
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-[11px] font-medium text-muted-foreground">
          {count}
        </span>
      </div>
      <div
        onDragOver={(e) => onDragOver(e, columnId)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, columnId)}
        className={cn(
          "flex flex-col gap-3 rounded-2xl p-3 min-h-[200px] transition-all duration-200 border-2 border-dashed",
          isOver
            ? "border-primary/50 bg-accent/60 shadow-inner"
            : "border-transparent bg-secondary/40",
        )}
      >
        {children}
        {count === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xs text-muted-foreground/60">
              Drop cards here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function KanbanView() {
  const [columns, setColumns] = useState<
    Record<ColumnId, { id: string; label: string }[]>
  >(INITIAL_COLUMNS)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [draggingFrom, setDraggingFrom] = useState<ColumnId | null>(null)
  const [overColumn, setOverColumn] = useState<ColumnId | null>(null)

  const total =
    columns.saved.length + columns.cart.length
  const cartPercent = total > 0 ? Math.round((columns.cart.length / total) * 100) : 0

  const handleDragStart = useCallback(
    (itemId: string, fromColumn: ColumnId) => {
      setDraggingId(itemId)
      setDraggingFrom(fromColumn)
    },
    [],
  )

  const handleDragEnd = useCallback(() => {
    setDraggingId(null)
    setDraggingFrom(null)
    setOverColumn(null)
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent, columnId: ColumnId) => {
      e.preventDefault()
      e.dataTransfer.dropEffect = "move"
      setOverColumn(columnId)
    },
    [],
  )

  const handleDragLeave = useCallback(() => {
    setOverColumn(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, toColumn: ColumnId) => {
      e.preventDefault()
      const itemId = e.dataTransfer.getData("text/plain")
      if (!itemId || !draggingFrom || draggingFrom === toColumn) {
        setOverColumn(null)
        return
      }

      setColumns((prev) => {
        const fromItems = [...prev[draggingFrom]]
        const itemIndex = fromItems.findIndex((item) => item.id === itemId)
        if (itemIndex === -1) return prev

        const [movedItem] = fromItems.splice(itemIndex, 1)
        const toItems = [...prev[toColumn], movedItem]

        return {
          ...prev,
          [draggingFrom]: fromItems,
          [toColumn]: toItems,
        }
      })

      setDraggingId(null)
      setDraggingFrom(null)
      setOverColumn(null)
    },
    [draggingFrom],
  )

  return (
    <div className="flex flex-col gap-5 px-8 animate-fade-in">
      <p className="text-sm text-muted-foreground">
        Drag items between columns to organise your shopping journey.
      </p>
      {/* Overall progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Ready to purchase
          </span>
          <span className="text-xs font-semibold text-foreground">
            {cartPercent}%
          </span>
        </div>
        <Progress value={cartPercent} className={cn("h-2 rounded-full")} />
      </div>
      {/* Kanban columns */}
      <div className="grid grid-cols-2 gap-4">
        {COLUMN_META.map((col) => (
          <KanbanColumn
            key={col.id}
            columnId={col.id}
            title={col.title}
            icon={col.icon}
            color={col.color}
            count={columns[col.id].length}
            isOver={overColumn === col.id && draggingFrom !== col.id}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {columns[col.id].map((item) => (
              <DraggableCard
                key={item.id}
                itemId={item.id}
                columnId={col.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isDragging={draggingId === item.id}
              >
                {CARD_MAP[item.id]?.(true)}
              </DraggableCard>
            ))}
          </KanbanColumn>
        ))}
      </div>
    </div>
  )
}
