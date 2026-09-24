"use client"

import React, { useEffect, useState } from "react"
import type { CosmeticItem } from "@/lib/gamification/shop-engine"

interface ShopModalProps {
  show: boolean
  userId: string
  userLevel: number
  onClose: () => void
  onEquip: (itemId: string) => void
}

interface ShopData {
  unlockedItems: CosmeticItem[]
  equipped: {
    headColor: string
    accessory: string | null
    background: string | null
  }
}

export function ShopModal({
  show,
  userId,
  userLevel,
  onClose,
  onEquip,
}: ShopModalProps) {
  const [shopData, setShopData] = useState<ShopData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState<"color" | "accessory" | "background">(
    "color"
  )

  useEffect(() => {
    if (show) {
      loadShopData()
    }
  }, [show, userId, userLevel])

  const loadShopData = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/shop/unlocked?userId=${userId}&level=${userLevel}`
      )
      const data = await response.json()
      setShopData(data)
    } catch (error) {
      console.error("Failed to load shop data:", error)
    }
    setLoading(false)
  }

  const handleEquip = async (itemId: string) => {
    try {
      const response = await fetch("/api/shop/equip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          itemId,
          category: selectedTab,
        }),
      })

      if (response.ok) {
        await loadShopData()
        onEquip(itemId)
      }
    } catch (error) {
      console.error("Failed to equip item:", error)
    }
  }

  if (!show || !shopData) return null

  const itemsByCategory = shopData.unlockedItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, CosmeticItem[]>
  )

  const filteredItems = itemsByCategory[selectedTab] || []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">🛍️ ELI SHOP</h2>
              <p className="text-purple-100 mt-1">
                Level {userLevel}: {filteredItems.length} Items verfügbar
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 sticky top-20 bg-white z-40">
          <div className="flex gap-2 p-4">
            {(["color", "accessory", "background"] as const).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedTab(category)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  selectedTab === category
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category === "color" && "🎨 Farben"}
                {category === "accessory" && "👒 Zubehör"}
                {category === "background" && "🌅 Hintergründe"}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Lädt...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Keine Items in dieser Kategorie verfügbar
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Erreichst du Level {selectedTab === "color" ? 2 : selectedTab === "accessory" ? 3 : 5}?
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const isEquipped =
                  (selectedTab === "color" &&
                    shopData.equipped.headColor === item.slug) ||
                  (selectedTab === "accessory" &&
                    shopData.equipped.accessory === item.slug) ||
                  (selectedTab === "background" &&
                    shopData.equipped.background === item.slug)

                return (
                  <div
                    key={item.id}
                    className={`rounded-xl p-4 text-center transition-all transform hover:scale-105 cursor-pointer ${
                      isEquipped
                        ? "bg-gradient-to-br from-purple-400 to-pink-400 text-white ring-4 ring-purple-300"
                        : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 border-2 border-gray-200 hover:border-purple-300"
                    }`}
                    onClick={() => handleEquip(item.id)}
                  >
                    <div className="text-4xl mb-2">{item.name.split(" ")[0]}</div>
                    <p className="font-bold text-sm mb-2">{item.name}</p>
                    <p className="text-xs opacity-75 mb-3">
                      Level {item.unlocksAt}+
                    </p>
                    {isEquipped && (
                      <div className="inline-block bg-white text-purple-600 px-3 py-1 rounded-full text-xs font-bold">
                        ✓ AKTIV
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  )
}
