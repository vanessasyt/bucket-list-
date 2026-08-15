export type Person = "vanessa" | "tudor";

export const PEOPLE: Person[] = ["vanessa", "tudor"];

export const PERSON_LABELS: Record<Person, string> = {
  vanessa: "Vanessa",
  tudor: "Tudor",
};

export function isPerson(value: unknown): value is Person {
  return value === "vanessa" || value === "tudor";
}

// The diary has two halves you flip between: places we ate, and things we
// did. A kind belongs to exactly one of them, and that's the only thing
// separating the two — there is no domain column in the database, because
// the kind already answers the question.
export type Domain = "food" | "activity";

export const DOMAINS: Domain[] = ["food", "activity"];

export function isDomain(value: unknown): value is Domain {
  return value === "food" || value === "activity";
}

interface KindDef {
  domain: Domain;
  label: string; // plural — filter bars, wishlist headings
  labelOne: string; // singular — one entry being described
  // Must stay in step with the Tailwind token of the same name. The hex is
  // the one that actually renders: category colour reaches Leaflet through
  // HTML strings, so it can't be a class.
  hex: string;
  icon: string; // 24×24 stroke path data, fill none
  cuisine?: true; // shows the free-text cuisine field
  cook?: true; // asks which of us did it
}

// Every kind the diary knows about, in the order they appear in the filter
// bar and the wishlist. ADDING A KIND IS ONE ENTRY HERE — the union type,
// the filters, the labels, the colours, the icons and the domain split are
// all derived below. The only other edit is the matching Tailwind token.
export const KINDS = {
  // Food — places we ate, and things we cooked.
  cafe: {
    domain: "food",
    label: "Cafés",
    labelOne: "Café",
    hex: "#2FA37A",
    cuisine: true,
    icon: "M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9ZM16 10h2.5a2.5 2.5 0 0 1 0 5H16M7 3v2M11 3v2",
  },
  restaurant: {
    domain: "food",
    label: "Restaurants",
    labelOne: "Restaurant",
    hex: "#C2455E",
    cuisine: true,
    icon: "M6 3v8a2 2 0 0 0 4 0V3M8 11v10M17 3c-1.5 1.5-2 3.5-2 6s.5 3 2 3 2-.5 2-3-.5-4.5-2-6Zm0 9v9",
  },
  cooking: {
    domain: "food",
    label: "Home cooked",
    labelOne: "Home cooked",
    hex: "#8259A8",
    cook: true,
    icon: "M4 10h16v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-5ZM2 10h20M9 6c0-1 1-1.5 1-2.5M13 6c0-1 1-1.5 1-2.5",
  },

  // Activities — one kind, deliberately. This half is a bucket list you tick
  // off, not a collection you browse, so there is nothing to categorise: the
  // title already says whether it was punting or pottery. Everything
  // category-shaped in the UI is gated on hasKinds() below.
  //
  // NOT named 'activity': a much older version of this app wrote bucket_items
  // rows with that exact type, and they stay invisible precisely because no
  // kind claims them.
  outing: {
    domain: "activity",
    label: "Things we did",
    labelOne: "Outing",
    hex: "#6455A8",
    // A planted flag — the bucket-list gesture.
    icon: "M6 21V4M6 4h11l-2.2 3.6L17 11H6",
  },
} as const satisfies Record<string, KindDef>;

export type EntryType = keyof typeof KINDS;

export const ENTRY_TYPES = Object.keys(KINDS) as EntryType[];

export function isEntryType(value: unknown): value is EntryType {
  return typeof value === "string" && value in KINDS;
}

export function domainOf(type: EntryType): Domain {
  return KINDS[type].domain;
}

export function typesIn(domain: Domain): EntryType[] {
  return ENTRY_TYPES.filter((t) => KINDS[t].domain === domain);
}

// A domain with a single kind has nothing to categorise: no filter bar, no
// kind chips on the forms, no grouped wishlist, no kind label on a card.
// This is the one gate for all of it, so adding a second activity kind later
// brings that UI back on its own.
export function hasKinds(domain: Domain): boolean {
  return typesIn(domain).length > 1;
}

// `as const satisfies` keeps the keys literal — which is what makes
// EntryType a real union — but it also narrows each value to its own exact
// shape, so the optional flags aren't visible on the union. Reading through
// KindDef puts them back.
function def(type: EntryType): KindDef {
  return KINDS[type];
}

// Where you eat has a cuisine; what you cook is already named by the dish,
// and an activity isn't a cuisine at all.
export function hasCuisine(type: EntryType): boolean {
  return def(type).cuisine === true;
}

export function hasCook(type: EntryType): boolean {
  return def(type).cook === true;
}

// Everything the two halves of the book say differently, in one table, so
// that one component can render either side.
export const DOMAIN_COPY: Record<
  Domain,
  {
    name: string; // the half's name in the switch
    wordmark: string;
    // The colour this half answers to, used to fill its side of the switch
    // so the two feel like different places rather than one page with the
    // heading swapped.
    hex: string;
    home: string;
    list: string;
    addHref: string;
    defaultKind: EntryType; // what a blank form starts on
    unit: [one: string, many: string];
    allLabel: string; // the "everything" filter
    listTitle: string;
    didIt: string; // the wishlist "we went" link
    addTitle: string;
    addCta: string;
    emptyMap: string;
    emptyList: string;
  }
> = {
  food: {
    name: "Food",
    wordmark: "Food Diary",
    hex: "#3E7B52",
    home: "/",
    list: "/list",
    addHref: "/add",
    defaultKind: "restaurant",
    unit: ["place", "places"],
    allLabel: "Everywhere",
    listTitle: "Want to try",
    didIt: "We went",
    addTitle: "Add a place",
    addCta: "Add a place",
    emptyMap: "No places yet",
    emptyList: "Nothing on the list yet",
  },
  activity: {
    name: "Activities",
    wordmark: "Things We Did",
    hex: "#6455A8",
    home: "/activities",
    list: "/activities/list",
    addHref: "/add?domain=activity",
    defaultKind: "outing",
    unit: ["thing", "things"],
    allLabel: "Everything",
    listTitle: "Want to do",
    didIt: "We did it",
    addTitle: "Add an outing",
    addCta: "Add an outing",
    emptyMap: "Nothing on the map yet",
    emptyList: "Nothing on the list yet",
  },
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
  // Optional: a pottery class or a meal cooked at home is a real entry, it
  // just isn't a pin. Entries without coordinates show up in the timeline
  // and the wishlist but never on the map.
  lat: number | null;
  lng: number | null;
  photos: string[];
  cook: Person | null;
  vanessaRating: number | null;
  vanessaReview: string | null;
  tudorRating: number | null;
  tudorReview: string | null;
}

// An entry that has somewhere to be drawn. Narrowing with this once, at the
// top of the map code, is what keeps every Leaflet call site below it free
// of null checks.
export type Located = Entry & { lat: number; lng: number };

export function hasLocation(entry: Entry): entry is Located {
  return entry.lat !== null && entry.lng !== null;
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
