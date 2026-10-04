import type { Metadata } from "next";
import { connection } from "next/server";
import QRCode from "qrcode";
import { getSettings } from "@/lib/data";
import { saveSettings } from "../../actions";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await connection();
  const s = await getSettings();
  const rsvpUrl = `${(process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "")}/rsvp`;
  const qrOptions = { margin: 2, color: { dark: "#1e3626", light: "#ffffff" } };
  const svg = await QRCode.toString(rsvpUrl, { type: "svg", ...qrOptions });
  const png = await QRCode.toDataURL(rsvpUrl, { width: 1200, ...qrOptions });

  return (
    <>
      <h1 className="text-[1.75rem]">Settings</h1>

      <form action={saveSettings} className="mt-6 space-y-8">
        <fieldset className="rounded-2xl bg-card p-4 ring-1 ring-lichen">
          <legend className="sr-only">Meals</legend>
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-xl font-serif">Meal choice</span>
              <span className="text-sm text-moss-soft">When off, guests are only asked about allergies.</span>
            </span>
            <input type="checkbox" name="mealChoiceEnabled" aria-label="Ask guests to choose a meal" defaultChecked={s.mealChoiceEnabled} className="h-6 w-6 shrink-0 accent-fern" />
          </label>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm text-moss-soft">Adult meals, one per line</span>
              <textarea name="adultMealOptions" defaultValue={s.adultMealOptions.join("\n")} className="field min-h-28" placeholder={"Chicken\nShort rib\nMushroom risotto"} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-moss-soft">Kids&apos; meals, one per line</span>
              <textarea name="kidMealOptions" defaultValue={s.kidMealOptions.join("\n")} className="field min-h-28" placeholder={"Chicken tenders\nMac and cheese"} />
            </label>
          </div>
        </fieldset>

        <fieldset className="rounded-2xl bg-card p-4 ring-1 ring-lichen">
          <legend className="sr-only">RSVP deadline</legend>
          <label className="block">
            <span className="block font-serif text-xl">RSVP deadline</span>
            <span className="mb-2 block text-sm text-moss-soft">Guests can reply or change answers through the end of this day. Leave empty for no deadline.</span>
            <input type="date" name="rsvpDeadline" defaultValue={s.rsvpDeadline ?? ""} className="field" />
          </label>
        </fieldset>

        <fieldset className="rounded-2xl bg-card p-4 ring-1 ring-lichen">
          <legend className="sr-only">Notifications</legend>
          <label className="block">
            <span className="block font-serif text-xl">Email us when someone RSVPs</span>
            <span className="mb-2 block text-sm text-moss-soft">One address per line.</span>
            <textarea name="notifyEmails" defaultValue={s.notifyEmails.join("\n")} className="field min-h-20" />
          </label>
          {!process.env.RESEND_API_KEY && (
            <p className="mt-2 rounded-xl bg-buttercup/30 px-3 py-2 text-sm">
              Emails are off until RESEND_API_KEY and EMAIL_FROM are set on the server.
            </p>
          )}
        </fieldset>

        <button className="btn btn-primary w-full">Save settings</button>
      </form>

      <section className="mt-10 rounded-2xl bg-card p-4 ring-1 ring-lichen">
        <h2 className="text-xl">Invitation QR code</h2>
        <p className="text-sm text-moss-soft">
          Opens <span className="break-all font-medium text-moss">{rsvpUrl}</span>
        </p>
        <div className="mx-auto mt-4 w-56" dangerouslySetInnerHTML={{ __html: svg }} />
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} download="rsvp-qr.svg" className="btn btn-quiet px-3">
            Save SVG
          </a>
          <a href={png} download="rsvp-qr.png" className="btn btn-quiet px-3">
            Save PNG
          </a>
        </div>
        <p className="mt-3 text-sm text-moss-soft">SVG stays sharp at any size; send that one to your printer.</p>
      </section>
    </>
  );
}
