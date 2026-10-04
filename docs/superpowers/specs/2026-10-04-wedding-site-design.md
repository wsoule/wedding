# Wyat & Jaden wedding site — design

May 22, 2027 · Little Flower Barn, 565 N. Coldwater Road, Lake Isabella, MI 48893.

## Goal

One mobile-first site that is the one stop shop for guests: a single QR code on
every invite opens a tap-through RSVP, and the rest of the site covers the
schedule, location, travel and hotels, registry, dress code and FAQ. Floral and
green.

## Decisions

| Topic | Decision |
| --- | --- |
| Stack | Next.js 16 (App Router), TypeScript, Tailwind v4, Drizzle + Postgres, Railway |
| Guest list | Import from Google Sheet (CSV) once, then edit in admin |
| QR | One QR for everyone, pointing at `/rsvp` |
| Lookup | Type 3+ letters of a first, last or nickname; matching parties appear. No browsable list. |
| Parties | A party holds guests. Guests can be children or `+1` placeholders whose name the RSVPer fills in. |
| Meals | Off by default; admin can enable and set adult and kids' options |
| Content | Schedule, hotels, registry, FAQ editable in admin. Names, date, venue, dress code, airports in `src/content/site.ts`. |
| Admin auth | One shared password (`ADMIN_PASSWORD`), HMAC-signed cookie |
| After RSVP | Thank-you screen with add-to-calendar; email to the couple via Resend (skipped if not configured) |
| Deadline | Optional admin setting; after it the RSVP shows a closed message |

## Data model

- `parties`: name, mailing address, table number, notes (admin), message + song (from guest), responded_at.
- `guests`: party_id, first/last name, nickname, is_child, is_placeholder, attending (null/true/false), meal, dietary, sort_order.
- `settings` (one row): meal_choice_enabled, adult/kid meal options, rsvp_deadline, notify_emails.
- `schedule_items`, `hotels`, `registry_links`, `faqs`: content with `sort_order`.

RSVP answers live on `guests`; the party is the unit of RSVP.

## Guest pages

Bottom tab bar: Home, Details, RSVP (center), Travel, Registry. FAQ is linked
from Home and Details.

- `/` hero, countdown, RSVP call to action, tiles to every section.
- `/rsvp` step flow: find name → confirm party → who's coming (+1 name) → meals
  and dietary → note and song → review → done. A party that already replied sees
  its answers and can change them until the deadline.
- `/details` schedule, venue with map and directions, add to calendar, dress code.
- `/travel` hotels, airports, driving notes.
- `/registry`, `/faq`.

## Admin (`/admin`)

- Dashboard: invited, attending (adults/kids), declined, awaiting, meal counts,
  recent replies, CSV export.
- Guests: search and filter parties, create/edit parties, add/edit/remove/move
  guests, set child or +1, override answers.
- Import: paste or upload CSV, preview, then import.
- Content: CRUD + reorder for schedule, hotels, registry, FAQ.
- Settings: meals, deadline, notification emails, QR code download.

## Visual design

Green-tinted paper `#EDF2E6`, moss ink `#1E3626`, fern `#4D7A48`, lichen
`#C7D7B0`, foxglove `#D9839B`, buttercup `#E9C35A`. Young Serif headings,
Figtree body. A single column (max ~34rem) even on desktop, with botanical line
art in the margins. The one bold moment: the RSVP progress vine grows a leaf
per step and blooms on submit.

## Security

Every admin server action calls `requireAdmin()`; `proxy.ts` only does the
optimistic redirect. RSVP submit verifies that every guest id belongs to the
party being answered. Name search requires 3+ characters and returns at most 6
parties.

## Testing

Vitest unit tests for name matching, CSV parsing, and RSVP validation. Manual
end-to-end run against local Postgres.
