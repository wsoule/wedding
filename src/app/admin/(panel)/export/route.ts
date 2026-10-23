import { isAdmin } from "@/lib/auth";
import { getPartiesWithGuests } from "@/lib/data";

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Quote everything; prefix formula-looking cells so spreadsheets don't execute them.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

const csvResponse = (rows: unknown[][], name: string) =>
  new Response(rows.map((r) => r.map(cell).join(",")).join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });

export async function GET(request: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const parties = await getPartiesWithGuests();
  if (new URL(request.url).searchParams.get("type") === "songs") {
    return csvResponse([["Song", "Requested by"], ...parties.filter((p) => p.song).map((p) => [p.song, p.name])], "song-requests");
  }
  const header = ["Party", "First name", "Last name", "Child", "Plus one", "Attending", "Meal", "Dietary", "Table", "Address", "Replied", "Note", "Song"];
  const rows = parties.flatMap((p) =>
    p.guests.map((g) => [
      p.name,
      g.firstName,
      g.lastName,
      g.isChild ? "yes" : "",
      g.isPlaceholder ? "yes" : "",
      g.attending === null ? "" : g.attending ? "yes" : "no",
      g.meal,
      g.dietary,
      p.tableNumber,
      p.address,
      p.respondedAt?.toISOString().slice(0, 10),
      p.message,
      p.song,
    ]),
  );
  return csvResponse([header, ...rows], "rsvps");
}
