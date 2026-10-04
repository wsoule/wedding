import { Sprig } from "./botanicals";

export function PageHeader({ title, intro }: { title: string; intro?: string }) {
  return (
    <header className="relative pt-16 pb-6">
      <Sprig className="absolute top-3 right-0 w-28 opacity-85" />
      <h1 className="text-[2.5rem]">{title}</h1>
      {intro && <p className="mt-2 max-w-[28ch] text-moss-soft">{intro}</p>}
    </header>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-12 mb-4 text-2xl text-fern-dark">{children}</h2>;
}
