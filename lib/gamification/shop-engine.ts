/**
 * Shop Engine für Phase 6D
 *
 * Verwaltet kosmetische Items und Unlocks
 * WICHTIG: KEINE Lernvorteile zu kaufen!
 */

import { getDatabase } from "@/lib/db/connection"
import { cosmeticItems, userCosmetics, userEquippedCosmetics } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export interface CosmeticItem {
  id: string
  slug: string
  name: string
  category: "color" | "accessory" | "background" | "outfit" | "shoes" | "design"
  unlocksAt: number // Level requirement
}

export const COSMETIC_ITEMS: CosmeticItem[] = [
  // Colors
  {
    id: "color-blue",
    slug: "eli-blue",
    name: "Eli Blau",
    category: "color",
    unlocksAt: 1,
  },
  {
    id: "color-purple",
    slug: "eli-purple",
    name: "Eli Lila",
    category: "color",
    unlocksAt: 2,
  },
  {
    id: "color-green",
    slug: "eli-green",
    name: "Eli Grün",
    category: "color",
    unlocksAt: 5,
  },
  {
    id: "color-pink",
    slug: "eli-pink",
    name: "Eli Pink",
    category: "color",
    unlocksAt: 8,
  },

  // Accessories
  {
    id: "accessory-cap",
    slug: "cap",
    name: "🧢 Cap",
    category: "accessory",
    unlocksAt: 3,
  },
  {
    id: "accessory-glasses",
    slug: "glasses",
    name: "🕶️ Brille",
    category: "accessory",
    unlocksAt: 4,
  },
  {
    id: "accessory-chain",
    slug: "chain",
    name: "⛓️ Goldkette",
    category: "accessory",
    unlocksAt: 6,
  },
  {
    id: "accessory-headphones",
    slug: "headphones",
    name: "🎧 Kopfhörer",
    category: "accessory",
    unlocksAt: 7,
  },
  {
    id: "accessory-antenna",
    slug: "antenna",
    name: "📡 Antenne",
    category: "accessory",
    unlocksAt: 9,
  },

  // Outfits/Clothes
  {
    id: "outfit-shirt-red",
    slug: "shirt-red",
    name: "👕 Rotes Shirt",
    category: "outfit",
    unlocksAt: 2,
  },
  {
    id: "outfit-shirt-blue",
    slug: "shirt-blue",
    name: "👕 Blaues Shirt",
    category: "outfit",
    unlocksAt: 3,
  },
  {
    id: "outfit-shirt-purple",
    slug: "shirt-purple",
    name: "👕 Violettes Shirt",
    category: "outfit",
    unlocksAt: 5,
  },
  {
    id: "outfit-hoodie-black",
    slug: "hoodie-black",
    name: "🖤 Schwarzer Hoodie",
    category: "outfit",
    unlocksAt: 4,
  },
  {
    id: "outfit-hoodie-gray",
    slug: "hoodie-gray",
    name: "🩶 Grauer Hoodie",
    category: "outfit",
    unlocksAt: 6,
  },
  {
    id: "outfit-jacket-leather",
    slug: "jacket-leather",
    name: "🧥 Lederjacke",
    category: "outfit",
    unlocksAt: 8,
  },

  // Shoes
  {
    id: "shoes-black",
    slug: "shoes-black",
    name: "👟 Schwarze Schuhe",
    category: "shoes",
    unlocksAt: 2,
  },
  {
    id: "shoes-red",
    slug: "shoes-red",
    name: "👟 Rote Schuhe",
    category: "shoes",
    unlocksAt: 4,
  },
  {
    id: "shoes-sneaker",
    slug: "shoes-sneaker",
    name: "👟 Weiße Sneaker",
    category: "shoes",
    unlocksAt: 5,
  },
  {
    id: "shoes-boots",
    slug: "shoes-boots",
    name: "👢 Boots",
    category: "shoes",
    unlocksAt: 7,
  },

  // Backgrounds
  {
    id: "bg-space",
    slug: "space",
    name: "🚀 Weltraum",
    category: "background",
    unlocksAt: 5,
  },
  {
    id: "bg-ocean",
    slug: "ocean",
    name: "🌊 Ozean",
    category: "background",
    unlocksAt: 6,
  },
  {
    id: "bg-forest",
    slug: "forest",
    name: "🌲 Wald",
    category: "background",
    unlocksAt: 8,
  },
]

/**
 * Initialisiere Shop Items in der DB
 */
export async function initializeShopItems() {
  try {
    const db = getDatabase()

    for (const item of COSMETIC_ITEMS) {
      const existing = await db
        .select()
        .from(cosmeticItems)
        .where(eq(cosmeticItems.slug, item.slug))
        .limit(1)

      if (!existing || existing.length === 0) {
        await db.insert(cosmeticItems).values({
          id: item.id,
          slug: item.slug,
          name: item.name,
          category: item.category,
          unlocksAt: item.unlocksAt,
        } as any)
        console.log(`[Shop] Initialized: ${item.slug}`)
      }
    }
  } catch (error) {
    console.error("[Shop Init Error]", error)
  }
}

/**
 * Prüfe welche Items User freischalten kann
 */
export async function getUnlockedItems(
  userId: string,
  userLevel: number
): Promise<CosmeticItem[]> {
  try {
    const db = getDatabase()

    // Bekomme bereits freigeschaltete Items
    const userItems = await db
      .select()
      .from(userCosmetics)
      .where(eq(userCosmetics.userId, userId))

    const unlockedSlugs = new Set(userItems.map((ui) => ui.cosmeticId))

    // Filtere Items die:
    // 1. Level-Requirement erfüllen
    // 2. Noch nicht freigeschaltet
    const availableItems = COSMETIC_ITEMS.filter(
      (item) => item.unlocksAt <= userLevel && !unlockedSlugs.has(item.id)
    )

    return availableItems
  } catch (error) {
    console.error("[Get Unlocked Items Error]", error)
    return []
  }
}

/**
 * Holе alle Cosmetics für einen User
 */
export async function getUserCosmetics(userId: string) {
  try {
    const db = getDatabase()

    const equipped = await db
      .select()
      .from(userEquippedCosmetics)
      .where(eq(userEquippedCosmetics.userId, userId))
      .limit(1)

    if (!equipped || equipped.length === 0) {
      return {
        headColor: "blue",
        accessory: null,
        background: null,
      }
    }

    return {
      headColor: equipped[0].headColor || "blue",
      accessory: equipped[0].accessory,
      background: equipped[0].background,
    }
  } catch (error) {
    console.error("[Get User Cosmetics Error]", error)
    return {
      headColor: "blue",
      accessory: null,
      background: null,
    }
  }
}

/**
 * Unlock Item für User
 */
export async function unlockItem(userId: string, itemId: string) {
  try {
    const db = getDatabase()

    // Prüfe ob schon freigeschaltet
    const existing = await db
      .select()
      .from(userCosmetics)
      .where(eq(userCosmetics.userId, userId))
      .limit(1)

    if (existing && existing.length > 0) {
      return { alreadyUnlocked: true }
    }

    // Unlock
    await db.insert(userCosmetics).values({
      userId,
      cosmeticId: itemId,
      unlockedAt: new Date().toISOString(),
    } as any)

    console.log(`[Shop] ${userId} unlocked ${itemId}`)
    return { success: true }
  } catch (error) {
    console.error("[Unlock Item Error]", error)
    return { error: true }
  }
}

/**
 * Equip Item für User
 */
export async function equipItem(userId: string, itemId: string, category: string) {
  try {
    const db = getDatabase()

    const item = COSMETIC_ITEMS.find((i) => i.id === itemId)
    if (!item) {
      return { error: "Item not found" }
    }

    // Hole equipped
    let equipped = await db
      .select()
      .from(userEquippedCosmetics)
      .where(eq(userEquippedCosmetics.userId, userId))
      .limit(1)

    if (!equipped || equipped.length === 0) {
      // Create
      await db.insert(userEquippedCosmetics).values({
        userId,
        headColor: category === "color" ? item.slug : "blue",
        accessory: category === "accessory" ? item.slug : null,
        background: category === "background" ? item.slug : null,
      } as any)
    } else {
      // Update
      const updateData: any = {}
      if (category === "color") updateData.headColor = item.slug
      if (category === "accessory") updateData.accessory = item.slug
      if (category === "background") updateData.background = item.slug

      await db
        .update(userEquippedCosmetics)
        .set(updateData)
        .where(eq(userEquippedCosmetics.userId, userId))
    }

    return { success: true }
  } catch (error) {
    console.error("[Equip Item Error]", error)
    return { error: true }
  }
}
