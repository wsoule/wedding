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
      <div className="border-t border-lichen">
        {faqs.map((f) => (
          <details key={f.id} className="group border-b border-lichen">
            <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 py-3 font-serif text-[1.45rem] leading-snug [&::-webkit-details-marker]:hidden">
              {f.question}
              <span className="relative h-3.5 w-3.5 shrink-0 text-fern" aria-hidden="true">
                <span className="absolute top-1/2 left-0 h-px w-3.5 bg-current" />
                <span className="absolute top-0 left-1/2 h-3.5 w-px bg-current transition duration-300 group-open:rotate-90 group-open:opacity-0" />
              </span>
            </summary>
            <p className="pb-5 whitespace-pre-line text-moss-soft">{f.answer}</p>
          </details>
        ))}
      </div>
    </>
  );
}
