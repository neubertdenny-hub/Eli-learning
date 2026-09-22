/**
 * Bottom Navigation
 *
 * Simple, mobile-first navigation bar.
 * 5 main sections for Zoey.
 */

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface NavigationItem {
  href: string
  icon: string
  label: string
}

const NAV_ITEMS: NavigationItem[] = [
  { href: "/", icon: "🏠", label: "Start" },
  { href: "/learn", icon: "🚀", label: "Lernen" },
  { href: "/upload", icon: "📸", label: "Upload" },
  { href: "/progress", icon: "📈", label: "Progress" },
]

export function Navigation() {
  const pathname = usePathname()

  // Don't show navigation on parent page
  if (pathname?.startsWith("/parent")) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 safe-area-inset-bottom">
      <div className="container-full">
        <div className="flex justify-around items-center h-20 sm:h-24">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                <span className="text-2xl sm:text-3xl">{item.icon}</span>
                <span className="text-xs sm:text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
