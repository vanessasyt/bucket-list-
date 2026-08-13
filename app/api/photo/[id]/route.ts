import { NextResponse } from "next/server";
import { getPhoto } from "@/lib/db";

// Photos are stored in Postgres, so they are served from here rather than
// from a storage host. A photo's bytes never change once written, so this
// can be cached hard and effectively behaves like a static file.
export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) return new NextResponse("Not found", { status: 404 });

  const photo = await getPhoto(id);
  if (!photo) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(new Uint8Array(photo.data), {
    headers: {
      "Content-Type": photo.mime,
      "Content-Length": String(photo.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
