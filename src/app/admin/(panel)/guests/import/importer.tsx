"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { previewImport, runImport } from "../../../actions";

type Preview = Awaited<ReturnType<typeof previewImport>>;

export function Importer() {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [done, setDone] = useState<{ created: number; skipped: number } | null>(null);
  const [pending, start] = useTransition();

  const check = (t: string) => {
    setText(t);
    setDone(null);
    start(async () => setPreview(t.trim() ? await previewImport(t) : null));
  };

  const fresh = preview?.parties.filter((p) => !p.exists) ?? [];
  const people = fresh.reduce((n, p) => n + p.guests.length, 0);

  if (done) {
    return (
      <div className="mt-6 rounded-2xl bg-card p-4 ring-1 ring-lichen">
        <p className="font-medium">
          Imported {done.created} {done.created === 1 ? "invitation" : "invitations"}.
          {done.skipped > 0 && ` Skipped ${done.skipped} that already existed.`}
        </p>
        <Link href="/admin/guests" className="btn btn-primary mt-4 w-full">
          See the guest list
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <textarea
        value={text}
        onChange={(e) => check(e.target.value)}
        placeholder={"Party\tFirst name\tLast name\tChild\tPlus one\nThe Carters\tMichael\tCarter\t\t"}
        className="field min-h-48 font-mono text-sm"
        aria-label="Pasted guest list"
      />
      <label className="btn btn-quiet w-full cursor-pointer">
        Upload a CSV file
        <input
          type="file"
          accept=".csv,.tsv,text/csv,text/plain"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (file) check(await file.text());
          }}
        />
      </label>

      {preview?.warnings.map((w) => (
        <p key={w} role="alert" className="rounded-xl bg-foxglove/15 px-4 py-3 text-foxglove-dark">
          {w}
        </p>
      ))}

      {preview && preview.parties.length > 0 && (
        <>
          <h2 className="pt-4 text-xl">
            Preview: {fresh.length} new {fresh.length === 1 ? "invitation" : "invitations"}, {people} people
          </h2>
          <ul className="divide-y divide-lichen rounded-2xl bg-card ring-1 ring-lichen">
            {preview.parties.map((p, i) => (
              <li key={i} className={`px-4 py-3 ${p.exists ? "opacity-50" : ""}`}>
                <p className="font-medium">
                  {p.name}
                  {p.exists && <span className="ml-2 text-xs">already exists, will skip</span>}
                </p>
                <p className="text-sm text-moss-soft">
                  {p.guests
                    .map((g) => (g.isPlaceholder ? "+1" : `${g.firstName} ${g.lastName}`.trim() + (g.isChild ? " (child)" : "") + (g.nickname ? ` "${g.nickname}"` : "")))
                    .join(", ")}
                </p>
              </li>
            ))}
          </ul>
          <button
            className="btn btn-primary w-full"
            disabled={pending || fresh.length === 0}
            onClick={() => start(async () => setDone(await runImport(text)))}
          >
            {pending ? "Working…" : `Import ${fresh.length} ${fresh.length === 1 ? "invitation" : "invitations"}`}
          </button>
        </>
      )}
    </div>
  );
}
