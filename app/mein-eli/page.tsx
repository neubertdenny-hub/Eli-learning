"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Navigation } from "@/components/layout/Navigation"
import { EliCustomizer } from "@/components/eli/EliCustomizer"

export default function MeinEliPage() {
  const [userRewards, setUserRewards] = useState({ xp: 0, coins: 0, level: 1 })
  const [equipped, setEquipped] = useState({
    headColor: "eli-blue",
    accessory: null as string | null,
    background: null as string | null,
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const userId = "test-user"
      try {
        // Load user rewards
        const rewardRes = await fetch(`/api/reward/user?userId=${userId}`)
        const rewardData = await rewardRes.json()
        if (rewardData.success) {
          setUserRewards({
            xp: rewardData.totalXp,
            coins: rewardData.totalCoins,
            level: rewardData.currentLevel,
          })
        }

        // Load equipped cosmetics
        const cosmRes = await fetch(`/api/shop/unlocked?userId=${userId}&level=${rewardData.currentLevel}`)
        const cosmData = await cosmRes.json()
        if (cosmData.equipped) {
          setEquipped({
            headColor: cosmData.equipped.headColor || "eli-blue",
            accessory: cosmData.equipped.accessory,
            background: cosmData.equipped.background,
          })
        }
      } catch (error) {
        console.error("Failed to load data:", error)
      }
    }
    loadData()
  }, [])

  const handleEquip = async (category: string, itemSlug: string) => {
    const userId = "test-user"
    setIsSaving(true)

    try {
      // Find the item ID from slug
      const itemId = await findItemIdBySlug(itemSlug || null, category)
      if (!itemId && itemSlug) {
        console.error("Item not found")
        return
      }

      if (itemSlug) {
        // Equip the item
        const response = await fetch("/api/shop/equip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            itemId,
            category,
          }),
        })

        if (response.ok) {
          // Update local state
          if (category === "color") {
            setEquipped({ ...equipped, headColor: itemSlug })
          } else if (category === "accessory") {
            setEquipped({ ...equipped, accessory: itemSlug })
          } else if (category === "background") {
            setEquipped({ ...equipped, background: itemSlug })
          }
        }
      } else {
        // Unequip (set to null/default)
        if (category === "accessory") {
          setEquipped({ ...equipped, accessory: null })
        } else if (category === "background") {
          setEquipped({ ...equipped, background: null })
        }
      }
    } catch (error) {
      console.error("Failed to equip item:", error)
    }

    setIsSaving(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-purple-50 pb-24 sm:pb-32">
      <Header
        userName="Zoey"
        currentLevel={userRewards.level}
        currentXP={userRewards.xp}
        maxXP={1000}
        coins={userRewards.coins}
      />

      <main className="flex-1 container-full py-6 sm:py-8 space-y-8">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">🎨 Mein Eli</h1>
            <p className="text-gray-600">Mache Eli ganz persönlich!</p>
          </div>

          {/* Customizer */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 space-y-6 border-2 border-purple-200 shadow-lg">
            <EliCustomizer
              headColor={equipped.headColor}
              accessory={equipped.accessory}
              background={equipped.background}
              onEquip={handleEquip}
            />

            {/* Info Box */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
              <p className="text-sm font-bold text-blue-900">💡 Tipp:</p>
              <p className="text-sm text-blue-800 mt-1">
                Neue Farben, Zubehör und Hintergründe schaltest du frei, wenn du neue Levels erreichst!
                Aktuell: Level {userRewards.level}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Link
                href="/progress"
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all text-center"
              >
                ← Zurück
              </Link>
              <button
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                {isSaving ? "💾 Speichern..." : "✨ Fertig!"}
              </button>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-white rounded-2xl p-6 border-2 border-amber-200 space-y-3">
            <p className="font-bold text-gray-900">🚀 Nächste Unlock:</p>
            <div className="space-y-2">
              {userRewards.level < 2 && (
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Lila Farbe</span> - Level 2 ({userRewards.xp}/100 XP)
                </p>
              )}
              {userRewards.level < 3 && (
                <p className="text-sm text-gray-600">
                  <span className="font-bold">🧢 Cap</span> - Level 3
                </p>
              )}
              {userRewards.level < 5 && (
                <p className="text-sm text-gray-600">
                  <span className="font-bold">🚀 Weltraum Hintergrund</span> - Level 5
                </p>
              )}
              {userRewards.level >= 5 && (
                <p className="text-sm text-green-600 font-bold">✅ Alle verfügbaren Items freigeschaltet!</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <Navigation />
    </div>
  )
}

async function findItemIdBySlug(slug: string | null, category: string): Promise<string | null> {
  if (!slug) return null

  const items: Record<string, string> = {
    "eli-blue": "color-blue",
    "eli-purple": "color-purple",
    "eli-green": "color-green",
    "eli-pink": "color-pink",
    "cap": "accessory-cap",
    "glasses": "accessory-glasses",
    "headphones": "accessory-headphones",
    "antenna": "accessory-antenna",
    "space": "bg-space",
    "ocean": "bg-ocean",
    "forest": "bg-forest",
  }

  return items[slug] || null
}
