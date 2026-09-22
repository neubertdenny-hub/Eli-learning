/**
 * Database Migration System
 *
 * Applies schema to PostgreSQL/Neon.
 * Run once during deployment.
 */

import { Pool } from "pg"
import fs from "fs"
import path from "path"

class DatabaseMigrator {
  private pool: Pool

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString })
  }

  async migrate(): Promise<void> {
    try {
      console.log("🔄 Starting database migration...")

      // Read schema file
      const schemaPath = path.join(process.cwd(), "lib/db/schema.sql")
      const schema = fs.readFileSync(schemaPath, "utf-8")

      // Execute schema
      await this.pool.query(schema)

      console.log("✅ Schema applied successfully")

      // Verify all tables exist
      const tables = await this.verifyTables()
      console.log(`✅ Verified ${tables.length} tables`)

      // Create Zoey user
      await this.seedZoeyUser()
      console.log("✅ Zoey user created/verified")

      // Seed mathematical foundations
      await this.seedFoundations()
      console.log("✅ Mathematical foundations seeded")

      // Verify indexes
      const indexes = await this.verifyIndexes()
      console.log(`✅ Verified ${indexes.length} indexes`)

      // Verify views
      const views = await this.verifyViews()
      console.log(`✅ Verified ${views.length} views`)

      console.log("\n✅ Migration complete!")
    } catch (error) {
      console.error("❌ Migration failed:", error)
      throw error
    } finally {
      await this.pool.end()
    }
  }

  private async verifyTables(): Promise<string[]> {
    const result = await this.pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    return result.rows.map((r) => r.table_name)
  }

  private async verifyIndexes(): Promise<string[]> {
    const result = await this.pool.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY indexname
    `)
    return result.rows.map((r) => r.indexname)
  }

  private async verifyViews(): Promise<string[]> {
    const result = await this.pool.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    return result.rows.map((r) => r.table_name)
  }

  private async seedZoeyUser(): Promise<void> {
    // Use stable UUID for Zoey
    const ZOEY_ID = "00000000-0000-0000-0000-000000000001"

    // Check if Zoey already exists
    const existing = await this.pool.query(
      "SELECT id FROM users WHERE id = $1",
      [ZOEY_ID]
    )

    if (existing.rows.length === 0) {
      // Create Zoey
      await this.pool.query(
        "INSERT INTO users (id, name, age) VALUES ($1, $2, $3)",
        [ZOEY_ID, "Zoey", 12]
      )
      console.log(`  Created Zoey (ID: ${ZOEY_ID})`)
    } else {
      console.log(`  Zoey already exists`)
    }
  }

  private async seedFoundations(): Promise<void> {
    // Check if foundations already exist
    const existing = await this.pool.query(
      "SELECT COUNT(*) as count FROM foundations"
    )

    if (existing.rows[0].count > 0) {
      console.log(`  Foundations already seeded`)
      return
    }

    const foundations = [
      {
        key: "basic_arithmetic",
        german_name: "Grundrechenarten",
        category: "basic_arithmetic",
        difficulty_level: 1,
        order_index: 1,
      },
      {
        key: "times_tables",
        german_name: "Kleines Einmaleins",
        category: "basic_arithmetic",
        difficulty_level: 1,
        order_index: 2,
      },
      {
        key: "division_inverse",
        german_name: "Division & Umkehraufgaben",
        category: "basic_arithmetic",
        difficulty_level: 2,
        order_index: 3,
      },
      {
        key: "negative_numbers",
        german_name: "Positive & negative Zahlen",
        category: "numbers",
        difficulty_level: 2,
        order_index: 4,
      },
      {
        key: "decimal_numbers",
        german_name: "Dezimalzahlen",
        category: "numbers",
        difficulty_level: 2,
        order_index: 5,
      },
      {
        key: "fractions",
        german_name: "Bruchrechnung",
        category: "fractions",
        difficulty_level: 3,
        order_index: 6,
      },
      {
        key: "percentages",
        german_name: "Prozentrechnung",
        category: "numbers",
        difficulty_level: 3,
        order_index: 7,
      },
      {
        key: "terms_variables",
        german_name: "Terme und Variablen",
        category: "equations",
        difficulty_level: 3,
        order_index: 8,
      },
      {
        key: "simple_equations",
        german_name: "Einfache Gleichungen",
        category: "equations",
        difficulty_level: 3,
        order_index: 9,
      },
      {
        key: "units_quantities",
        german_name: "Größen und Einheiten",
        category: "measurement",
        difficulty_level: 2,
        order_index: 10,
      },
      {
        key: "geometry_basics",
        german_name: "Geometrische Grundlagen",
        category: "geometry",
        difficulty_level: 2,
        order_index: 11,
      },
      {
        key: "order_of_operations",
        german_name: "Rechenreihenfolge & Klammern",
        category: "basic_arithmetic",
        difficulty_level: 1,
        order_index: 12,
      },
    ]

    for (const foundation of foundations) {
      await this.pool.query(
        `INSERT INTO foundations (key, german_name, description, category, difficulty_level, order_index)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (key) DO NOTHING`,
        [
          foundation.key,
          foundation.german_name,
          foundation.german_name,
          foundation.category,
          foundation.difficulty_level,
          foundation.order_index,
        ]
      )
    }

    console.log(`  Seeded ${foundations.length} foundations`)

    // Add dependencies
    const dependencies = [
      ["fractions", "basic_arithmetic"],
      ["fractions", "division_inverse"],
      ["percentages", "fractions"],
      ["percentages", "decimal_numbers"],
      ["simple_equations", "basic_arithmetic"],
      ["simple_equations", "terms_variables"],
      ["terms_variables", "basic_arithmetic"],
      ["decimal_numbers", "basic_arithmetic"],
      ["negative_numbers", "basic_arithmetic"],
    ]

    for (const [foundationKey, prerequisiteKey] of dependencies) {
      await this.pool.query(
        `WITH f AS (SELECT id FROM foundations WHERE key = $1),
                p AS (SELECT id FROM foundations WHERE key = $2)
         INSERT INTO foundation_dependencies (foundation_id, prerequisite_id)
         SELECT f.id, p.id FROM f, p
         WHERE f.id IS NOT NULL AND p.id IS NOT NULL
         ON CONFLICT DO NOTHING`,
        [foundationKey, prerequisiteKey]
      )
    }

    console.log(`  Seeded foundation dependencies`)
  }
}

export async function runMigration(): Promise<void> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL not set. Cannot run migration.\nSet it in .env or as environment variable."
    )
  }

  const migrator = new DatabaseMigrator(connectionString)
  await migrator.migrate()
}

// Auto-run migration
runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
