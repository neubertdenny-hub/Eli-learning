/**
 * Topic Card Component
 *
 * Shows a learning topic with its status (GREEN/YELLOW/RED).
 * Used in progress view and for topic selection.
 */

import React from "react"
import Link from "next/link"

type MasteryStatus = "green" | "yellow" | "red" | "new"

interface TopicCardProps {
  title: string
  emoji?: string
  status?: MasteryStatus
  successRate?: number // 0-100
  lastPracticed?: string // e.g. "Heute", "Gestern", "Vor 3 Tagen"
  onClick?: () => void
  href?: string
}

const STATUS_INFO: Record<MasteryStatus, { color: string; label: string; icon: string }> = {
  green: {
    color: "bg-green-100 border-green-400",
    label: "Sicher beherrscht!",
    icon: "✅",
  },
  yellow: {
    color: "bg-yellow-100 border-yellow-400",
    label: "Noch üben",
    icon: "⚡",
  },
  red: {
    color: "bg-red-100 border-red-400",
    label: "Schwierig",
    icon: "🆘",
  },
  new: {
    color: "bg-gray-100 border-gray-400",
    label: "Neu",
    icon: "✨",
  },
}

export function TopicCard({
  title,
  emoji = "📚",
  status = "new",
  successRate = 0,
  lastPracticed,
  onClick,
  href,
}: TopicCardProps) {
  const info = STATUS_INFO[status]

  const content = (
    <div
      className={`p-4 sm:p-6 rounded-xl border-2 transition-all ${
        info.color
      } hover:shadow-md`}
    >
      {/* Top Row: Emoji + Title */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-4xl">{emoji}</span>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-3">
        <span>{info.icon}</span>
        <span className="text-sm sm:text-base font-semibold text-gray-700">{info.label}</span>
      </div>

      {/* Success Rate (if applicable) */}
      {status !== "new" && successRate > 0 && (
        <div className="mb-3">
          <div className="flex justify-between items-center text-xs sm:text-sm mb-1">
            <span className="text-gray-600">Erfolgsquote</span>
            <span className="font-bold text-gray-700">{successRate}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-full rounded-full transition-all"
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Last Practiced */}
      {lastPracticed && (
        <div className="text-xs text-gray-600">Zuletzt: {lastPracticed}</div>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left"
    >
      {content}
    </button>
  )
}

/**
 * Topic Grid – displays multiple topics
 */

interface TopicGridProps {
  topics: Array<React.ComponentProps<typeof TopicCard>>
}

export function TopicGrid({ topics }: TopicGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map((topic, idx) => (
        <TopicCard key={idx} {...topic} />
      ))}
    </div>
  )
}
