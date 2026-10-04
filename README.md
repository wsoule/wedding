# Wyat & Jaden wedding site

A mobile-first wedding site: one QR code on the invitations opens a tap-through
RSVP, and the rest of the site covers the schedule, venue, travel, registry and
FAQ. There's a password-protected admin at `/admin` for the guest list, RSVPs,
content and settings. The design spec is in
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
| Schedule, hotels, registry, FAQ | Edited in `/admin/content` |
| Guest list and RSVPs | `/admin/guests` |
| Meal choice, RSVP deadline, notification emails, QR code | `/admin/settings` |
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

`bun run start` applies migrations before starting. After the first deploy, run
`bun run db:seed` once (without `--demo`) to load the starter content.
