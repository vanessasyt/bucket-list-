# Our Diary

Every café, restaurant and home-cooked meal, and everything else we did — on a
map, with what each of us thought of it. Cambridge now, London later, anywhere
else after that.

## Two halves, one book

The diary has a food half and an activity half. They're the same app with a
different set of kinds: same map, same wishlist, same two-person reviews. A tab
tucked against the right edge of the screen flips between them.

| | Food | Activities |
|---|---|---|
| Map | `/` | `/activities` |
| Wishlist | `/list` | `/activities/list` |
| Kinds | cafés, restaurants, home cooked | punting, bouldering, pottery, walks, days out |
| Cuisine field | yes | no |

Food keeps the root so nothing bookmarked breaks. `/entry/[id]` serves both
halves — an entry's kind is what says which half it belongs to, and the nav
and back links follow from that.

## How it works

- **Map** — the homepage of each half. Everything with a location is a pin,
  coloured by score with the kind as the glyph inside. Zoomed out you get one
  marker per city with a count; zoom past level 9 and they separate. The bar
  along the bottom filters by kind. Clicking a pin opens a card with the cover
  photo and both our scores. **Entries without a location don't appear here** —
  the panel top-left says how many are missing, and they're all in the list.
- **Entry** (`/entry/[id]`) — the whole thing: photos, both ratings out of 10
  and both write-ups side by side. Either half can be written or edited at any
  time. **Edit entry** goes to `/entry/[id]/edit` — name, kind, date, location,
  photos — and holds the delete button.
- **Add** (`/add`, or `/add?domain=activity`) — what, when, optionally where,
  photos, and a first verdict from whichever of us is writing.
- **Wishlist** — things we haven't got to yet, grouped by kind. "We went" /
  "We did it" carries the item across to `/add` prefilled, and it moves to the
  *Been* / *Done* section afterwards.

### Adding a new kind

Everything about a kind — which half it's in, its labels, its colour, its map
icon, whether it has a cuisine field — lives in one entry in the `KINDS`
registry in `lib/types.ts`. Add an object there and the union type, the
filters, the wishlist groups and the pins all follow. The only other edit is
the matching colour token in `tailwind.config.ts`.

Do **not** name a kind `activity` — a much older version of this app wrote rows
with that type, and they're deliberately invisible because no kind claims it.

### Location is optional

An evening class or a meal cooked at home doesn't belong on a map, so `lat` and
`lng` are nullable. Entries without them appear in the timeline and the
wishlist but never on the map, and the location picker has a **Clear** button
for taking a location back off.

## There are no passwords

Whoever is writing picks their name — Vanessa or Tudor — and that choice
decides which half of a review gets written. The choice is remembered in the
browser, so you pick it once per device.

This means anyone with the link can add, edit and delete entries. That's the
trade for never logging in. Keep the URL to yourselves, and note that the
delete button on the edit page really does remove a place, its photos and both
write-ups for good — which is why it asks twice.

## Setup

```bash
npm install
```

### Deploying to Vercel

1. Push this to a GitHub repository and import it in Vercel.
2. **Storage tab → add a Postgres database.** Connect it to the project.
   Confirm an environment variable named exactly `DATABASE_URL` exists under
   Settings → Environment Variables, with Production ticked. Some Postgres
   integrations name it something else (e.g. `STORAGE_2_DATABASE_URL`) — if
   so, copy its value into a new variable named `DATABASE_URL`.
3. **Storage tab → add a Blob store.** Connect it to the project, the same
   way as the database. This provides `BLOB_READ_WRITE_TOKEN`. Without it
   every photo upload fails; the rest of the app works fine.
4. Deploy. The tables are created automatically on first use.

Note that both storage tokens are injected **at build time**. Connecting a
store does not rebuild anything, so a deployment that was already running
when you connected it never receives the variable — you have to redeploy
before it takes effect. If uploads fail with a blob-token message, check
Settings → Environment Variables for `BLOB_READ_WRITE_TOKEN` first, then
check that the current production deployment is newer than it.

Photos go to the Blob store and the entry keeps the public URL it returns.
Photos added before that change are still rows in the `photos` table with
`/api/photo/[id]` URLs, and that route stays in place so they keep loading —
the two kinds of URL sit side by side. The browser shrinks each photo to
1600px on its longest edge before uploading, which keeps a typical photo in
the low hundreds of kilobytes.

### Loading the starting wishlist

`data/seed-bucket.json` holds seventeen things to start with — twelve places
and dishes, plus five activities. Each lands on its own half's wishlist
according to its `type`. To load them:

```bash
npx vercel link
npx vercel env pull .env.local
```

Then check `.env.local` actually contains a line beginning `DATABASE_URL=`.
If it doesn't (Vercel only pulls development-scoped variables), add it by
hand — copy the value from your database's dashboard. Then:

```bash
node --env-file=.env.local scripts/seed.mjs
```

Safe to re-run: items are matched on title and city, so nothing duplicates.

### Running it locally

`npm run dev`, with the same `.env.local`. Without a `DATABASE_URL` the app
compiles fine but every page throws when it tries to query. Without a
`BLOB_READ_WRITE_TOKEN` everything works except adding photos, which fails
with a message saying the token is missing — uploads go to the real Blob
store even in development, so there is no local-only fallback.

## Project structure

```
app/
  page.tsx                  Food map — the homepage
  activities/page.tsx       Activity map
  list/page.tsx             Want to try
  activities/list/page.tsx  Want to do
  add/page.tsx              Add an entry to either half
  entry/[id]/page.tsx       One entry, both write-ups
  entry/[id]/edit/page.tsx  Edit it, or delete it
  actions.ts                All server actions
  components/
    DiaryMap, WishlistPage  One half of the book, either one
    BookFlip                The tab that turns the page
    Nav, MapView, CategoryBar, Pin, PlaceDetail, Timeline
    EntryForm, ReviewForm, WhoPicker, DeleteEntry
    LocationPicker, PhotoUploader, AddPhotos
    AddBucketForm, BucketRow
lib/
  db.ts                     Postgres queries
  types.ts                  KINDS registry, shared types, colours
scripts/seed.mjs            Loads the starting wishlist
data/seed-bucket.json       The twelve starting items
```
