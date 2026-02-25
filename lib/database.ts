import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'property-tracker.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('HDB', 'Condo', 'Landed')),
    purchase_price REAL NOT NULL,
    purchase_date TEXT NOT NULL,
    stamp_duty REAL DEFAULT 0,
    renovation_cost REAL DEFAULT 0,
    agent_fees REAL DEFAULT 0,
    current_value REAL DEFAULT 0,
    cpf_amount REAL DEFAULT 0,
    mortgage_amount REAL DEFAULT 0,
    mortgage_interest_rate REAL DEFAULT 0,
    mortgage_tenure INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'sale', 'expense')),
    amount REAL NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL
  );

  CREATE TRIGGER IF NOT EXISTS update_properties_timestamp 
  AFTER UPDATE ON properties
  BEGIN
    UPDATE properties SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
`);

export default db;