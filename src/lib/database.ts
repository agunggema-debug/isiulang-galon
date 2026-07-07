// Database layer - SQLite for local development
import SqliteDB from "better-sqlite3";
import path from "node:path";

const DB_PATH = path.join(process.cwd(), "aquagas.db");

declare global {
  var __db: SqliteDB.Database | undefined;
}

type SqliteDatabase = SqliteDB.Database;

export function getDb(): SqliteDatabase {
  if (!globalThis.__db) {
    globalThis.__db = new SqliteDB(DB_PATH);
    globalThis.__db.pragma("journal_mode = WAL");
    globalThis.__db.pragma("foreign_keys = ON");
  }
  return globalThis.__db;
}

export function initDatabase(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'wholesale', 'retail')),
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT DEFAULT 'Package'
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      retail_price REAL NOT NULL,
      wholesale_price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      min_wholesale_qty INTEGER NOT NULL DEFAULT 1,
      unit TEXT DEFAULT 'unit',
      status TEXT DEFAULT 'Tersedia' CHECK(status IN ('Tersedia', 'Menipis', 'Kosong')),
      image TEXT DEFAULT '',
      description TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'cancelled')),
      total_amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'cod',
      payment_status TEXT DEFAULT 'unpaid',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS refill_suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      contact_person TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS refill_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      schedule_date TEXT NOT NULL,
      estimated_time TEXT DEFAULT '',
      quantity INTEGER NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'direncanakan',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS guest_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT DEFAULT '',
      user_agent TEXT DEFAULT '',
      path TEXT DEFAULT '',
      visited_at TEXT DEFAULT (datetime('now'))
    );
  `);

  seedDatabase(db);
}

function seedDatabase(db: SqliteDatabase): void {
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count > 0) return;
}

export function closeDb(): void {
  if (globalThis.__db) {
    globalThis.__db.close();
    globalThis.__db = undefined;
  }
}