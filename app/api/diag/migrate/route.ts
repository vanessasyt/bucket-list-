// TEMPORARY, run once, then deleted along with the rest of /api/diag.
//
// The `entries` table in this database is from an earlier version of the app
// (an `activities` array, `lucas_*` review columns, no title/type/lat/lng).
// It holds 25 rows, so it is renamed out of the way rather than dropped, and
// a table matching the current code is created beside it.
//
// Three things move together, which is why this isn't a one-liner:
//   1. the table itself
//   2. its SERIAL sequence, which would otherwise collide with the new table's
//   3. bucket_items' foreign key, which follows the renamed table and has to
//      be re-pointed at the new one
import { NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

const TOKEN = "cdd912df08613efff38eb2d7a8ccb43a";

export async function POST(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (key !== TOKEN) return new NextResponse("Not found", { status: 404 });

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  const client = await pool.connect();
  const steps: string[] = [];

  try {
    await client.query("BEGIN");

    // Refuse to run twice, or against a database that isn't in the state
    // this migration was written for.
    const { rows: existing } = await client.query(
      `SELECT to_regclass('public.entries') AS entries,
              to_regclass('public.entries_v1_archive') AS archive;`
    );
    if (existing[0].archive) {
      await client.query("ROLLBACK");
      return NextResponse.json({ ok: false, error: "Already archived — nothing to do." });
    }
    const { rows: hasType } = await client.query(
      `SELECT count(*)::int AS n FROM information_schema.columns
        WHERE table_schema='public' AND table_name='entries' AND column_name='type';`
    );
    if (hasType[0].n > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({
        ok: false,
        error: "entries already has a `type` column — this is not the old schema.",
      });
    }

    const { rows: before } = await client.query("SELECT count(*)::int AS n FROM entries;");

    await client.query("ALTER TABLE entries RENAME TO entries_v1_archive;");
    steps.push(`renamed entries → entries_v1_archive (${before[0].n} rows)`);

    // The sequence keeps its old name after a table rename and would clash
    // with the SERIAL on the new table.
    const { rows: seq } = await client.query(
      `SELECT to_regclass('public.entries_id_seq') AS seq;`
    );
    if (seq[0].seq) {
      await client.query("ALTER SEQUENCE entries_id_seq RENAME TO entries_v1_archive_id_seq;");
      steps.push("renamed entries_id_seq → entries_v1_archive_id_seq");
    }

    // The FK followed the rename, so it now points at the archive.
    const { rows: fks } = await client.query(
      `SELECT conname FROM pg_constraint
        WHERE conrelid = 'public.bucket_items'::regclass AND contype = 'f';`
    );
    for (const fk of fks) {
      await client.query(`ALTER TABLE bucket_items DROP CONSTRAINT "${fk.conname}";`);
      steps.push(`dropped stale foreign key ${fk.conname}`);
    }

    await client.query(`
      CREATE TABLE entries (
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
    steps.push("created new entries table");

    await client.query(`
      ALTER TABLE bucket_items
        ADD CONSTRAINT bucket_items_entry_id_fkey
        FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE SET NULL;
    `);
    steps.push("re-pointed bucket_items.entry_id at the new entries table");

    await client.query("COMMIT");
    return NextResponse.json({ ok: true, steps });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    const e = err as { message?: string; code?: string };
    return NextResponse.json({
      ok: false,
      error: { message: e.message, code: e.code },
      steps,
      note: "Rolled back — the database is unchanged.",
    });
  } finally {
    client.release();
    await pool.end();
  }
}
