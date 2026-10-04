"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { calendarUrl, site } from "@/content/site";
import { loadParty, searchParties, submitRsvp, type LoadedParty, type PartyMatch } from "./actions";
import { Vine } from "./vine";

type Step = "find" | "hello" | "who" | "food" | "note" | "review" | "done";
const STEPS: Step[] = ["find", "hello", "who", "food", "note", "review"];

type Answer = {
  id: string;
  attending: boolean | null;
  firstName: string;
  lastName: string;
  meal: string;
  dietary: string;
};

export function RsvpFlow({ deadlineLabel }: { deadlineLabel: string | null }) {
  const [step, setStep] = useState<Step>("find");
  const [party, setParty] = useState<LoadedParty | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [message, setMessage] = useState("");
  const [song, setSong] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const top = useRef<HTMLDivElement>(null);

  const go = (next: Step) => {
    setError(null);
    setStep(next);
    top.current?.scrollIntoView({ block: "start" });
  };

  function choose(id: string) {
    startTransition(async () => {
      const p = await loadParty(id);
      if (!p) return setError("We couldn't open that invitation. Try searching again.");
      setParty(p);
      setAnswers(
        p.guests.map((g) => ({
          id: g.id,
          attending: g.attending,
          firstName: g.isPlaceholder ? g.firstName : "",
          lastName: g.isPlaceholder ? g.lastName : "",
          meal: g.meal ?? "",
          dietary: g.dietary ?? "",
        })),
      );
      setMessage(p.message ?? "");
      setSong(p.song ?? "");
      go("hello");
    });
  }

  const update = (id: string, patch: Partial<Answer>) =>
    setAnswers((as) => as.map((a) => (a.id === id ? { ...a, ...patch } : a)));

  const anyoneComing = answers.some((a) => a.attending);
  const mealsOn = !!party?.meals.enabled && (party.meals.adult.length > 0 || party.meals.kid.length > 0);

  function send() {
    if (!party) return;
    startTransition(async () => {
      const res = await submitRsvp(party.id, {
        guests: answers.map((a) => ({
          id: a.id,
          attending: !!a.attending,
          firstName: a.firstName,
          lastName: a.lastName,
          meal: a.meal || null,
          dietary: a.dietary,
        })),
        message,
        song,
      });
      if (!res.ok) return setError(res.error);
      go("done");
    });
  }

  const stepIndex = step === "done" ? STEPS.length : STEPS.indexOf(step);

  return (
    <div ref={top} className="flex min-h-dvh scroll-mt-0 flex-col">
      <header className="flex items-center justify-between gap-3 pt-[max(1rem,env(safe-area-inset-top))]">
        <Link href="/" className="-ml-2 rounded-full p-2 text-moss-soft" aria-label="Close RSVP and go to the home page">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </Link>
        <Vine step={stepIndex} total={STEPS.length} bloomed={step === "done"} />
        <span className="w-10" />
      </header>

      <div key={step} className="flex flex-1 flex-col pt-8 motion-safe:animate-[rise_350ms_ease-out]">
        {step === "find" && <Find onChoose={choose} pending={pending} deadlineLabel={deadlineLabel} />}

        {step === "hello" && party && (
          <Hello
            party={party}
            onBack={() => go("find")}
            onNext={() => go("who")}
          />
        )}

        {step === "who" && party && (
          <Panel
            title="Who's coming?"
            hint="Let us know for each person."
            onBack={() => go("hello")}
            next={{
              label: "Continue",
              disabled: answers.some((a) => a.attending === null),
              onClick: () => {
                const missing = party.guests.find(
                  (g) => g.isPlaceholder && answers.find((a) => a.id === g.id)?.attending && !answers.find((a) => a.id === g.id)?.firstName.trim(),
                );
                if (missing) return setError("Add your guest's first name, or tap No.");
                go(anyoneComing ? "food" : "note");
              },
            }}
            error={error}
          >
            <ul className="space-y-3">
              {party.guests.map((g) => {
                const a = answers.find((x) => x.id === g.id)!;
                return (
                  <li key={g.id} className="rounded-2xl bg-card p-4 ring-1 ring-lichen">
                    <p className="font-serif text-xl">
                      {g.isPlaceholder ? "Bringing a guest?" : `${g.firstName} ${g.lastName}`.trim()}
                      {g.isChild && <span className="ml-2 align-middle font-sans text-sm text-moss-soft">child</span>}
                    </p>
                    <YesNo
                      value={a.attending}
                      yes={g.isPlaceholder ? "Yes" : "Coming"}
                      no={g.isPlaceholder ? "No" : "Can't make it"}
                      onChange={(v) => update(g.id, { attending: v })}
                    />
                    {g.isPlaceholder && a.attending && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <input
                          className="field"
                          placeholder="First name"
                          autoComplete="off"
                          aria-label="Guest's first name"
                          value={a.firstName}
                          onChange={(e) => update(g.id, { firstName: e.target.value })}
                        />
                        <input
                          className="field"
                          placeholder="Last name"
                          autoComplete="off"
                          aria-label="Guest's last name"
                          value={a.lastName}
                          onChange={(e) => update(g.id, { lastName: e.target.value })}
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </Panel>
        )}

        {step === "food" && party && (
          <Panel
            title={mealsOn ? "Dinner" : "Any food allergies?"}
            hint={mealsOn ? "Choose a meal for each person." : "Leave blank if there's nothing we need to know."}
            onBack={() => go("who")}
            next={{
              label: "Continue",
              disabled:
                mealsOn &&
                answers.some((a) => {
                  if (!a.attending) return false;
                  const g = party.guests.find((x) => x.id === a.id)!;
                  const opts = g.isChild ? party.meals.kid : party.meals.adult;
                  return opts.length > 0 && !a.meal;
                }),
              onClick: () => go("note"),
            }}
            error={error}
          >
            <ul className="space-y-3">
              {party.guests.map((g) => {
                const a = answers.find((x) => x.id === g.id)!;
                if (!a.attending) return null;
                const opts = g.isChild ? party.meals.kid : party.meals.adult;
                const name = g.isPlaceholder ? a.firstName : g.firstName;
                return (
                  <li key={g.id} className="rounded-2xl bg-card p-4 ring-1 ring-lichen">
                    <p className="font-serif text-xl">{name}</p>
                    {mealsOn && opts.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={`Meal for ${name}`}>
                        {opts.map((o) => (
                          <button
                            key={o}
                            type="button"
                            role="radio"
                            aria-checked={a.meal === o}
                            onClick={() => update(g.id, { meal: o })}
                            className={`min-h-11 rounded-full px-4 text-[0.95rem] font-medium ring-1 transition ${
                              a.meal === o ? "bg-fern text-card ring-fern" : "bg-paper text-moss ring-lichen"
                            }`}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    )}
                    <input
                      className="field mt-3"
                      placeholder="Allergies or dietary needs"
                      aria-label={`Allergies or dietary needs for ${name}`}
                      value={a.dietary}
                      onChange={(e) => update(g.id, { dietary: e.target.value })}
                    />
                  </li>
                );
              })}
            </ul>
          </Panel>
        )}

        {step === "note" && (
          <Panel
            title={anyoneComing ? "Anything else?" : "We'll miss you"}
            hint="Both are optional."
            onBack={() => go(anyoneComing ? "food" : "who")}
            next={{ label: "Review", onClick: () => go("review") }}
            error={error}
          >
            <div className="space-y-4">
              {anyoneComing && (
                <label className="block">
                  <span className="mb-1.5 block font-medium">A song that will get you dancing</span>
                  <input className="field" value={song} onChange={(e) => setSong(e.target.value)} placeholder="Song and artist" />
                </label>
              )}
              <label className="block">
                <span className="mb-1.5 block font-medium">A note for {site.couple[0]} & {site.couple[1]}</span>
                <textarea className="field min-h-32 resize-none" value={message} onChange={(e) => setMessage(e.target.value)} />
              </label>
            </div>
          </Panel>
        )}

        {step === "review" && party && (
          <Panel
            title="Look right?"
            onBack={() => go("note")}
            next={{ label: pending ? "Sending…" : "Send RSVP", disabled: pending, onClick: send }}
            error={error}
          >
            <ul className="divide-y divide-lichen rounded-2xl bg-card px-4 ring-1 ring-lichen">
              {party.guests.map((g) => {
                const a = answers.find((x) => x.id === g.id)!;
                const name = g.isPlaceholder ? (a.attending ? `${a.firstName} ${a.lastName}`.trim() : "Guest") : `${g.firstName} ${g.lastName}`.trim();
                return (
                  <li key={g.id} className="py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium">{name}</span>
                      <span className={a.attending ? "text-fern-dark" : "text-moss-soft"}>{a.attending ? "Coming" : "Not coming"}</span>
                    </div>
                    {a.attending && (a.meal || a.dietary) && (
                      <p className="text-sm text-moss-soft">{[a.meal, a.dietary].filter(Boolean).join(" · ")}</p>
                    )}
                  </li>
                );
              })}
            </ul>
            {(song || message) && (
              <dl className="mt-4 space-y-2 text-[0.95rem]">
                {song && anyoneComing && (
                  <div>
                    <dt className="text-moss-soft">Song</dt>
                    <dd>{song}</dd>
                  </div>
                )}
                {message && (
                  <div>
                    <dt className="text-moss-soft">Note</dt>
                    <dd className="whitespace-pre-line">{message}</dd>
                  </div>
                )}
              </dl>
            )}
          </Panel>
        )}

        {step === "done" && <Done coming={anyoneComing} />}
      </div>
    </div>
  );
}

function Find({ onChoose, pending, deadlineLabel }: { onChoose: (id: string) => void; pending: boolean; deadlineLabel: string | null }) {
  const [q, setQ] = useState("");
  const [found, setFound] = useState<PartyMatch[] | null>(null);
  const latest = useRef(0);
  const query = q.trim();
  const ready = query.replace(/\s/g, "").length >= 3;
  // Keep showing the last results while the next search is in flight.
  const results = ready ? found : null;

  useEffect(() => {
    if (!ready) return;
    const id = ++latest.current;
    const t = setTimeout(async () => {
      const r = await searchParties(query);
      if (id === latest.current) setFound(r);
    }, 220);
    return () => clearTimeout(t);
  }, [query, ready]);

  return (
    <div>
      <h1 className="text-[2.1rem]">Find your invitation</h1>
      <p className="mt-2 text-moss-soft">
        Type your first or last name.
        {deadlineLabel && <> Please reply by {deadlineLabel}.</>}
      </p>
      <input
        className="field mt-6 text-lg"
        type="search"
        inputMode="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="words"
        spellCheck={false}
        placeholder="Your name"
        aria-label="Your name"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      <div aria-live="polite" className="mt-4">
        {results && results.length === 0 && (
          <p className="rounded-2xl bg-card p-4 text-moss-soft ring-1 ring-lichen">
            No match yet. Try the name on your invitation, or just your last name.
          </p>
        )}
        {results && results.length > 0 && (
          <ul className="space-y-2">
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => onChoose(r.id)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl bg-card p-4 text-left ring-1 ring-lichen transition active:scale-[0.98] active:bg-paper-deep disabled:opacity-60"
                >
                  <span>
                    <span className="block font-serif text-xl text-fern-dark">{r.label}</span>
                    <span className="text-sm text-moss-soft">{r.names}</span>
                  </span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-sage" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Hello({ party, onBack, onNext }: { party: LoadedParty; onBack: () => void; onNext: () => void }) {
  const named = party.guests.filter((g) => !g.isPlaceholder);
  const adults = named.filter((g) => !g.isChild);
  const greeting =
    named.length <= 2
      ? named.map((g) => g.firstName).join(" & ")
      : `${(adults.length ? adults : named).slice(0, 2).map((g) => g.firstName).join(", ")} & family`;
  const plusOnes = party.guests.filter((g) => g.isPlaceholder).length;
  const replied = !!party.respondedAt;

  if (!party.open) {
    return (
      <Panel title={`Hi ${greeting}`} onBack={onBack}>
        <p className="text-moss-soft">
          RSVPs are closed. If something has changed, please reach out to {site.couple[0]} or {site.couple[1]} directly.
        </p>
        {replied && <Summary party={party} />}
      </Panel>
    );
  }

  return (
    <Panel
      title={`Hi ${greeting}!`}
      onBack={onBack}
      backLabel="Not you?"
      next={{ label: replied ? "Change our RSVP" : "Start RSVP", onClick: onNext }}
    >
      {replied ? (
        <>
          <p className="text-moss-soft">You’ve already replied. Here’s what we have:</p>
          <Summary party={party} />
        </>
      ) : (
        <>
          <p className="text-moss-soft">We’ve saved {party.guests.length === 1 ? "a seat" : "seats"} for:</p>
          <ul className="mt-3 space-y-2">
            {named.map((g) => (
              <li key={g.id} className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-lichen">
                <span className="h-2.5 w-2.5 rounded-full bg-fern" aria-hidden="true" />
                <span className="font-serif text-xl">{g.firstName} {g.lastName}</span>
              </li>
            ))}
            {plusOnes > 0 && (
              <li className="flex items-center gap-3 rounded-2xl px-4 py-3 border-[1.5px] border-dashed border-sage">
                <span className="h-2.5 w-2.5 rounded-full bg-foxglove" aria-hidden="true" />
                <span className="text-moss-soft">{plusOnes === 1 ? "A guest of your choice" : `${plusOnes} guests of your choice`}</span>
              </li>
            )}
          </ul>
        </>
      )}
    </Panel>
  );
}

function Summary({ party }: { party: LoadedParty }) {
  return (
    <ul className="mt-3 divide-y divide-lichen rounded-2xl bg-card px-4 ring-1 ring-lichen">
      {party.guests
        .filter((g) => !g.isPlaceholder || g.attending)
        .map((g) => (
          <li key={g.id} className="flex items-baseline justify-between gap-3 py-3">
            <span>{`${g.firstName} ${g.lastName}`.trim() || "Guest"}</span>
            <span className={g.attending ? "text-fern-dark" : "text-moss-soft"}>{g.attending ? "Coming" : "Not coming"}</span>
          </li>
        ))}
    </ul>
  );
}

function Done({ coming }: { coming: boolean }) {
  return (
    <div className="text-center">
      <h1 className="text-[2.4rem]">{coming ? "See you there!" : "Thank you for letting us know"}</h1>
      <p className="mt-3 text-moss-soft">
        {coming
          ? `Your RSVP is in. We can't wait to celebrate with you on ${site.dateLabel.replace(/^\w+, /, "")}.`
          : "Your RSVP is in. You'll be missed, and we'll raise a glass to you."}
      </p>
      <div className="mt-8 space-y-3">
        {coming && (
          <a href={calendarUrl()} target="_blank" rel="noreferrer" className="btn btn-primary w-full">
            Add to calendar
          </a>
        )}
        <Link href={coming ? "/details" : "/registry"} className="btn btn-quiet w-full">
          {coming ? "See the schedule and venue" : "See our registry"}
        </Link>
        {coming && (
          <Link href="/travel" className="btn btn-quiet w-full">
            Find a hotel
          </Link>
        )}
      </div>
    </div>
  );
}

function YesNo({ value, yes, no, onChange }: { value: boolean | null; yes: string; no: string; onChange: (v: boolean) => void }) {
  const base = "min-h-12 flex-1 rounded-xl px-3 font-semibold ring-1 transition active:scale-[0.97]";
  return (
    <div className="mt-3 flex gap-2" role="radiogroup">
      <button
        type="button"
        role="radio"
        aria-checked={value === true}
        onClick={() => onChange(true)}
        className={`${base} ${value === true ? "bg-fern text-card ring-fern" : "bg-paper text-moss ring-lichen"}`}
      >
        {yes}
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === false}
        onClick={() => onChange(false)}
        className={`${base} ${value === false ? "bg-moss-soft text-card ring-moss-soft" : "bg-paper text-moss ring-lichen"}`}
      >
        {no}
      </button>
    </div>
  );
}

function Panel({
  title,
  hint,
  children,
  onBack,
  backLabel = "Back",
  next,
  error,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  onBack?: () => void;
  backLabel?: string;
  next?: { label: string; onClick: () => void; disabled?: boolean };
  error?: string | null;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <h1 className="text-[2.1rem]">{title}</h1>
      {hint && <p className="mt-2 text-moss-soft">{hint}</p>}
      <div className="mt-6 flex-1">{children}</div>
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-foxglove/15 px-4 py-3 text-foxglove-dark">
          {error}
        </p>
      )}
      {(next || onBack) && (
        <div className="sticky bottom-0 -mx-5 mt-6 flex gap-3 bg-gradient-to-t from-paper from-70% to-transparent px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {onBack && (
            <button type="button" onClick={onBack} className="btn btn-quiet shrink-0">
              {backLabel}
            </button>
          )}
          {next && (
            <button type="button" onClick={next.onClick} disabled={next.disabled} className="btn btn-primary flex-1 text-lg">
              {next.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
