import { connection } from "next/server";
import { SiteHeader } from "@/components/site-header";
import { getSettings, isDayOf } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const dayOf = isDayOf(await getSettings());
  return (
    <>
      <SiteHeader dayOf={dayOf} />
      <main className="relative mx-auto max-w-[36rem] overflow-x-clip px-5 pb-24">{children}</main>
      <footer className="pb-[max(2rem,env(safe-area-inset-bottom))] text-center font-serif text-lg italic text-moss-soft">
        Jaden &amp; Wyat, May 22, 2027
      </footer>
    </>
  );
}
