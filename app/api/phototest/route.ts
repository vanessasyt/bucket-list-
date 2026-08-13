// TEMPORARY. Proves the photo round trip works against the real database
// before asking anyone to upload again. Deleted once confirmed.
import { NextResponse } from "next/server";
import { Pool } from "pg";
import { getPhoto, savePhoto } from "@/lib/db";

export const dynamic = "force-dynamic";

const TOKEN = "72205d5373a0c15d66954188";

// A 1x1 red PNG.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== TOKEN) {
    return new NextResponse("Not found", { status: 404 });
  }

  const cleanup = url.searchParams.get("cleanup");
  if (cleanup) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    try {
      await pool.query("DELETE FROM photos WHERE id = $1;", [Number(cleanup)]);
      return NextResponse.json({ ok: true, deleted: Number(cleanup) });
    } finally {
      await pool.end();
    }
  }

  try {
    const id = await savePhoto(PNG, "image/png");
    const back = await getPhoto(id);
    return NextResponse.json({
      ok: true,
      id,
      url: `/api/photo/${id}`,
      wroteBytes: PNG.length,
      readBytes: back?.data.length ?? null,
      mime: back?.mime ?? null,
      identical: back ? Buffer.compare(PNG, back.data) === 0 : false,
    });
  } catch (err) {
    const e = err as { message?: string; code?: string };
    return NextResponse.json({ ok: false, error: { message: e.message, code: e.code } });
  }
}
