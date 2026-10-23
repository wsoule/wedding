import Link from "next/link";
import { connection } from "next/server";
import { getPartiesWithGuests, getSettings } from "@/lib/data";
import { guestName } from "@/lib/names";
import { summarize } from "@/lib/stats";

export default async function Overview() {
  await connection();
  const [all, settings] = await Promise.all([getPartiesWithGuests(), getSettings()]);
  const s = summarize(all);
  const recent = all
    .filter((p) => p.respondedAt)
    .sort((a, b) => b.respondedAt!.getTime() - a.respondedAt!.getTime())
    .slice(0, 8);

  return (
    <>
      <h1 className="sr-only">Overview</h1>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Coming" value={s.coming} detail={`${plural(s.comingAdults, "adult")}, ${plural(s.comingKids, "kid")}`} />
        <Stat label="Not coming" value={s.declined} />
        <Stat label="No answer yet" value={s.awaitingGuests} detail={plural(s.awaitingParties, "invitation")} />
        <Stat label="Invited" value={s.invited} detail={plural(s.parties, "invitation")} />
      </dl>

      {settings.mealChoiceEnabled && Object.keys(s.meals).length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xl">Meals</h2>
          <ul className="flex flex-wrap gap-2">
            {Object.entries(s.meals).map(([meal, n]) => (
              <li key={meal} className="rounded-full bg-card px-4 py-2 ring-1 ring-lichen">
                {meal} <span className="font-semibold">{n}</span>
              </li>
            ))}
            {s.comingWithoutMeal > 0 && (
              <li className="rounded-full bg-buttercup/30 px-4 py-2">
                No meal chosen <span className="font-semibold">{s.comingWithoutMeal}</span>
              </li>
            )}
          </ul>
        </section>
      )}

      {s.dietary.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xl">Dietary needs</h2>
          <ul className="divide-y divide-lichen rounded-2xl bg-card px-4 ring-1 ring-lichen">
            {s.dietary.map((d) => (
              <li key={d.id} className="py-2.5">
                <span className="font-medium">{d.name}</span>: {d.dietary}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xl">Latest replies</h2>
          <a href="/admin/export" className="text-sm font-semibold text-fern-dark underline underline-offset-4">
            Download CSV
          </a>
        </div>
        {recent.length === 0 ? (
          <p className="text-moss-soft">No replies yet.</p>
        ) : (
          <ul className="divide-y divide-lichen rounded-2xl bg-card ring-1 ring-lichen">
            {recent.map((p) => {
              const coming = p.guests.filter((g) => g.attending);
              return (
                <li key={p.id}>
                  <Link href={`/admin/guests/${p.id}`} className="block px-4 py-3">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="font-medium">{p.name}</span>
                      <span className="shrink-0 text-sm text-moss-soft">
                        {p.respondedAt!.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Detroit" })}
                      </span>
                    </span>
                    <span className="text-sm text-moss-soft">
                      {coming.length ? `Coming: ${coming.map(guestName).join(", ")}` : "Not coming"}
                    </span>
                    {p.message && <span className="mt-1 block text-sm italic">“{p.message}”</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {s.songs.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-xl">Song requests</h2>
          <ul className="list-inside list-disc space-y-1">
            {s.songs.map((song, i) => (
              <li key={i}>{song}</li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Stat({ label, value, detail }: { label: string; value: number; detail?: string }) {
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-lichen">
      <dt className="text-sm text-moss-soft">{label}</dt>
      <dd className="font-serif text-3xl text-fern-dark">{value}</dd>
      {detail && <dd className="text-xs text-moss-soft">{detail}</dd>}
    </div>
  );
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;
