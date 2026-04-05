import Database from "better-sqlite3";
import { readFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure data directory exists
const dataDir = join(__dirname, "../../data");
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, "health.db");
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma("journal_mode = WAL");

// Enable foreign keys for CASCADE deletes
db.pragma("foreign_keys = ON");

// Run migrations
function runMigrations() {
  const migrationsDir = join(__dirname, "migrations");

  // Create migrations tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    )
  `);

  // Get applied migrations
  const appliedMigrations = new Set(
    db.prepare("SELECT name FROM migrations").all().map((row: { name: string }) => row.name)
  );

  // List of migrations to run in order
  const migrations = ["001_health_data_cache.sql", "002_reminders.sql", "003_goals.sql", "004_vision_board.sql", "005_goals_enhancement.sql"];

  for (const migration of migrations) {
    if (!appliedMigrations.has(migration)) {
      const migrationPath = join(migrationsDir, migration);
      if (existsSync(migrationPath)) {
        const sql = readFileSync(migrationPath, "utf-8");
        db.exec(sql);
        db.prepare("INSERT INTO migrations (name, applied_at) VALUES (?, ?)").run(
          migration,
          new Date().toISOString()
        );
        console.log(`Applied migration: ${migration}`);
      }
    }
  }
}

// Run migrations on module load
runMigrations();

export default db;
