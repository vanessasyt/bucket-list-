import { Pool } from "pg";
import type { BucketItem, Entry, EntryType, Person } from "./types";

// The pool is built lazily rather than at module load. Next.js imports
// route files during the build to inspect them, and a missing connection
// string at that moment shouldn't fail the build — only an actual query
// should care.
let pool: Pool | null = null;

function getPool(): Pool {
  if (pool) return pool;

  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!connectionString) {
    throw new Error(
      "No database connection string found. Set DATABASE_URL in your environment."
    );
  }

  pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  return pool;
}

let schemaReady: Promise<unknown> | null = null;

function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const p = getPool();
      await p.query(`
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
      await p.query(`
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
    })();
  }
  return schemaReady;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function toEntry(r: any): Entry {
  return {
    id: r.id,
    title: r.title,
    type: r.type as EntryType,
    date: r.date,
    city: r.city,
    placeName: r.place_name,
    lat: Number(r.lat),
    lng: Number(r.lng),
    photos: r.photos ?? [],
    cook: (r.cook as Person) ?? null,
    vanessaRating: r.vanessa_rating === null ? null : Number(r.vanessa_rating),
    vanessaReview: r.vanessa_review,
    tudorRating: r.tudor_rating === null ? null : Number(r.tudor_rating),
    tudorReview: r.tudor_review,
  };
}

function toBucketItem(r: any): BucketItem {
  return {
    id: r.id,
    title: r.title,
    type: r.type as EntryType,
    city: r.city,
    cook: (r.cook as Person) ?? null,
    entryId: r.entry_id ?? null,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function getEntries(): Promise<Entry[]> {
  await ensureSchema();
  const { rows } = await getPool().query("SELECT * FROM entries ORDER BY date DESC, id DESC;");
  return rows.map(toEntry);
}

export async function getEntry(id: number): Promise<Entry | null> {
  await ensureSchema();
  const { rows } = await getPool().query("SELECT * FROM entries WHERE id = $1;", [id]);
  return rows.length ? toEntry(rows[0]) : null;
}

export async function getBucketItems(): Promise<BucketItem[]> {
  await ensureSchema();
  const { rows } = await getPool().query(
    "SELECT * FROM bucket_items ORDER BY (entry_id IS NOT NULL), id ASC;"
  );
  return rows.map(toBucketItem);
}

export async function addBucketItem(input: {
  title: string;
  type: EntryType;
  city: string;
  cook: Person | null;
}): Promise<void> {
  await ensureSchema();
  await getPool().query(
    `INSERT INTO bucket_items (title, type, city, cook)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (title, city) DO NOTHING;`,
    [input.title, input.type, input.city, input.cook]
  );
}

export async function deleteBucketItem(id: number): Promise<void> {
  await ensureSchema();
  await getPool().query("DELETE FROM bucket_items WHERE id = $1;", [id]);
}

export interface NewEntry {
  title: string;
  type: EntryType;
  date: string;
  city: string;
  placeName: string | null;
  lat: number;
  lng: number;
  photos: string[];
  cook: Person | null;
  bucketItemId: number | null;
  author: Person;
  rating: number | null;
  review: string | null;
}

export async function createEntry(input: NewEntry): Promise<Entry> {
  await ensureSchema();
  const p = getPool();

  // Only the author's half is filled in here. The other person adds
  // theirs later from the entry page.
  const isVanessa = input.author === "vanessa";
  const { rows } = await p.query(
    `INSERT INTO entries
       (title, type, date, city, place_name, lat, lng, photos, cook,
        vanessa_rating, vanessa_review, tudor_rating, tudor_review)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *;`,
    [
      input.title,
      input.type,
      input.date,
      input.city,
      input.placeName,
      input.lat,
      input.lng,
      input.photos,
      input.cook,
      isVanessa ? input.rating : null,
      isVanessa ? input.review : null,
      isVanessa ? null : input.rating,
      isVanessa ? null : input.review,
    ]
  );
  const entry = toEntry(rows[0]);

  if (input.bucketItemId) {
    await p.query("UPDATE bucket_items SET entry_id = $1 WHERE id = $2;", [
      entry.id,
      input.bucketItemId,
    ]);
  }
  return entry;
}

// Used when the second person adds their half of an existing entry, or
// when either person edits their own half.
export async function saveReview(
  entryId: number,
  person: Person,
  rating: number | null,
  review: string | null
): Promise<void> {
  await ensureSchema();
  const cols =
    person === "vanessa"
      ? "vanessa_rating = $2, vanessa_review = $3"
      : "tudor_rating = $2, tudor_review = $3";
  await getPool().query(`UPDATE entries SET ${cols} WHERE id = $1;`, [entryId, rating, review]);
}

export async function addPhotos(entryId: number, urls: string[]): Promise<void> {
  await ensureSchema();
  await getPool().query("UPDATE entries SET photos = photos || $2 WHERE id = $1;", [entryId, urls]);
}
