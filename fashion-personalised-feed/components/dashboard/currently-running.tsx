"use client"

import { runningAgents } from "@/data/mockData"

export function CurrentlyRunning() {
  return (
    <section className="mx-8 rounded-2xl bg-secondary/60 p-5">
      <h4 className="mb-3 text-sm font-semibold text-foreground">Currently running</h4>
      <div className="flex flex-col gap-3">
        {runningAgents.map((task) => (
          <div key={task.id} className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-primary" />
            </span>
            <span className="flex-1 text-sm text-muted-foreground">{task.text}</span>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              {task.progress}%
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
