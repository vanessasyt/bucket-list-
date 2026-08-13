export type Person = "vanessa" | "tudor";

export const PEOPLE: Person[] = ["vanessa", "tudor"];

export const PERSON_LABELS: Record<Person, string> = {
  vanessa: "Vanessa",
  tudor: "Tudor",
};

export function isPerson(value: unknown): value is Person {
  return value === "vanessa" || value === "tudor";
}

// The three kinds of place this diary records. Nothing else belongs on the map.
export type EntryType = "cafe" | "restaurant" | "cooking";

export const ENTRY_TYPES: EntryType[] = ["cafe", "restaurant", "cooking"];

export const TYPE_LABELS: Record<EntryType, string> = {
  cafe: "Cafés",
  restaurant: "Restaurants",
  cooking: "Home cooked",
};

// Singular form, for when one place is being described rather than a group.
export const TYPE_LABELS_ONE: Record<EntryType, string> = {
  cafe: "Café",
  restaurant: "Restaurant",
  cooking: "Home cooked",
};

export function isEntryType(value: unknown): value is EntryType {
  return value === "cafe" || value === "restaurant" || value === "cooking";
}

// Where you eat has a cuisine; what you cook is already named by the dish.
export function hasCuisine(type: EntryType): boolean {
  return type === "cafe" || type === "restaurant";
}

// Category colour: which kind of place this is. The hex must stay in step
// with the Tailwind tokens of the same names, since pins use the hex and
// list dots use the class.
export const TYPE_STYLE: Record<EntryType, { text: string; border: string; bg: string; hex: string }> =
  {
    cafe: { text: "text-cafe", border: "border-cafe", bg: "bg-cafe", hex: "#2FA37A" },
    restaurant: {
      text: "text-restaurant",
      border: "border-restaurant",
      bg: "bg-restaurant",
      hex: "#C2455E",
    },
    cooking: { text: "text-cooking", border: "border-cooking", bg: "bg-cooking", hex: "#8259A8" },
  };

// Rating colour: how good it was. Separate from the category colours so a
// pin can say both things at once.
export const RATING_BANDS: { min: number; hex: string; label: string }[] = [
  { min: 9, hex: "#16704A", label: "9+" },
  { min: 7.5, hex: "#4E9E5F", label: "7.5" },
  { min: 6, hex: "#A9A63C", label: "6" },
  { min: 4.5, hex: "#B5657B", label: "4.5" },
  { min: 0, hex: "#8C8C93", label: "0" },
];

export const RATING_NONE_HEX = "#FFFFFF";

export function ratingColour(value: number | null): string {
  if (value === null) return RATING_NONE_HEX;
  return (RATING_BANDS.find((b) => value >= b.min) ?? RATING_BANDS[RATING_BANDS.length - 1]).hex;
}

export interface BucketItem {
  id: number;
  title: string;
  type: EntryType;
  city: string;
  // For cooking items only: who is doing the cooking.
  cook: Person | null;
  entryId: number | null; // set once the item has been visited/made
}

export interface Entry {
  id: number;
  title: string;
  type: EntryType;
  date: string; // "YYYY-MM-DD"
  city: string;
  placeName: string | null;
  // Free text — "Italian", "Brunch", "Korean BBQ". Shown under the pin on
  // the map, where it's the only clue to a place before you click it.
  // Cafés and restaurants only; a home-cooked dish names itself.
  cuisine: string | null;
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

// The number shown on the pin and the card: the mean of whichever ratings
// exist, or null while neither of us has scored it yet.
export function avgRating(entry: Entry): number | null {
  const given = [entry.vanessaRating, entry.tudorRating].filter(
    (r): r is number => r !== null
  );
  if (given.length === 0) return null;
  return given.reduce((a, b) => a + b, 0) / given.length;
}

// One decimal, but no trailing ".0" — "8.5" and "9", never "9.0".
export function formatRating(value: number): string {
  return Number(value.toFixed(1)).toString();
}
