import type { Metadata } from "next";
import { connection } from "next/server";
import { PageHeader } from "@/components/page-header";
import { getFaqs } from "@/lib/data";

export const metadata: Metadata = { title: "Questions" };

export default async function FaqPage() {
  await connection();
  const faqs = await getFaqs();

  return (
    <>
      <PageHeader title="Questions" intro="Still wondering about something? Ask Jaden or Wyat." />
      <div className="divide-y divide-lichen border-y border-lichen">
        {faqs.map((f) => (
          <details key={f.id} className="group py-1">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-2 font-serif text-lg [&::-webkit-details-marker]:hidden">
              {f.question}
              <span className="relative h-4 w-4 shrink-0 text-fern" aria-hidden="true">
                <span className="absolute top-1/2 left-0 h-[1.5px] w-4 bg-current" />
                <span className="absolute top-0 left-1/2 h-4 w-[1.5px] bg-current transition group-open:rotate-90 group-open:opacity-0" />
              </span>
            </summary>
            <p className="pb-4 whitespace-pre-line text-moss-soft">{f.answer}</p>
          </details>
        ))}
      </div>
    </>
  );
}
