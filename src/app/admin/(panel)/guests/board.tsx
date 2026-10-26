"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { matchesQuery } from "@/lib/names";
import { addPeopleToParty, moveGuestTo, quickAddInvitation, removeGuest, renameGuest, renameParty, setGuestChild, setGuestRole } from "../../actions";

// The guest list as a board of invitations. Tap a person to pick them up,
// then tap the invitation they belong in. On a computer, drag works too.

export type BoardGuest = {
  id: string;
  firstName: string;
  lastName: string;
  nickname: string | null;
  isChild: boolean;
  isPlaceholder: boolean;
  attending: boolean | null;
  role: string | null;
};
export type BoardParty = { id: string; name: string; side: string | null; replied: boolean; guests: BoardGuest[] };

const ROLES = ["Best man", "Maid of honor", "Groomsman", "Bridesmaid", "Ring bearer", "Flower girl", "Officiant", "Usher"];

const label = (g: BoardGuest) => (g.isPlaceholder && !g.firstName ? "+1" : `${g.firstName} ${g.lastName}`.trim());

export function GuestBoard({ parties }: { parties: BoardParty[] }) {
  const router = useRouter();
  const [list, setList] = useState(parties);
  const [synced, setSynced] = useState(parties);
  // When the server sends fresh data (after any change), start from it.
  if (parties !== synced) {
    setSynced(parties);
    setList(parties);
  }

  const [query, setQuery] = useState("");
  const [show, setShow] = useState<"all" | "waiting" | "replied">("all");
  const [picked, setPicked] = useState<{ guest: BoardGuest; from: string } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [choosingRole, setChoosingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [dragOver, setDragOver] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>, optimistic?: () => void) {
    setError(null);
    optimistic?.();
    start(async () => {
      const res = await action();
      if (!res.ok) setError(res.error ?? "That didn't work. Refresh and try again.");
      router.refresh();
    });
  }

  function moveTo(partyId: string | null, guest = picked?.guest, from = picked?.from) {
    if (!guest || !from || partyId === from) return;
    setPicked(null);
    setRenaming(false);
    run(
      () => moveGuestTo(guest.id, partyId),
      partyId
        ? () =>
            setList((ps) =>
              ps
                .map((p) =>
                  p.id === from
                    ? { ...p, guests: p.guests.filter((g) => g.id !== guest.id) }
                    : p.id === partyId
                      ? { ...p, guests: [...p.guests, guest] }
                      : p,
                )
                .filter((p) => p.guests.length > 0),
            )
        : undefined,
    );
  }

  const q = query.trim();
  const visible = list.filter((p) => {
    if (show === "waiting" && p.replied) return false;
    if (show === "replied" && !p.replied) return false;
    if (!q) return true;
    return p.name.toLowerCase().includes(q.toLowerCase()) || p.guests.some((g) => matchesQuery(g, q));
  });
  const people = list.reduce((n, p) => n + p.guests.length, 0);

  return (
    <div className={picked ? "pb-56" : ""}>
      <QuickAdd
        onAdd={(text, side) =>
          run(async () => {
            const res = await quickAddInvitation(text, side);
            if (res.ok) setQuery("");
            return res;
          })
        }
        pending={pending}
      />
      <div className="sticky top-[6.6rem] z-20 -mx-4 bg-paper/95 px-4 pt-2 pb-3 backdrop-blur">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={picked ? `Find where ${picked.guest.firstName || "they"} belong…` : "Search names"}
          aria-label="Search names"
          className="field"
        />
        <div className="mt-2 flex items-center gap-2">
          {(["all", "waiting", "replied"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setShow(f)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium ring-1 ${show === f ? "bg-fern text-card ring-fern" : "bg-card ring-lichen"}`}
            >
              {f === "all" ? "All" : f === "waiting" ? "No answer" : "Replied"}
            </button>
          ))}
          <span className="ml-auto text-xs text-moss-soft" aria-live="polite">
            {pending ? "Saving…" : `${list.length} invitations, ${people} people`}
          </span>
        </div>
      </div>

      {error && (
        <p role="alert" className="mb-3 rounded-xl bg-foxglove/20 px-4 py-3 text-foxglove-dark">
          {error}
        </p>
      )}

      <ul className="space-y-3">
        {visible.map((p) => {
          const isFrom = picked?.from === p.id;
          const target = !!picked && !isFrom;
          return (
            <li
              key={p.id}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(p.id);
              }}
              onDragLeave={() => setDragOver((d) => (d === p.id ? null : d))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const [guestId, from] = e.dataTransfer.getData("text/plain").split("|");
                const guest = list.find((x) => x.id === from)?.guests.find((g) => g.id === guestId);
                if (guest) moveTo(p.id, guest, from);
              }}
              className={`rounded-2xl bg-card p-3 ring-1 transition ${
                dragOver === p.id ? "ring-2 ring-fern" : target ? "ring-sage" : isFrom ? "ring-2 ring-foxglove" : "ring-lichen"
              }`}
            >
              <div className="flex items-center gap-2">
                <PartyName party={p} onRename={(name) => run(() => renameParty(p.id, name), () => setList((ps) => ps.map((x) => (x.id === p.id ? { ...x, name } : x))))} />
                {p.side && <span className="text-xs text-moss-soft">{p.side}</span>}
                <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-xs ${p.replied ? "bg-lichen text-fern-dark" : "bg-buttercup/30"}`}>
                  {p.replied ? "Replied" : "Waiting"}
                </span>
                <Link href={`/admin/guests/${p.id}`} className="shrink-0 px-1 text-sm text-moss-soft underline underline-offset-2">
                  Details
                </Link>
              </div>
              <ul className="mt-2 flex flex-wrap gap-2">
                {p.guests.map((g) => {
                  const isPicked = picked?.guest.id === g.id;
                  return (
                    <li key={g.id}>
                      <button
                        type="button"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("text/plain", `${g.id}|${p.id}`)}
                        onClick={() => {
                          setRenaming(false);
                          setChoosingRole(false);
                          setPicked(isPicked ? null : { guest: g, from: p.id });
                        }}
                        aria-pressed={isPicked}
                        className={`min-h-10 rounded-full px-3.5 text-[0.95rem] ring-1 transition ${
                          isPicked ? "bg-foxglove-dark text-white ring-foxglove-dark" : "bg-paper ring-lichen active:bg-paper-deep"
                        } ${g.isPlaceholder && !g.firstName ? "italic" : ""}`}
                      >
                        {label(g)}
                        {g.role && <span className="ml-1.5 text-xs italic opacity-80">{g.role}</span>}
                        {g.isChild && <span className="ml-1.5 text-xs opacity-70">child</span>}
                        {g.attending === true && <span className="ml-1.5 text-xs opacity-70">✓</span>}
                        {g.attending === false && <span className="ml-1.5 text-xs opacity-70">✗</span>}
                      </button>
                    </li>
                  );
                })}
                {!picked && (
                  <li>
                    <AddChip onAdd={(text) => run(() => addPeopleToParty(p.id, text))} />
                  </li>
                )}
              </ul>
              {target && (
                <button
                  type="button"
                  onClick={() => moveTo(p.id)}
                  className="mt-3 w-full rounded-xl border-[1.5px] border-dashed border-fern py-2.5 text-sm font-semibold text-fern-dark active:bg-paper-deep"
                >
                  Move {picked.guest.firstName || "+1"} here
                </button>
              )}
            </li>
          );
        })}
        {visible.length === 0 && <li className="py-8 text-center text-moss-soft">No invitations match.</li>}
      </ul>

      {picked && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-lichen bg-card/95 px-4 pt-4 shadow-[0_-10px_30px_-12px_rgb(33_53_40/0.25)] backdrop-blur"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
        >
          <div className="mx-auto max-w-3xl">
            {choosingRole ? (
              <RolePicker
                current={picked.guest.role}
                onCancel={() => setChoosingRole(false)}
                onPick={(role) => {
                  const { guest, from } = picked;
                  setChoosingRole(false);
                  setPicked({ guest: { ...guest, role }, from });
                  run(
                    () => setGuestRole(guest.id, role),
                    () =>
                      setList((ps) =>
                        ps.map((p) => (p.id === from ? { ...p, guests: p.guests.map((g) => (g.id === guest.id ? { ...g, role } : g)) } : p)),
                      ),
                  );
                }}
              />
            ) : renaming ? (
              <RenameForm
                guest={picked.guest}
                onCancel={() => setRenaming(false)}
                onSave={(first, last) => {
                  const { guest, from } = picked;
                  setRenaming(false);
                  setPicked(null);
                  run(
                    () => renameGuest(guest.id, first, last),
                    () =>
                      setList((ps) =>
                        ps.map((p) =>
                          p.id === from
                            ? { ...p, guests: p.guests.map((g) => (g.id === guest.id ? { ...g, firstName: first, lastName: last, isPlaceholder: false } : g)) }
                            : p,
                        ),
                      ),
                  );
                }}
              />
            ) : (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-serif text-xl">{label(picked.guest)}</p>
                  <button type="button" onClick={() => setPicked(null)} className="text-sm text-moss-soft">
                    Done
                  </button>
                </div>
                <p className="text-sm text-moss-soft">Tap &ldquo;Move here&rdquo; on the invitation they belong in, or:</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  <button type="button" className="btn btn-quiet min-h-11 px-3 text-sm" onClick={() => moveTo(null)} disabled={pending}>
                    Own invitation
                  </button>
                  <button type="button" className="btn btn-quiet min-h-11 px-3 text-sm" onClick={() => setRenaming(true)}>
                    {picked.guest.isPlaceholder && !picked.guest.firstName ? "Add name" : "Rename"}
                  </button>
                  <button type="button" className="btn btn-quiet min-h-11 px-3 text-sm" onClick={() => setChoosingRole(true)}>
                    {picked.guest.role ? `Role: ${picked.guest.role}` : "Wedding party role"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-quiet min-h-11 px-3 text-sm"
                    onClick={() => {
                      const { guest, from } = picked;
                      const isChild = !guest.isChild;
                      setPicked({ guest: { ...guest, isChild }, from });
                      run(
                        () => setGuestChild(guest.id, isChild),
                        () =>
                          setList((ps) =>
                            ps.map((p) => (p.id === from ? { ...p, guests: p.guests.map((g) => (g.id === guest.id ? { ...g, isChild } : g)) } : p)),
                          ),
                      );
                    }}
                  >
                    {picked.guest.isChild ? "Not a child" : "Mark as child"}
                  </button>
                  <button
                    type="button"
                    className="btn min-h-11 px-3 text-sm text-foxglove-dark ring-1 ring-foxglove/40"
                    onClick={() => {
                      if (!confirm(`Remove ${label(picked.guest)} from the guest list?`)) return;
                      const { guest, from } = picked;
                      setPicked(null);
                      run(
                        () => removeGuest(guest.id),
                        () =>
                          setList((ps) =>
                            ps.map((p) => (p.id === from ? { ...p, guests: p.guests.filter((g) => g.id !== guest.id) } : p)).filter((p) => p.guests.length > 0),
                          ),
                      );
                    }}
                  >
                    Remove
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PartyName({ party, onRename }: { party: BoardParty; onRename: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(party.name);
  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setName(party.name);
          setEditing(true);
        }}
        className="min-w-0 truncate text-left font-medium"
        title="Rename this invitation"
      >
        {party.name}
      </button>
    );
  }
  const save = () => {
    setEditing(false);
    if (name.trim() && name.trim() !== party.name) onRename(name.trim());
  };
  return (
    <input
      autoFocus
      value={name}
      onChange={(e) => setName(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") setEditing(false);
      }}
      aria-label="Invitation name"
      className="field min-h-9 min-w-0 flex-1 px-2 py-1 text-[0.95rem]"
    />
  );
}

function RenameForm({ guest, onSave, onCancel }: { guest: BoardGuest; onSave: (first: string, last: string) => void; onCancel: () => void }) {
  const [first, setFirst] = useState(guest.firstName);
  const [last, setLast] = useState(guest.lastName);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (first.trim()) onSave(first.trim(), last.trim());
      }}
    >
      <div className="grid grid-cols-2 gap-2">
        <input autoFocus className="field" placeholder="First name" aria-label="First name" value={first} onChange={(e) => setFirst(e.target.value)} />
        <input className="field" placeholder="Last name" aria-label="Last name" value={last} onChange={(e) => setLast(e.target.value)} />
      </div>
      <div className="mt-2 flex gap-2">
        <button type="button" className="btn btn-quiet flex-1" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary flex-1" disabled={!first.trim()}>
          Save
        </button>
      </div>
    </form>
  );
}

function RolePicker({ current, onPick, onCancel }: { current: string | null; onPick: (role: string | null) => void; onCancel: () => void }) {
  const [custom, setCustom] = useState(current && !ROLES.includes(current) ? current : "");
  return (
    <div>
      <p className="font-serif text-xl">Wedding party role</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onPick(r)}
            className={`min-h-10 rounded-full px-3.5 text-sm ring-1 ${current === r ? "bg-fern text-card ring-fern" : "bg-paper ring-lichen"}`}
          >
            {r}
          </button>
        ))}
      </div>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (custom.trim()) onPick(custom.trim());
        }}
      >
        <input className="field min-h-11" placeholder="Something else" aria-label="Custom role" value={custom} onChange={(e) => setCustom(e.target.value)} />
        <button className="btn btn-quiet min-h-11 shrink-0 px-4 text-sm" disabled={!custom.trim()}>
          Set
        </button>
      </form>
      <div className="mt-2 flex gap-2">
        <button type="button" className="btn btn-quiet min-h-11 flex-1 text-sm" onClick={onCancel}>
          Back
        </button>
        {current && (
          <button type="button" className="btn min-h-11 flex-1 text-sm text-foxglove-dark ring-1 ring-foxglove/40" onClick={() => onPick(null)}>
            No role
          </button>
        )}
      </div>
    </div>
  );
}

// New invitation in one line: "Jane & John Doe", "Mike, Anna & Lily Carter",
// "Riley Brooks + 1".
function QuickAdd({ onAdd, pending }: { onAdd: (text: string, side: string | null) => void; pending: boolean }) {
  const [text, setText] = useState("");
  const [side, setSide] = useState<string | null>(null);
  return (
    <form
      className="mb-3 rounded-2xl bg-card p-3 ring-1 ring-lichen"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onAdd(text, side);
        setText("");
      }}
    >
      <label className="mb-1.5 block text-sm font-medium" htmlFor="quick-add">
        Add an invitation
      </label>
      <div className="flex gap-2">
        <input
          id="quick-add"
          className="field"
          placeholder="Jane & John Doe, or Riley Brooks + 1"
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn btn-primary shrink-0 px-5" disabled={pending || !text.trim()}>
          Add
        </button>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className="text-moss-soft">Side:</span>
        {(["Jaden", "Wyat"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSide(side === s ? null : s)}
            aria-pressed={side === s}
            className={`rounded-full px-3 py-1 ring-1 ${side === s ? "bg-fern text-card ring-fern" : "bg-paper ring-lichen"}`}
          >
            {s}
          </button>
        ))}
      </div>
    </form>
  );
}

// "+ Add" at the end of an invitation's names: type a name (or +1) and press Enter.
function AddChip({ onAdd }: { onAdd: (text: string) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="min-h-10 rounded-full border-[1.5px] border-dashed border-sage px-3.5 text-[0.95rem] text-fern-dark"
      >
        + Add
      </button>
    );
  }
  const submit = () => {
    if (text.trim()) onAdd(text);
    setText("");
    setOpen(false);
  };
  return (
    <form
      className="flex gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        autoFocus
        className="field min-h-10 w-44 px-3 py-1.5 text-[0.95rem]"
        placeholder="Name, or +1"
        aria-label="Add a person to this invitation"
        autoComplete="off"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setText("");
            setOpen(false);
          }
        }}
        onBlur={() => !text.trim() && setOpen(false)}
      />
      <button className="btn btn-primary min-h-10 px-3 text-sm" disabled={!text.trim()}>
        Add
      </button>
    </form>
  );
}
