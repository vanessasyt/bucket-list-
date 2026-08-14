"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import {
  addBucketItem,
  createEntry,
  deleteBucketItem,
  deleteEntry,
  updateBucketItem,
  saveReview,
  addPhotos,
  updateEntry,
} from "@/lib/db";
import { hasCuisine, isEntryType, isPerson, type EntryType, type Person } from "@/lib/types";

export interface ActionState {
  error?: string;
}

/* ---------------- shared parsing ---------------- */

// There are no passwords and no session. Whoever is writing picks their name
// in the form, and that choice is what decides which half of a review gets
// written. Anyone with the link can write as either of us — that is the
// deal we've made in exchange for never logging in.
function authorFrom(formData: FormData): Person | null {
  const raw = formData.get("author");
  return isPerson(raw) ? raw : null;
}

function photosFrom(formData: FormData): string[] {
  try {
    const parsed = JSON.parse(String(formData.get("photos") || "[]"));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is string => typeof p === "string" && p.length > 0);
  } catch {
    return [];
  }
}

interface PlaceFields {
  title: string;
  type: EntryType;
  date: string;
  city: string;
  placeName: string | null;
  cuisine: string | null;
  lat: number;
  lng: number;
  photos: string[];
  cook: Person | null;
}

// The half of the form that describes the place itself. Shared by creating
// an entry and editing one, so the two can't validate differently.
function placeFrom(formData: FormData): PlaceFields | { error: string } {
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Give it a name." };

  const type = String(formData.get("type") || "");
  if (!isEntryType(type)) return { error: "Pick café, restaurant or home cooked." };

  const date = String(formData.get("date") || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Pick a date." };

  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { error: "Set the location by searching or clicking the map." };
  }

  const cookRaw = formData.get("cook");
  const cook: Person | null = type === "cooking" && isPerson(cookRaw) ? cookRaw : null;

  return {
    title,
    type,
    date,
    city: String(formData.get("city") || "").trim() || "Unknown",
    placeName: String(formData.get("placeName") || "").trim() || null,
    // Dropped for home-cooked, so switching the kind can't leave a stale
    // cuisine behind on the entry.
    cuisine: hasCuisine(type)
      ? String(formData.get("cuisine") || "").trim() || null
      : null,
    lat,
    lng,
    photos: photosFrom(formData),
    cook,
  };
}

function ratingFrom(formData: FormData): number | null {
  const raw = String(formData.get("rating") || "").trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.min(10, Math.max(0, n));
}

/* ---------------- photos ---------------- */

// Photos arrive already shrunk by the browser, so this is a ceiling rather
// than an expected size. Server actions have their own body limit too, set
// in next.config.mjs.
const MAX_PHOTO_BYTES = 6 * 1024 * 1024;

export interface UploadResult {
  ok: boolean;
  url?: string;
  error?: string;
}

// New photos go to Vercel Blob and the entry stores the public URL it
// returns. Photos added before this change are still rows in the `photos`
// table and still have /api/photo/<id> URLs; that route stays in place so
// they keep loading. Nothing needs migrating — the two kinds of URL sit
// side by side in the same photos array.
export async function uploadPhoto(formData: FormData): Promise<UploadResult> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file received." };
  if (!file.type.startsWith("image/")) return { ok: false, error: "Images only." };
  if (file.size > MAX_PHOTO_BYTES) {
    return { ok: false, error: "That photo is too large even after shrinking." };
  }

  try {
    const blob = await put(`photos/${file.name || "photo.jpg"}`, file, {
      access: "public",
      // Without this, two photos with the same filename collide.
      addRandomSuffix: true,
      contentType: file.type,
    });
    return { ok: true, url: blob.url };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // The usual cause is no Blob store connected, which surfaces as a
    // missing-token error and is otherwise cryptic in the UI.
    if (/token/i.test(message)) {
      return {
        ok: false,
        error: "Blob storage isn't set up — add a Blob store in Vercel and redeploy.",
      };
    }
    return { ok: false, error: message.slice(0, 140) };
  }
}

export async function addPhotosAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const entryId = Number(formData.get("entryId"));
  if (!Number.isFinite(entryId)) return { error: "Missing entry." };

  const urls = photosFrom(formData);
  if (urls.length) await addPhotos(entryId, urls);
  revalidatePath("/");
  revalidatePath(`/entry/${entryId}`);
  return {};
}

/* ---------------- entries ---------------- */

export async function createEntryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const author = authorFrom(formData);
  if (!author) return { error: "Say who's writing this." };

  const place = placeFrom(formData);
  if ("error" in place) return place;

  const bucketRaw = String(formData.get("bucketItemId") || "");
  const bucketItemId = bucketRaw ? Number(bucketRaw) : null;

  const entry = await createEntry({
    ...place,
    bucketItemId: Number.isFinite(bucketItemId) ? bucketItemId : null,
    author,
    rating: ratingFrom(formData),
    review: String(formData.get("review") || "").trim() || null,
  });

  revalidatePath("/");
  revalidatePath("/list");
  redirect(`/entry/${entry.id}`);
}

export async function updateEntryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const entryId = Number(formData.get("entryId"));
  if (!Number.isFinite(entryId)) return { error: "Missing entry." };

  const place = placeFrom(formData);
  if ("error" in place) return place;

  await updateEntry(entryId, place);

  revalidatePath("/");
  revalidatePath("/list");
  revalidatePath(`/entry/${entryId}`);
  redirect(`/entry/${entryId}`);
}

export async function deleteEntryAction(formData: FormData) {
  const entryId = Number(formData.get("entryId"));
  if (!Number.isFinite(entryId)) return;

  await deleteEntry(entryId);
  revalidatePath("/");
  revalidatePath("/list");
  redirect("/");
}

export async function saveReviewAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const author = authorFrom(formData);
  if (!author) return { error: "Say who's writing this." };

  const entryId = Number(formData.get("entryId"));
  if (!Number.isFinite(entryId)) return { error: "Missing entry." };

  await saveReview(
    entryId,
    author,
    ratingFrom(formData),
    String(formData.get("review") || "").trim() || null
  );
  revalidatePath("/");
  revalidatePath(`/entry/${entryId}`);
  return {};
}

/* ---------------- want to try ---------------- */

export async function addBucketItemAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Name the place you want to try." };

  const type = String(formData.get("type") || "");
  if (!isEntryType(type)) return { error: "Pick café, restaurant or home cooked." };

  const city = String(formData.get("city") || "").trim() || "Cambridge";
  const cookRaw = formData.get("cook");
  const cook: Person | null = type === "cooking" && isPerson(cookRaw) ? cookRaw : null;

  await addBucketItem({ title, type, city, cook });
  revalidatePath("/list");
  return {};
}

export async function updateBucketItemAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return { error: "Missing item." };

  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Give it a name." };

  const type = String(formData.get("type") || "");
  if (!isEntryType(type)) return { error: "Pick café, restaurant or home cooked." };

  const city = String(formData.get("city") || "").trim() || "Cambridge";
  const cookRaw = formData.get("cook");
  const cook: Person | null = type === "cooking" && isPerson(cookRaw) ? cookRaw : null;

  try {
    await updateBucketItem(id, { title, type, city, cook });
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      return { error: `${title} is already on the list for ${city}.` };
    }
    throw err;
  }

  revalidatePath("/list");
  return {};
}

export async function deleteBucketItemAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (Number.isFinite(id)) {
    await deleteBucketItem(id);
    revalidatePath("/list");
  }
}
