// TEMPORARY. Reports why the database calls are failing in production, then
// gets deleted. Gated behind a token so the error text — which can name the
// database host and user — isn't readable by anyone who finds the URL.
import { NextResponse } from "next/server";
import { Pool } from "pg";
import { getEntries } from "@/lib/db";

// Self-contained so this whole file can be deleted without touching lib/db.ts.
async function rawQuery(sql: string) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  try {
    return await pool.query(sql);
  } finally {
    await pool.end();
  }
}

export const dynamic = "force-dynamic";

const TOKEN = "cdd912df08613efff38eb2d7a8ccb43a";

const CONNECTION_VARS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
];

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (key !== TOKEN) return new NextResponse("Not found", { status: 404 });

  // Which connection variables exist, and the host each points at — never
  // the password.
  const env: Record<string, string> = {};
  for (const name of CONNECTION_VARS) {
    const value = process.env[name];
    if (!value) {
      env[name] = "unset";
      continue;
    }
    try {
      const u = new URL(value);
      env[name] = `set → ${u.host}${u.pathname}`;
    } catch {
      env[name] = "set (unparseable)";
    }
  }

  // Any other Postgres-ish variable the integration may have created under
  // a name lib/db.ts doesn't look at.
  const otherPgVars = Object.keys(process.env).filter(
    (k) => /POSTGRES|DATABASE|NEON|SUPABASE|PG/i.test(k) && !CONNECTION_VARS.includes(k)
  );

  // What the two tables actually look like right now.
  let schema: unknown = null;
  try {
    const { rows } = await rawQuery(
      `SELECT table_name, column_name, data_type
         FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name IN ('entries','bucket_items')
        ORDER BY table_name, ordinal_position;`
    );
    schema = rows.reduce((acc: Record<string, string[]>, r: Record<string, string>) => {
      (acc[r.table_name] ||= []).push(`${r.column_name} ${r.data_type}`);
      return acc;
    }, {});
  } catch (e) {
    schema = `failed: ${(e as Error).message}`;
  }

  try {
    const entries = await getEntries();
    return NextResponse.json({ ok: true, entries: entries.length, schema, env, otherPgVars });
  } catch (err) {
    const e = err as { message?: string; code?: string; name?: string; severity?: string };
    return NextResponse.json({
      ok: false,
      error: { name: e.name, message: e.message, code: e.code, severity: e.severity },
      schema,
      env,
      otherPgVars,
    });
  }
}
