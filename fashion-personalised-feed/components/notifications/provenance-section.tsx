"use client"

import { useState } from "react"
import { NotificationIcon } from "./notification-icon"
import type { Provenance } from "@/data/mockData"
import { ChevronDown, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProvenanceSectionProps {
  provenance: Provenance
  /** Type accent color, e.g. "text-blue-500" from getTypeConfig().tagColor */
  typeColor?: string
}

export function ProvenanceSection({
  provenance,
  typeColor = "text-muted-foreground",
}: ProvenanceSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="mt-3">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/60 transition-colors hover:text-muted-foreground"
      >
        <Sparkles className="h-3 w-3" />
        Why this?
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Expandable content — CSS Grid 0fr→1fr for silky smooth height animation */}
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div
            className={cn(
              "mt-2 rounded-xl bg-muted/40 border border-border/30 px-4 py-3 space-y-3 transition-opacity duration-200",
              open ? "opacity-100" : "opacity-0"
            )}
          >
            {/* Data Sources */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
                Sources used
              </p>
              <div className="flex flex-wrap gap-1.5">
                {provenance.dataSources.map((src) => (
                  <span
                    key={src.name}
                    className="inline-flex items-center gap-1 rounded-full bg-white/80 border border-border/40 px-2 py-0.5 text-[11px] font-medium text-foreground/70"
                  >
                    <NotificationIcon
                      name={src.iconName}
                      className="h-2.5 w-2.5"
                    />
                    {src.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Data Points */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5">
                What we found
              </p>
              <ul className="flex flex-col gap-1">
                {provenance.dataPoints.map((dp) => (
                  <li
                    key={dp.text}
                    className="flex items-start gap-2 text-[12px] text-foreground/70 leading-relaxed"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/30" />
                    <span>
                      {dp.text}
                      <span className="ml-1 text-[10px] text-muted-foreground/50">
                        ({dp.source})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Timing Reasoning */}
            <div className="flex items-start gap-2 rounded-lg bg-white/60 px-3 py-2 border border-border/20">
              <Sparkles
                className={cn("h-3 w-3 mt-0.5 shrink-0", typeColor)}
              />
              <p className="text-[12px] text-foreground/70 leading-relaxed">
                <span className="font-semibold text-foreground/80">
                  Why now:
                </span>{" "}
                {provenance.reasoning}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
