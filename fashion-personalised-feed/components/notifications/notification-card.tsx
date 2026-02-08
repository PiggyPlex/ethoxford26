"use client"

import type { Notification } from "@/data/mockData"
import { NotificationIcon } from "./notification-icon"
import { getTypeConfig } from "@/data/notification-type-config"

export function NotificationCard({
  notification,
}: {
  notification: Notification
}) {
  return (
    <div className="group cursor-pointer rounded-2xl bg-card p-6 transition-all duration-200 hover:shadow-md">
      {/* Category Badge */}
      <div
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getTypeConfig(notification.type).badgeStyle}`}
      >
        <NotificationIcon name={notification.iconName} className="h-3.5 w-3.5" />
        {getTypeConfig(notification.type).label}
      </div>

      {/* Title */}
      <h3 className="mt-4 text-lg font-bold tracking-tight text-foreground leading-snug text-balance">
        {notification.title}
      </h3>

      {/* Summary */}
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
        {notification.summary}
      </p>

      {/* Timestamp */}
      <p className="mt-3 text-sm text-muted-foreground">
        {notification.timestamp}
      </p>
    </div>
  )
}
