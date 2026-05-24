# Wedding Website

Next.js wedding site for Wyat & Jaden, ported from the high-fidelity prototype in `design/`.

## Local Development

```bash
bun install
bun run dev
```

Set `DATABASE_URL` before testing real RSVP submissions:

```bash
cp .env.example .env.local
bun run db:migrate
```

## Database

Drizzle ORM is configured for PostgreSQL.

```bash
bun run db:generate
bun run db:migrate
```

RSVP submissions post to `/api/rsvp` and upsert by guest email.

## Railway

The app includes `railway.json`. Railway builds with `bun run build` and starts with:

```bash
bun run db:migrate && bun run start
```

After creating the Railway project and adding a PostgreSQL database, set `DATABASE_URL`, then link and deploy with the Railway CLI:

```bash
railway link
bun run railway:deploy
```
