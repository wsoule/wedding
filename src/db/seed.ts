// Seeds editable content (from the old site) and, with --demo, a few fake
// parties for testing the RSVP flow. Safe to re-run: content tables are only
// filled when empty.
import { sql } from "drizzle-orm";
import { db } from "./client";
import { faqs, guests, hotels, parties, registryLinks, scheduleItems, settings } from "./schema";

async function fillIfEmpty<T extends Record<string, unknown>>(
  table: Parameters<typeof db.insert>[0],
  rows: T[],
) {
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(table);
  if (count === 0) await db.insert(table).values(rows.map((r, i) => ({ ...r, sortOrder: i })));
}

async function main() {
  await db.insert(settings).values({ id: 1 }).onConflictDoNothing();

  await fillIfEmpty(scheduleItems, [
    { time: "4:00 PM", title: "Doors open", details: "Welcome drinks on the lawn. Please be seated by 4:15." },
    { time: "4:30 PM", title: "Ceremony", details: "On the lawn south of the barn. Moves inside if it rains." },
    { time: "5:15 PM", title: "Cocktail hour", details: "Drinks and passed appetizers." },
    { time: "6:30 PM", title: "Dinner & dancing", details: "Under the barn rafters, until 11 PM." },
  ]);

  await fillIfEmpty(hotels, [
    {
      name: "Soaring Eagle Casino & Resort",
      url: "https://www.soaringeaglecasino.com/",
      address: "6800 Soaring Eagle Blvd, Mt. Pleasant, MI",
      distance: "22 min drive",
      blockCode: "SOULE-CORLISS",
      bookBy: null,
      notes: "Placeholder from the old site. Confirm the room block before launch.",
    },
  ]);

  await fillIfEmpty(registryLinks, [
    { title: "Amazon", url: "https://www.amazon.com/wedding/registry", blurb: "Things for the home." },
    { title: "Honeyfund", url: "https://www.honeyfund.com/", blurb: "Help send us on our honeymoon." },
    { title: "Moving fund", url: "#", blurb: "Toward our first home together." },
  ]);

  await fillIfEmpty(faqs, [
    { question: "When should I RSVP by?", answer: "Please reply by April 17, 2027 so we can give the caterer a final headcount." },
    { question: "Are kids welcome?", answer: "Children named on your invitation are welcome. When you RSVP, you'll see everyone in your party." },
    { question: "Can I bring a plus one?", answer: "If your RSVP shows a guest slot, yes. Add their name when you reply." },
    { question: "Will the ceremony be outside?", answer: "Yes, on the lawn, weather permitting. If it rains we move into the barn. Plan for grass underfoot." },
    { question: "Is there parking?", answer: "Yes, free parking on site, with overflow on the back field." },
    { question: "What will the weather be like?", answer: "May in Michigan can be warm in the afternoon and chilly at night. Bring a layer." },
  ]);

  if (process.argv.includes("--demo")) {
    const demo: { name: string; people: Partial<typeof guests.$inferInsert>[] }[] = [
      { name: "Jordan & Sam", people: [{ firstName: "Jordan", lastName: "Smith" }, { firstName: "Sam", lastName: "Lee" }] },
      {
        name: "The Carter family",
        people: [
          { firstName: "Michael", lastName: "Carter", nickname: "Mike" },
          { firstName: "Anna", lastName: "Carter" },
          { firstName: "Lily", lastName: "Carter", isChild: true },
          { firstName: "Ben", lastName: "Carter", isChild: true },
        ],
      },
      { name: "Riley Brooks + guest", people: [{ firstName: "Riley", lastName: "Brooks" }, { isPlaceholder: true }] },
    ];
    for (const p of demo) {
      const [party] = await db.insert(parties).values({ name: p.name }).returning();
      await db.insert(guests).values(p.people.map((g, i) => ({ ...g, partyId: party.id, sortOrder: i })));
    }
    console.log(`Added ${demo.length} demo parties.`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
