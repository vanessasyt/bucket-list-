export type Person = "vanessa" | "tudor";

export const PEOPLE: Person[] = ["vanessa", "tudor"];

export const PERSON_LABELS: Record<Person, string> = {
  vanessa: "Vanessa",
  tudor: "Tudor",
};

// The three kinds of stamp. Each prints in its own ink and shape, so the
// map reads at a glance without a legend.
export type EntryType = "activity" | "restaurant" | "cooking";

export const TYPE_LABELS: Record<EntryType, string> = {
  activity: "Activity",
  restaurant: "Restaurant",
  cooking: "Home cooked",
};

// Tailwind class fragments per type, kept in one place so the stamp,
// the map pin and the list badge can never drift apart.
export const TYPE_INK: Record<EntryType, { text: string; border: string; bg: string; hex: string }> = {
  activity: { text: "text-violet", border: "border-violet", bg: "bg-violet", hex: "#6B4E9E" },
  restaurant: { text: "text-teal", border: "border-teal", bg: "bg-teal", hex: "#24726A" },
  cooking: { text: "text-vermilion", border: "border-vermilion", bg: "bg-vermilion", hex: "#B93B2B" },
};

export interface BucketItem {
  id: number;
  title: string;
  type: EntryType;
  city: string;
  // For cooking items only: who is doing the cooking.
  cook: Person | null;
  entryId: number | null; // set once the item has been done
}

export interface Entry {
  id: number;
  title: string;
  type: EntryType;
  date: string; // "YYYY-MM-DD"
  city: string;
  placeName: string | null;
  lat: number;
  lng: number;
  photos: string[];
  cook: Person | null;
  vanessaRating: number | null;
  vanessaReview: string | null;
  tudorRating: number | null;
  tudorReview: string | null;
}

export function ratingOf(entry: Entry, person: Person): number | null {
  return person === "vanessa" ? entry.vanessaRating : entry.tudorRating;
}

export function reviewOf(entry: Entry, person: Person): string | null {
  return person === "vanessa" ? entry.vanessaReview : entry.tudorReview;
}
