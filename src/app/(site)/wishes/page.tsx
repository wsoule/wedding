import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { PageHeader } from "@/components/page-header";
import { Print } from "@/components/print";
import { getWishes } from "@/lib/data";

export const metadata: Metadata = { title: "Well wishes" };

export default async function WishesPage() {
  await connection();
  const wishes = await getWishes();

  return (
    <>
      <PageHeader title="Well wishes" intro="Notes from the people we love, shared when they RSVP'd." />
      {wishes.length === 0 ? (
        <div className="text-center">
          <p className="text-moss-soft">No notes yet. Leave one when you RSVP.</p>
          <Link href="/rsvp" className="btn btn-primary mt-6">
            RSVP
          </Link>
        </div>
      ) : (
        <ul className="columns-1 gap-5 min-[480px]:columns-2">
          {wishes.map((w, i) => (
            <li key={w.id} className="mb-6 break-inside-avoid">
              <Print tilt={[-1.5, 1, 2, -1][i % 4]} tape={i % 3 === 0} innerClassName="px-5 pt-6 pb-4">
                <p className="font-serif text-[1.35rem] leading-snug whitespace-pre-line">{w.message}</p>
                <p className="mt-3 text-right font-serif text-lg italic text-foxglove-dark">{w.from}</p>
              </Print>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
