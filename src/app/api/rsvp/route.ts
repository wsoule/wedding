import { rsvps } from "@/db/schema";
import { getDb } from "@/db/client";

export const runtime = "nodejs";

const mealOptions = new Set(["chicken", "beef", "fish", "veg", "vegan"]);

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toClientRsvp(row: typeof rsvps.$inferSelect) {
  return {
    name: row.name,
    email: row.email,
    attending: row.attending ? "yes" : "no",
    plusOne: row.plusOne ?? "",
    meal: row.meal ?? "chicken",
    dietary: row.dietary ?? "",
    song: row.song ?? "",
    note: row.note ?? "",
    at: row.updatedAt.toISOString(),
  };
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const data = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const name = clean(data.name);
  const email = clean(data.email).toLowerCase();
  const attending = data.attending === "no" ? false : true;
  const meal = mealOptions.has(clean(data.meal)) ? clean(data.meal) : "chicken";

  if (!name) {
    return Response.json({ error: "Please enter your name." }, { status: 400 });
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const now = new Date();
  const values = {
    name,
    email,
    attending,
    plusOne: attending ? clean(data.plusOne) || null : null,
    meal: attending ? meal : null,
    dietary: attending ? clean(data.dietary) || null : null,
    song: attending ? clean(data.song) || null : null,
    note: clean(data.note) || null,
    updatedAt: now,
  };

  try {
    const db = getDb();
    const [saved] = await db
      .insert(rsvps)
      .values(values)
      .onConflictDoUpdate({
        target: rsvps.email,
        set: values,
      })
      .returning();

    return Response.json({ rsvp: toClientRsvp(saved) }, { status: 201 });
  } catch (error) {
    console.error("RSVP save failed", error);
    return Response.json(
      { error: "The RSVP database is not available yet. Please try again later." },
      { status: 503 },
    );
  }
}
