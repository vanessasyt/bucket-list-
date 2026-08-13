// TEMPORARY. Finds out why photo uploads aren't sticking, then gets deleted.
// Token-gated so the error text isn't readable by anyone who finds the URL.
import { NextResponse } from "next/server";
import { del, put } from "@vercel/blob";

export const dynamic = "force-dynamic";

const TOKEN = "f2b987785b026ef5caa6caf7ad95b467";

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (key !== TOKEN) return new NextResponse("Not found", { status: 404 });

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  const env = {
    BLOB_READ_WRITE_TOKEN: token ? `set (${token.length} chars)` : "unset",
    blobish: Object.keys(process.env).filter((k) => /BLOB|VERCEL_BLOB/i.test(k)),
  };

  // Round-trip a tiny file so the answer is what actually happens, not what
  // the environment implies. Cleaned up immediately either way.
  try {
    const blob = await put(`diag/${Date.now()}.txt`, "ok", {
      access: "public",
      addRandomSuffix: true,
    });
    let removed = false;
    try {
      await del(blob.url);
      removed = true;
    } catch {
      removed = false;
    }
    return NextResponse.json({ ok: true, uploaded: blob.url, removed, env });
  } catch (err) {
    const e = err as { name?: string; message?: string; code?: string };
    return NextResponse.json({
      ok: false,
      error: { name: e.name, message: e.message, code: e.code },
      env,
    });
  }
}
