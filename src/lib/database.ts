// Database layer - abstracts between Supabase and SQLite for migration
// During development, use SQLite. In production, Supabase is used.

// Check if Supabase is configured
const hasSupabaseConfig = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Import Supabase client
import { supabaseClient, createSupabaseServerClient } from "./supabase";

// Legacy SQLite imports (for local development only)
import SqliteDB from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";
import type { SupabaseDatabase } from "./types";

const DB_PATH = path.join(process.cwd(), "aquagas.db");

declare global {
  // eslint-disable-next-line no-var
  var __db: SqliteDB.Database | undefined;
}

type SqliteDatabase = SqliteDB.Database;

// SQLite helpers - only used in local development
export function getDb(): SqliteDatabase {
  if (!globalThis.__db) {
    globalThis.__db = new SqliteDB(DB_PATH);
    globalThis.__db.pragma("journal_mode = WAL");
    globalThis.__db.pragma("foreign_keys = ON");
  }
  return globalThis.__db;
}

export function initDatabase(): void {
  if (hasSupabaseConfig) {
    // Supabase: Tables should be created via Supabase dashboard/SQL migrations
    console.log("Using Supabase - database schema managed via Supabase dashboard");
    return;
  }

  // Local development: Initialize SQLite
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
      payment_method TEXT DEFAULT 'cod' CHECK(payment_method IN ('cod', 'transfer')),
      payment_status TEXT DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid', 'paid', 'refunded')),
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
      status TEXT DEFAULT 'direncanakan' CHECK(status IN ('direncanakan', 'dalam_perjalanan', 'selesai', 'dibatalkan')),
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (supplier_id) REFERENCES refill_suppliers(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
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

  // Seed data if empty
  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  if (userCount.count === 0) {
    seedDatabase(db);
  }

  // Seed default settings if empty
  const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
  if (settingsCount.count === 0) {
    seedSettings(db);
  }
}

function seedSettings(db: SqliteDatabase): void {
  const insertSetting = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
  const defaultSettings: [string, string][] = [
    ["store_name", "AquaGas Premium"],
    ["store_phone", "0812-3456-7890"],
    ["store_address", "Jl. Merdeka No. 123, Jakarta Selatan"],
    ["store_email", "info@aquagaspremium.com"],
    ["shipping_cost_per_km", "5000"],
    ["free_shipping_minimum", "100000"],
    ["payment_cod_enabled", "true"],
    ["payment_transfer_enabled", "true"],
  ];
  const insertMany = db.transaction(() => {
    for (const setting of defaultSettings) {
      insertSetting.run(...setting);
    }
  });
  insertMany();
}

function seedDatabase(db: SqliteDatabase): void {
  const hasher = bcrypt.hashSync;

  // Seed users
  const defaultAdminEmail = process.env.SEED_ADMIN_EMAIL || "admin@aquagas.com";
  const defaultAdminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const defaultWholesaleEmail = process.env.SEED_WHOLESALE_EMAIL || "grosir@aquagas.com";
  const defaultWholesalePassword = process.env.SEED_WHOLESALE_PASSWORD || "grosir123";
  const defaultRetailEmail = process.env.SEED_RETAIL_EMAIL || "retail@aquagas.com";
  const defaultRetailPassword = process.env.SEED_RETAIL_PASSWORD || "retail123";

  const insertUser = db.prepare(
    "INSERT INTO users (email, password, name, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const users = [
    [defaultAdminEmail, hasher(defaultAdminPassword, 10), "Admin AquaGas", "admin", "081234567890", "Jl. Merdeka No. 1, Jakarta"],
    [defaultWholesaleEmail, hasher(defaultWholesalePassword, 10), "Budi Santoso", "wholesale", "081234567891", "Jl. Makmur No. 10, Jakarta"],
    [defaultRetailEmail, hasher(defaultRetailPassword, 10), "Siti Rahayu", "retail", "081234567892", "Jl. Bahagia No. 5, Jakarta"],
  ];

  const insertMany = db.transaction(() => {
    for (const user of users) {
      insertUser.run(...(user as [string, string, string, string, string, string]));
    }
  });
  insertMany();

  // Seed categories
  const insertCategory = db.prepare("INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)");
  const categories = [
    ["Air Galon", "air-galon", "Droplets"],
    ["Gas Elpiji", "gas-elpiji", "Flame"],
    ["Air Mineral", "air-mineral", "Droplets"],
    ["Isi Ulang", "isi-ulang", "RotateCcw"],
  ];

  const insertCategories = db.transaction(() => {
    for (const cat of categories) {
      insertCategory.run(...(cat as [string, string, string]));
    }
  });
  insertCategories();

  // Seed products
  const insertProduct = db.prepare(
    "INSERT INTO products (name, category_id, retail_price, wholesale_price, stock, min_wholesale_qty, unit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );

  const products = [
    ["Galon Aqua 19L", 1, 21000, 18000, 45, 10, "unit", "Tersedia"],
    ["Galon Le Minerale 19L", 1, 20000, 17000, 30, 10, "unit", "Tersedia"],
    ["Galon VIT 19L", 1, 19000, 16000, 20, 10, "unit", "Tersedia"],
    ["Gas Elpiji 3kg", 2, 18000, 15500, 22, 5, "tabung", "Tersedia"],
    ["Gas Elpiji 5.5kg", 2, 95000, 88000, 15, 5, "tabung", "Tersedia"],
    ["Gas Elpiji 12kg", 2, 190000, 175000, 8, 5, "tabung", "Menipis"],
    ["Air Mineral 600ml (Karton)", 3, 35000, 30000, 30, 10, "karton", "Tersedia"],
    ["Air Mineral 1500ml (Karton)", 3, 45000, 38000, 5, 10, "karton", "Menipis"],
    ["Air Mineral 330ml (Karton)", 3, 30000, 25000, 25, 10, "karton", "Tersedia"],
    ["Isi Ulang Air Galon", 4, 5000, 4000, 100, 20, "galon", "Tersedia"],
  ];

  const insertProducts = db.transaction(() => {
    for (const prod of products) {
      insertProduct.run(...(prod as [string, number, number, number, number, number, string, string]));
    }
  });
  insertProducts();

  // Seed orders
  const insertOrder = db.prepare(
    "INSERT INTO orders (order_number, user_id, status, total_amount, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insertOrderItem = db.prepare(
    "INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)"
  );

  const seedOrders = db.transaction(() => {
    const orders = [
      ["AG-20260701-001", 3, "completed", 42000, "cod", "paid"],
      ["AG-20260701-002", 2, "processing", 570000, "transfer", "paid"],
      ["AG-20260702-001", 3, "pending", 35000, "cod", "unpaid"],
      ["AG-20260702-002", 2, "processing", 1550000, "transfer", "paid"],
      ["AG-20260702-003", 3, "completed", 21000, "cod", "paid"],
    ];

    for (const order of orders) {
      const result = insertOrder.run(...order);
      const orderId = result.lastInsertRowid as number;

      // Add order items based on order
      if (order[0] === "AG-20260701-001") {
        insertOrderItem.run(orderId, 1, 2, 21000, 42000);
      } else if (order[0] === "AG-20260701-002") {
        insertOrderItem.run(orderId, 6, 3, 190000, 570000);
      } else if (order[0] === "AG-20260702-001") {
        insertOrderItem.run(orderId, 7, 1, 35000, 35000);
      } else if (order[0] === "AG-20260702-002") {
        insertOrderItem.run(orderId, 4, 10, 15500, 155000);
        insertOrderItem.run(orderId, 5, 5, 88000, 440000);
        insertOrderItem.run(orderId, 6, 5, 175000, 875000);
        // Update total for wholesale order
        db.prepare("UPDATE orders SET total_amount = ? WHERE id = ?").run(1470000, orderId);
      } else if (order[0] === "AG-20260702-003") {
        insertOrderItem.run(orderId, 1, 1, 21000, 21000);
      }
    }
  });
  seedOrders();
}

export function closeDb(): void {
  if (globalThis.__db) {
    globalThis.__db.close();
    globalThis.__db = undefined;
  }
}

// Export both clients for API usage
export { supabaseClient, createSupabaseServerClient };