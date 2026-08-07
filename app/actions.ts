"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { checkPassword, clearSession, currentPerson, setSession } from "@/lib/auth";
import {
  addBucketItem,
  createEntry,
  deleteBucketItem,
  saveReview,
  addPhotos,
} from "@/lib/db";
import type { EntryType, Person } from "@/lib/types";

export interface ActionState {
  error?: string;
}

/* ---------------- auth ---------------- */

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const person = String(formData.get("person") || "") as Person;
  const password = String(formData.get("password") || "");

  if (person !== "vanessa" && person !== "tudor") {
    return { error: "Pick who you are." };
  }
  if (!checkPassword(person, password)) {
    return { error: "That password doesn't match." };
  }
  setSession(person);
  redirect("/");
}

export async function logout() {
  clearSession();
  redirect("/login");
}

/* ---------------- photos ---------------- */

const MAX_PHOTO_BYTES = 15 * 1024 * 1024;

export interface UploadResult {
  ok: boolean;
  url?: string;
  error?: string;
}

export async function uploadPhoto(formData: FormData): Promise<UploadResult> {
  if (!currentPerson()) return { ok: false, error: "Log in first." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file received." };
  if (!file.type.startsWith("image/")) return { ok: false, error: "Images only." };
  if (file.size > MAX_PHOTO_BYTES) return { ok: false, error: "Too large (max 15MB)." };

  try {
    const blob = await put(`stamps/${Date.now()}-${file.name || "photo"}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    return { ok: true, url: blob.url };
  } catch {
    return { ok: false, error: "Upload failed — is Blob storage connected?" };
  }
}

/* ---------------- entries ---------------- */

export async function createEntryAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const person = currentPerson();
  if (!person) return { error: "Log in first." };

  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Give it a title." };

  const type = String(formData.get("type") || "activity") as EntryType;
  if (!["activity", "restaurant", "cooking"].includes(type)) {
    return { error: "Pick a type." };
  }

  const date = String(formData.get("date") || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Pick a date." };

  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { error: "Set the location by clicking the map." };
  }

  const city = String(formData.get("city") || "").trim() || "Unknown";
  const placeName = String(formData.get("placeName") || "").trim() || null;

  const cookRaw = String(formData.get("cook") || "");
  const cook: Person | null =
    type === "cooking" && (cookRaw === "vanessa" || cookRaw === "tudor") ? cookRaw : null;

  let photos: string[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("photos") || "[]"));
    if (Array.isArray(parsed)) photos = parsed.filter((p) => typeof p === "string" && p);
  } catch {
    photos = [];
  }

  const ratingRaw = String(formData.get("rating") || "").trim();
  const review = String(formData.get("review") || "").trim() || null;

  const bucketRaw = String(formData.get("bucketItemId") || "");
  const bucketItemId = bucketRaw ? Number(bucketRaw) : null;

  const entry = await createEntry({
    title,
    type,
    date,
    city,
    placeName,
    lat,
    lng,
    photos,
    cook,
    bucketItemId: Number.isFinite(bucketItemId) ? bucketItemId : null,
    author: person,
    rating: ratingRaw ? Number(ratingRaw) : null,
    review,
  });

  revalidatePath("/");
  revalidatePath("/list");
  redirect(`/entry/${entry.id}`);
}

export async function saveReviewAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const person = currentPerson();
  if (!person) return { error: "Log in first." };

  const entryId = Number(formData.get("entryId"));
  if (!Number.isFinite(entryId)) return { error: "Missing entry." };

  const ratingRaw = String(formData.get("rating") || "").trim();
  const review = String(formData.get("review") || "").trim() || null;

  // A person can only ever write their own half — the column is chosen
  // from the session, never from the form.
  await saveReview(entryId, person, ratingRaw ? Number(ratingRaw) : null, review);
  revalidatePath(`/entry/${entryId}`);
  return {};
}

export async function addPhotosAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!currentPerson()) return { error: "Log in first." };
  const entryId = Number(formData.get("entryId"));
  if (!Number.isFinite(entryId)) return { error: "Missing entry." };

  let urls: string[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("photos") || "[]"));
    if (Array.isArray(parsed)) urls = parsed.filter((p) => typeof p === "string" && p);
  } catch {
    urls = [];
  }
  if (urls.length) await addPhotos(entryId, urls);
  revalidatePath(`/entry/${entryId}`);
  return {};
}

/* ---------------- bucket list ---------------- */

export async function addBucketItemAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!currentPerson()) return { error: "Log in first." };

  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Name the thing you want to do." };

  const type = String(formData.get("type") || "activity") as EntryType;
  const city = String(formData.get("city") || "Cambridge").trim() || "Cambridge";
  const cookRaw = String(formData.get("cook") || "");
  const cook: Person | null =
    type === "cooking" && (cookRaw === "vanessa" || cookRaw === "tudor") ? cookRaw : null;

  await addBucketItem({ title, type, city, cook });
  revalidatePath("/list");
  return {};
}

export async function deleteBucketItemAction(formData: FormData) {
  if (!currentPerson()) return;
  const id = Number(formData.get("id"));
  if (Number.isFinite(id)) {
    await deleteBucketItem(id);
    revalidatePath("/list");
  }
}
