// Loads the starting bucket list from data/seed-bucket.json.
//
// Run with:  node --env-file=.env.local scripts/seed.mjs
//
// Safe to run more than once: items are matched on (title, city), so
// re-running won't create duplicates.

import pg from "pg";
import { readFile } from "node:fs/promises";

const { Pool } = pg;

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!connectionString) {
  console.error(
    "No database connection string found.\n" +
      "Add a line to .env.local that looks like:\n" +
      "  DATABASE_URL=postgresql://...\n"
  );
  process.exit(1);
}

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  const raw = await readFile(new URL("../data/seed-bucket.json", import.meta.url), "utf-8");
  const items = JSON.parse(raw);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS entries (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      city TEXT NOT NULL,
      place_name TEXT,
      lat DOUBLE PRECISION NOT NULL,
      lng DOUBLE PRECISION NOT NULL,
      photos TEXT[] NOT NULL DEFAULT '{}',
      cook TEXT,
      vanessa_rating NUMERIC,
      vanessa_review TEXT,
      tudor_rating NUMERIC,
      tudor_review TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bucket_items (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      city TEXT NOT NULL DEFAULT 'Cambridge',
      cook TEXT,
      entry_id INTEGER REFERENCES entries(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (title, city)
    );
  `);

  let added = 0;
  for (const item of items) {
    const res = await pool.query(
      `INSERT INTO bucket_items (title, type, city, cook)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (title, city) DO NOTHING;`,
      [item.title, item.type, item.city, item.cook ?? null]
    );
    if (res.rowCount > 0) {
      added++;
      console.log(`  added  ${item.title}`);
    } else {
      console.log(`  exists ${item.title}`);
    }
  }

  console.log(`\nDone. ${added} new, ${items.length - added} already there.`);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
