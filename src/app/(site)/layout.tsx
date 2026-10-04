import { BottomNav } from "@/components/bottom-nav";
import { Fern } from "@/components/botanicals";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Margin ferns for wide screens; the site itself stays phone-width. */}
      <Fern className="pointer-events-none fixed bottom-0 left-[max(1rem,calc(50%-34rem))] hidden h-[70vh] text-sage/70 lg:block" />
      <Fern className="pointer-events-none fixed bottom-0 right-[max(1rem,calc(50%-34rem))] hidden h-[70vh] -scale-x-100 text-sage/70 lg:block" />
      <main className="relative mx-auto max-w-[34rem] px-5 pb-32">{children}</main>
      <BottomNav />
    </>
  );
}
