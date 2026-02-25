import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Initialize tables
export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  await sql`
    ALTER TABLE properties
    ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)
  `

  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK (type IN ('purchase', 'sale', 'expense')),
      amount REAL NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    )
  `

  // Postgres trigger for updated_at
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ language 'plpgsql'
  `

  await sql`
    DO $$ BEGIN
      CREATE TRIGGER update_properties_timestamp
      BEFORE UPDATE ON properties
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$
  `
}

export default sql
