import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import type { Person } from "./types";

const COOKIE = "passport_who";

function secret(): string {
  return process.env.AUTH_SECRET || "change-me-in-vercel-env-vars";
}

// The cookie holds the person's name plus an HMAC of it, so it can't be
// edited by hand to impersonate the other person. This is deliberately
// lightweight — right-sized for a private two-person app, not for
// anything holding sensitive data.
function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function passwordFor(person: Person): string {
  if (person === "vanessa") return process.env.VANESSA_PASSWORD || "vanessaisthebest";
  return process.env.TUDOR_PASSWORD || "tudoristhebest";
}

export function checkPassword(person: Person, password: string): boolean {
  return safeEqual(password, passwordFor(person));
}

// There's no "who are you?" picker on the login screen — the password itself
// says which of the two people you are. Both are always checked so a wrong
// password takes the same path regardless of whose it nearly was.
export function personForPassword(password: string): Person | null {
  const isVanessa = checkPassword("vanessa", password);
  const isTudor = checkPassword("tudor", password);
  if (isVanessa) return "vanessa";
  if (isTudor) return "tudor";
  return null;
}

export function setSession(person: Person) {
  cookies().set(COOKIE, `${person}.${sign(person)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // a year; this is a private app, not a bank
  });
}

export function clearSession() {
  cookies().delete(COOKIE);
}

export function currentPerson(): Person | null {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return null;
  const [name, mac] = raw.split(".");
  if (!name || !mac) return null;
  if (name !== "vanessa" && name !== "tudor") return null;
  if (!safeEqual(mac, sign(name))) return null;
  return name;
}
