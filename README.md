# Food Diary

Every café, restaurant and home-cooked meal, on a map, with what each of us
thought of it. Cambridge now, London later, anywhere else after that.

## How it works

- **Map** (`/`) — the homepage. Every place we've eaten is a pin, coloured by
  kind. Zoomed out you get one marker per city with a count; zoom past level 9
  and the individual places separate. The rail down the left switches between
  everywhere, cafés, restaurants and home-cooked. The strip along the bottom
  is the same set as cards — click either a pin or a card and its detail card
  opens with the cover photo and both our scores.
- **Entry** (`/entry/[id]`) — the whole thing: photos, both ratings out of 10
  and both write-ups side by side. Either half can be written or edited at any
  time. **Edit entry** goes to `/entry/[id]/edit` for the place itself — name,
  kind, date, location, photos — and holds the delete button.
- **Add** (`/add`) — a new place: what, when, where (search or click the map),
  photos, and a first verdict from whichever of us is writing.
- **Want to try** (`/list`) — the wishlist. Cafés, restaurants and dishes we
  haven't got to yet, grouped by kind. "We went" carries the item across to
  `/add` prefilled, and it moves to the *Been* section afterwards.

Three kinds of place, each in its own colour: cafés olive, restaurants
terracotta, home-cooked sand.

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
3. **Storage tab → add a Blob store.** This is where photos go. Vercel adds
   `BLOB_READ_WRITE_TOKEN` automatically.
4. Deploy. Both tables are created automatically on first use.

### Loading the starting wishlist

`data/seed-bucket.json` holds twelve places and dishes to start with. To load
them:

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
compiles fine but every page throws when it tries to query.

## Project structure

```
app/
  page.tsx                  Map — the homepage
  add/page.tsx              Add a place
  entry/[id]/page.tsx       One place, both write-ups
  entry/[id]/edit/page.tsx  Edit the place, or delete it
  list/page.tsx             Want to try
  actions.ts                All server actions
  components/
    Nav, MapView, CategoryRail, Pin, PlaceCard, PlaceDetail
    EntryForm, ReviewForm, WhoPicker, DeleteEntry
    LocationPicker, PhotoUploader, AddPhotos, AddBucketForm
lib/
  db.ts                     Postgres queries
  types.ts                  Shared types, labels, colours
scripts/seed.mjs            Loads the starting wishlist
data/seed-bucket.json       The twelve starting items
```
