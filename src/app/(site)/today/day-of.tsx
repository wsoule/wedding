"use client";

import { useEffect, useState } from "react";
import { nowAndNext } from "@/lib/schedule";
import { findTable } from "./actions";

type Item = { id: string; time: string; title: string; details: string | null };

const detroitMinutes = () => {
  const [h, m] = new Intl.DateTimeFormat("en-US", { timeZone: "America/Detroit", hour: "numeric", minute: "numeric", hourCycle: "h23" })
    .format(new Date())
    .split(":")
    .map(Number);
  return h * 60 + m;
};

export function NowNext({ items }: { items: Item[] }) {
  const [minutes, setMinutes] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setMinutes(detroitMinutes());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  if (minutes === null) return <div className="h-40" aria-hidden="true" />;
  const { now, next } = nowAndNext(items, minutes);

  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: "Now", item: now, fallback: "Getting ready" },
        { label: "Next", item: next, fallback: "That's a wrap" },
      ].map(({ label, item, fallback }, i) => (
        <div key={label} className="print px-3 py-5 text-center" style={{ rotate: i ? "1.5deg" : "-1.5deg" }}>
          <p className="text-sm text-moss-soft">{label}</p>
          <p className="mt-1 font-serif text-2xl leading-tight">{item?.title ?? fallback}</p>
          {item && <p className="mt-1 font-serif text-lg italic text-foxglove-dark">{item.time}</p>}
        </div>
      ))}
    </div>
  );
}

export function FindTable() {
  const [name, setName] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof findTable>> | null>(null);
  const [busy, setBusy] = useState(false);

  async function look(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(await findTable(name));
    setBusy(false);
  }

  return (
    <form onSubmit={look}>
      <div className="flex gap-2">
        <input
          className="field"
          placeholder="First and last name"
          aria-label="Your first and last name"
          autoComplete="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setResult(null);
          }}
        />
        <button className="btn btn-primary shrink-0" disabled={busy || name.trim().split(/\s+/).length < 2}>
          Find
        </button>
      </div>
      <div aria-live="polite">
        {result?.found === false && <p className="mt-3 text-center text-moss-soft">We couldn&rsquo;t find that name. Try the name on your invitation, or ask anyone in the wedding party.</p>}
        {result?.found && (
          <div className="print rise mx-auto mt-5 max-w-[15rem] py-6 text-center" style={{ rotate: "-1.5deg" }}>
            {result.table ? (
              <>
                <p className="text-sm text-moss-soft">You&rsquo;re at table</p>
                <p className="font-serif text-[4.5rem] leading-none text-foxglove-dark">{result.table}</p>
              </>
            ) : (
              <p className="mt-2 font-serif text-xl">Sit anywhere you like!</p>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
