"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import {
  addBucketItem,
  createEntry,
  deleteBucketItem,
  deleteEntry,
  getEntry,
  updateBucketItem,
  saveReview,
  addPhotos,
  updateEntry,
} from "@/lib/db";
import {
  DOMAIN_COPY,
  domainOf,
  hasCook,
  hasCuisine,
  isEntryType,
  isPerson,
  type EntryType,
  type Person,
} from "@/lib/types";

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

// Both halves of the book get revalidated by kind rather than by hardcoded
// path, so an activity never busts the food map's cache and vice versa.
function revalidateDomain(type: EntryType) {
  const copy = DOMAIN_COPY[domainOf(type)];
  revalidatePath(copy.home);
  revalidatePath(copy.list);
}

// A blank coordinate field means "no location", not zero. Reading it with a
// bare Number() is what used to file entries at 0°N 0°E, since Number("")
// is 0 and 0 passes an isFinite check.
function coordFrom(formData: FormData, name: string): number | null {
  const raw = String(formData.get(name) ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
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
  lat: number | null;
  lng: number | null;
  photos: string[];
  cook: Person | null;
}

// The half of the form that describes the place itself. Shared by creating
// an entry and editing one, so the two can't validate differently.
function placeFrom(formData: FormData): PlaceFields | { error: string } {
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Give it a name." };

  const type = String(formData.get("type") || "");
  if (!isEntryType(type)) return { error: "Pick what kind of thing this was." };

  const date = String(formData.get("date") || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Pick a date." };

  // Location is optional. Half a pair is no location at all — a lone
  // latitude can't be drawn and shouldn't be stored.
  const latValue = coordFrom(formData, "lat");
  const lngValue = coordFrom(formData, "lng");
  const [lat, lng] =
    latValue === null || lngValue === null ? [null, null] : [latValue, lngValue];

  const cookRaw = formData.get("cook");
  const cook: Person | null = hasCook(type) && isPerson(cookRaw) ? cookRaw : null;

  return {
    title,
    type,
    date,
    // Blank rather than "Unknown": an entry with no location has no city
    // either, and "Unknown" reading under every home-cooked meal is worse
    // than nothing at all.
    city: String(formData.get("city") || "").trim(),
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

  // A connected Blob store injects this at build time, so an absent token
  // means either no store is connected or the store was connected after
  // this deployment was built. Checking up front separates that from a
  // token that exists but is rejected — previously both said the same
  // thing, which made a redeploy look like it hadn't helped.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      ok: false,
      error: "No blob token in this deployment — connect a Blob store, then redeploy.",
    };
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
    // The catch used to swallow the error entirely, so a rejected token, a
    // deleted store and an over-quota one left nothing in the logs to tell
    // them apart. The real error now reaches the runtime logs.
    console.error("Blob upload failed:", err);
    if (/token/i.test(message)) {
      return {
        ok: false,
        error: "Blob storage rejected the token — check the store is still connected.",
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

  const entry = await getEntry(entryId);
  if (entry) revalidateDomain(entry.type);
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

  revalidateDomain(entry.type);
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

  // The form only ever offers kinds from the entry's own half, but there is
  // no session here to lean on. Retyping a restaurant as bouldering would
  // move the entry out from under whichever list reached it and strand any
  // wishlist item pointing at it, so refuse it at the boundary.
  const existing = await getEntry(entryId);
  if (!existing) return { error: "Missing entry." };
  if (domainOf(existing.type) !== domainOf(place.type)) {
    return { error: "An entry can't move between food and activities." };
  }

  await updateEntry(entryId, place);

  revalidateDomain(place.type);
  revalidatePath(`/entry/${entryId}`);
  redirect(`/entry/${entryId}`);
}

export async function deleteEntryAction(formData: FormData) {
  const entryId = Number(formData.get("entryId"));
  if (!Number.isFinite(entryId)) return;

  // Read the type before the row goes, so we know which half to send the
  // reader back to.
  const existing = await getEntry(entryId);
  const copy = DOMAIN_COPY[existing ? domainOf(existing.type) : "food"];

  await deleteEntry(entryId);
  revalidatePath(copy.home);
  revalidatePath(copy.list);
  redirect(copy.home);
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

  const entry = await getEntry(entryId);
  if (entry) revalidateDomain(entry.type);
  revalidatePath(`/entry/${entryId}`);
  return {};
}

/* ---------------- want to try ---------------- */

export async function addBucketItemAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Give it a name." };

  const type = String(formData.get("type") || "");
  if (!isEntryType(type)) return { error: "Pick what kind of thing this is." };

  const city = String(formData.get("city") || "").trim() || "Cambridge";
  const cookRaw = formData.get("cook");
  const cook: Person | null = hasCook(type) && isPerson(cookRaw) ? cookRaw : null;

  await addBucketItem({ title, type, city, cook });
  revalidatePath(DOMAIN_COPY[domainOf(type)].list);
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
  if (!isEntryType(type)) return { error: "Pick what kind of thing this is." };

  const city = String(formData.get("city") || "").trim() || "Cambridge";
  const cookRaw = formData.get("cook");
  const cook: Person | null = hasCook(type) && isPerson(cookRaw) ? cookRaw : null;

  try {
    await updateBucketItem(id, { title, type, city, cook });
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      // The unique constraint is on (title, city) alone, so the clash may
      // be with an item on the other half's list, which the reader can't
      // see from here. Don't claim to know which list it's on.
      return { error: `${title} is already on one of the lists for ${city}.` };
    }
    throw err;
  }

  revalidatePath(DOMAIN_COPY[domainOf(type)].list);
  return {};
}

export async function deleteBucketItemAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (Number.isFinite(id)) {
    await deleteBucketItem(id);
    // The form doesn't carry the item's kind and the row is gone by now, so
    // refresh both lists rather than guess which one it was on.
    revalidatePath(DOMAIN_COPY.food.list);
    revalidatePath(DOMAIN_COPY.activity.list);
  }
}
