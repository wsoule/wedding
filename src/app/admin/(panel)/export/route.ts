import { isAdmin } from "@/lib/auth";
import { getPartiesWithGuests } from "@/lib/data";

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  // Quote everything; prefix formula-looking cells so spreadsheets don't execute them.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const parties = await getPartiesWithGuests();
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
  const csv = [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="rsvps-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
