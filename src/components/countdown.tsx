"use client";

import { useEffect, useState } from "react";

function daysUntil(iso: string) {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

export function Countdown({ to }: { to: string }) {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setDays(daysUntil(to));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [to]);

  // Rendered after mount so the server and phone never disagree about "today".
  if (days === null) return <p className="h-7" aria-hidden="true" />;
  if (days < 0) return <p className="text-moss-soft">We’re married. Thank you for celebrating with us.</p>;
  if (days === 0) return <p className="text-lg text-fern-dark">Today’s the day.</p>;
  return (
    <p className="text-moss-soft">
      <span className="font-serif text-2xl text-fern-dark">{days}</span> {days === 1 ? "day" : "days"} to go
    </p>
  );
}
