import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { getPartiesWithGuests } from "@/lib/data";
import { guestName, matchesQuery } from "@/lib/names";
import { createParty } from "../../actions";

export const metadata: Metadata = { title: "Guests" };

const filters = [
  { key: "all", label: "All" },
  { key: "waiting", label: "No answer" },
  { key: "replied", label: "Replied" },
] as const;

export default async function GuestsPage({ searchParams }: PageProps<"/admin/guests">) {
  await connection();
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const filter = typeof params.show === "string" ? params.show : "all";

  let list = await getPartiesWithGuests();
  if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.guests.some((g) => matchesQuery(g, q)));
  if (filter === "waiting") list = list.filter((p) => !p.respondedAt);
  if (filter === "replied") list = list.filter((p) => p.respondedAt);

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-[1.75rem]">Guests</h1>
        <Link href="/admin/guests/import" className="text-sm font-semibold text-fern-dark underline underline-offset-4">
          Import from a sheet
        </Link>
      </div>

      <form className="mt-4 flex gap-2" role="search">
        <input type="search" name="q" defaultValue={q} placeholder="Search names" className="field" aria-label="Search names" />
        {filter !== "all" && <input type="hidden" name="show" value={filter} />}
        <button className="btn btn-quiet shrink-0">Search</button>
      </form>

      <nav className="mt-3 flex gap-2" aria-label="Filter">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={{ query: { ...(q ? { q } : {}), ...(f.key === "all" ? {} : { show: f.key }) } }}
            aria-current={filter === f.key ? "true" : undefined}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ${
              filter === f.key ? "bg-fern text-card ring-fern" : "bg-card ring-lichen"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <p className="mt-4 text-sm text-moss-soft">
        {list.length} {list.length === 1 ? "invitation" : "invitations"}, {list.reduce((n, p) => n + p.guests.length, 0)} people
      </p>
      <ul className="mt-2 divide-y divide-lichen rounded-2xl bg-card ring-1 ring-lichen">
        {list.map((p) => {
          const coming = p.guests.filter((g) => g.attending).length;
          return (
            <li key={p.id}>
              <Link href={`/admin/guests/${p.id}`} className="flex items-center gap-3 px-4 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{p.name}</span>
                  <span className="block truncate text-sm text-moss-soft">
                    {p.guests.map((g) => (g.isPlaceholder && !g.firstName ? "+1" : guestName(g))).join(", ") || "No guests yet"}
                  </span>
                </span>
                <Status replied={!!p.respondedAt} coming={coming} />
              </Link>
            </li>
          );
        })}
        {list.length === 0 && <li className="px-4 py-6 text-center text-moss-soft">No invitations match.</li>}
      </ul>

      <section className="mt-10 rounded-2xl bg-card p-4 ring-1 ring-lichen">
        <h2 className="text-xl">Add an invitation</h2>
        <p className="text-sm text-moss-soft">Start with a name for the party and the first guest. Add more people on the next screen.</p>
        <form action={createParty} className="mt-3 space-y-2">
          <input name="name" required placeholder="Party name, e.g. The Carter family" className="field" aria-label="Party name" />
          <div className="grid grid-cols-2 gap-2">
            <input name="firstName" placeholder="First name" className="field" aria-label="First guest's first name" />
            <input name="lastName" placeholder="Last name" className="field" aria-label="First guest's last name" />
          </div>
          <button className="btn btn-primary w-full">Add invitation</button>
        </form>
      </section>
    </>
  );
}

function Status({ replied, coming }: { replied: boolean; coming: number }) {
  if (!replied) return <span className="shrink-0 rounded-full bg-buttercup/30 px-2.5 py-1 text-xs font-medium">Waiting</span>;
  if (coming === 0) return <span className="shrink-0 rounded-full bg-paper-deep px-2.5 py-1 text-xs font-medium">Declined</span>;
  return <span className="shrink-0 rounded-full bg-lichen px-2.5 py-1 text-xs font-medium text-fern-dark">{coming} coming</span>;
}
