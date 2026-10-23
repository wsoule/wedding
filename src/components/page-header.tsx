import type { CSSProperties } from "react";
import { Sprig } from "./botanicals";

const at = (s: number) => ({ "--at": `${s}s` }) as CSSProperties;

export function PageHeader({ title, intro }: { title: string; intro?: string }) {
  return (
    <header className="pt-10 pb-8 text-center">
      <Sprig animate className="mx-auto mb-3 w-28" />
      <h1 className="rise text-[2.9rem]" style={at(0.2)}>
        {title}
      </h1>
      {intro && (
        <p className="rise mx-auto mt-3 max-w-[30ch] text-moss-soft" style={at(0.35)}>
          {intro}
        </p>
      )}
    </header>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-14 mb-5 text-center text-[2rem] text-fern-dark">{children}</h2>;
}
