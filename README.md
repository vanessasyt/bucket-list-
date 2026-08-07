# Tudor & Vanessa — Passport

A shared record of things you've done together, kept as passport stamps on a
map. Cambridge now, London from September, anywhere else later.

## How it works

- **Map** (`/`) — every logged entry is a stamp pinned where it happened.
  Zoomed out you see one stamp per city; zoom past level 9 and individual
  stamps appear. Click a stamp to open it.
- **List** (`/list`) — the bucket list. Undone things at the top, grouped by
  kind. Press "We did it" to log one; it then moves to the stamped section.
  Add new items any time.
- **Log** (`/add`) — record an entry: what, when, where (click the map or
  search a place), photos, and your own rating and write-up.
- **Entry** (`/entry/[id]`) — both write-ups side by side. You can only edit
  your own half; the other person adds theirs when they're ready.

Three kinds of stamp, each in its own ink and shape: activities print violet
in a circle, restaurants teal in a rectangle, home-cooked meals vermilion with
a double border.

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
4. Add three more environment variables under Settings:
   - `VANESSA_PASSWORD` — Vanessa's password
   - `TUDOR_PASSWORD` — Tudor's password
   - `AUTH_SECRET` — any long random string; it signs the login cookie
5. Deploy. Both tables are created automatically on first use.

### Loading the starting bucket list

`data/seed-bucket.json` holds the 27 starting items. To load them:

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

## A note on the login

Two passwords, one each, stored as environment variables and checked against
a signed cookie. That's enough to keep strangers out of a private two-person
app and to make sure each of you can only write your own half of a review.
It is not designed to protect anything sensitive.

## Project structure

```
app/
  page.tsx                 Map
  list/page.tsx            Bucket list
  add/page.tsx             Log an entry
  entry/[id]/page.tsx      One entry, both write-ups
  login/page.tsx           Two-person login
  actions.ts               All server actions
  components/              Stamp, MapView, LocationPicker, forms
lib/
  db.ts                    Postgres queries
  auth.ts                  Password check and signed session cookie
  types.ts                 Shared types, labels, stamp inks
scripts/seed.mjs           Loads the starting bucket list
data/seed-bucket.json      The 27 starting items
```
