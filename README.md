# Jaden & Wyat wedding site

A mobile-first wedding site built around photobooth strips: one QR code on the
invitations opens a tap-through RSVP (first name, then a last-name check), and
the rest of the site covers our story, the wedding party, the schedule and
venue, travel, the registry, a guest photobooth and album, a well-wishes wall
and FAQ. On the wedding day it switches to a "Today" page with what's
happening now and a find-your-table lookup. There's a password-protected admin
at `/admin` for the guest list, RSVPs, content, photos, song requests, notes
and settings. The design spec is in
`docs/superpowers/specs/2026-10-04-wedding-site-design.md`.

## Local development

```bash
bun install
cp .env.example .env.local   # then fill it in
createdb wedding_dev
bun run db:migrate
bun run db:seed -- --demo    # content, plus three fake parties to test with
bun run dev
```

`bun run test` runs the unit tests (name search, sheet import, RSVP rules,
admin sessions).

## Where things live

| What | Where |
| --- | --- |
| Names, date, venue, dress code, airports | `src/content/site.ts` |
| Schedule, story, wedding party, hotels, registry, FAQ | Edited in `/admin/content` |
| Home page layout (one scrolling page) | `src/app/page.tsx`, `src/components/classic/`, `src/app/classic.css` |
| Home page gallery photos, guest album | `/admin/photos` (the "home page strip" photos fill the gallery) |
| Song requests for the DJ, well-wishes moderation | `/admin/notes` |
| Guest list and RSVPs | `/admin/guests` |
| Meal choice, RSVP deadline, notification emails, wedding day mode, QR code | `/admin/settings` |
| Database schema | `src/db/schema.ts` (then `bun run db:generate`) |

## Importing the guest list

In Google Sheets, select all cells including the header row, copy, and paste
into `/admin/guests/import` (or download as CSV and upload). Recognized
columns: Party, First name, Last name (or a single Name), Nickname, Child,
Plus one, Address. Rows with the same Party are grouped into one invitation.
Parties that already exist by name are skipped, so re-importing is safe.

## Deploying on Railway

Set these variables on the service:

| Variable | Notes |
| --- | --- |
| `DATABASE_URL` | From the Railway Postgres plugin |
| `ADMIN_PASSWORD` | The shared admin password |
| `SESSION_SECRET` | `openssl rand -hex 32` |
| `NEXT_PUBLIC_SITE_URL` | The public URL; the QR code points at `<url>/rsvp` |
| `RESEND_API_KEY`, `EMAIL_FROM` | Optional, for RSVP notification emails |
| `S3_BUCKET`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Photo storage. Create a Railway bucket and copy its credentials. Without these, photos go to `./.uploads`, which Railway wipes on every deploy. |

`bun run start` applies migrations before starting. After the first deploy, run
`bun run db:seed` once (without `--demo`) to load the starter content.
