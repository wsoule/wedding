import type { Metadata } from "next";
import { connection } from "next/server";
import { PageHeader } from "@/components/page-header";
import { getRegistry } from "@/lib/data";

export const metadata: Metadata = { title: "Registry" };

export default async function RegistryPage() {
  await connection();
  const links = await getRegistry();

  return (
    <>
      <PageHeader title="Registry" intro="Having you there is the gift. If you'd like to give something more, here's where." />
      {links.length === 0 ? (
        <p className="text-moss-soft">Our registry is coming soon.</p>
      ) : (
        <ul className="space-y-3">
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-lichen transition active:scale-[0.98]"
              >
                <span className="flex-1">
                  <span className="block font-serif text-xl text-fern-dark">{l.title}</span>
                  {l.blurb && <span className="text-moss-soft">{l.blurb}</span>}
                </span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0 text-sage" aria-hidden="true">
                  <path d="M14 5h5v5M19 5l-8 8M17 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
