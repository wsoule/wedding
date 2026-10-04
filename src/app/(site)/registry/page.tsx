import type { Metadata } from "next";
import { connection } from "next/server";
import { PageHeader } from "@/components/page-header";
import { Print } from "@/components/print";
import { getRegistry } from "@/lib/data";

export const metadata: Metadata = { title: "Registry" };

export default async function RegistryPage() {
  await connection();
  const links = await getRegistry();

  return (
    <>
      <PageHeader title="Registry" intro="Having you there is the gift. If you'd like to give something more, here's where." />
      {links.length === 0 ? (
        <p className="text-center text-moss-soft">Our registry is coming soon.</p>
      ) : (
        <ul className="space-y-8">
          {links.map((l, i) => (
            <li key={l.id}>
              <Print tilt={i % 2 ? 1.2 : -1.2} tape innerClassName="p-0">
                <a href={l.url} target="_blank" rel="noreferrer" className="block px-6 py-7 text-center">
                  <span className="block font-serif text-[2rem] leading-none">{l.title}</span>
                  {l.blurb && <span className="mt-2 block text-moss-soft">{l.blurb}</span>}
                  <span className="mt-4 inline-block border-b border-fern pb-0.5 text-sm font-medium text-fern-dark">Visit {l.title}</span>
                </a>
              </Print>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
