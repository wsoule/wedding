import type { Metadata } from "next";
import { connection } from "next/server";
import { getSettings } from "@/lib/data";
import { RsvpFlow } from "./rsvp-flow";

export const metadata: Metadata = { title: "RSVP" };

export default async function RsvpPage() {
  await connection();
  const { rsvpDeadline } = await getSettings();
  const deadlineLabel = rsvpDeadline
    ? new Date(`${rsvpDeadline}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric" })
    : null;
  return (
    <main className="mx-auto max-w-[34rem] px-5">
      <RsvpFlow deadlineLabel={deadlineLabel} />
    </main>
  );
}
