import type { Metadata } from "next";
import { connection } from "next/server";
import { getPartiesWithGuests } from "@/lib/data";
import { setNoteHidden } from "../../actions";

export const metadata: Metadata = { title: "Songs & notes" };

export default async function NotesPage() {
  await connection();
  const all = await getPartiesWithGuests();
  const songs = all.filter((p) => p.song).sort((a, b) => a.song!.localeCompare(b.song!));
  const notes = all.filter((p) => p.message).sort((a, b) => (b.respondedAt?.getTime() ?? 0) - (a.respondedAt?.getTime() ?? 0));

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-[1.75rem]">Songs for the DJ</h1>
        <a href="/admin/export?type=songs" className="text-sm font-semibold text-fern-dark underline underline-offset-4">
          Download CSV
        </a>
      </div>
      {songs.length === 0 ? (
        <p className="mt-3 text-moss-soft">No requests yet.</p>
      ) : (
        <ol className="mt-4 divide-y divide-lichen rounded-2xl bg-card px-4 ring-1 ring-lichen">
          {songs.map((p) => (
            <li key={p.id} className="flex items-baseline justify-between gap-3 py-2.5">
              <span className="font-medium">{p.song}</span>
              <span className="shrink-0 text-sm text-moss-soft">{p.name}</span>
            </li>
          ))}
        </ol>
      )}

      <h2 className="mt-12 text-[1.75rem]">Notes</h2>
      <p className="text-sm text-moss-soft">Guests choose whether their note goes on the well-wishes wall. You can hide any shared note.</p>
      {notes.length === 0 ? (
        <p className="mt-3 text-moss-soft">No notes yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notes.map((p) => (
            <li key={p.id} className="rounded-2xl bg-card p-4 ring-1 ring-lichen">
              <p className="whitespace-pre-line">{p.message}</p>
              <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                <span className="text-moss-soft">
                  {p.name}
                  {p.messagePublic ? (p.messageHidden ? " · shared, but hidden by you" : " · on the wall") : " · private"}
                </span>
                {p.messagePublic && (
                  <form action={setNoteHidden}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="hidden" value={p.messageHidden ? "0" : "1"} />
                    <button className="font-medium text-fern-dark">{p.messageHidden ? "Show on wall" : "Hide from wall"}</button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
