import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db/client";
import { photos } from "@/db/schema";
import { getSettings } from "@/lib/data";
import { getPhotosById, photoUrl } from "@/lib/photos";
import { clearHeroPhoto, deletePhoto, setHeroPhoto, setPhotoHidden } from "../../actions";
import { ConfirmButton } from "../confirm-button";

export const metadata: Metadata = { title: "Photos" };

export default async function AdminPhotos() {
  await connection();
  const settings = await getSettings();
  const hero = await getPhotosById(settings.heroPhotoIds);
  const guestPhotos = await db.select().from(photos).where(eq(photos.kind, "guest")).orderBy(desc(photos.createdAt));

  return (
    <>
      <h1 className="text-[1.75rem]">Photos</h1>

      <section className="mt-6 rounded-2xl bg-card p-4 ring-1 ring-lichen">
        <h2 className="text-xl">Home page photobooth strip</h2>
        <p className="text-sm text-moss-soft">Four photos, top to bottom. Landscape photos fit the frames best; they&rsquo;re cropped to 4:3.</p>
        <ol className="mt-4 space-y-3">
          {Array.from({ length: 4 }, (_, slot) => {
            const id = settings.heroPhotoIds[slot];
            const photo = id ? hero.get(id) : undefined;
            return (
              <li key={slot} className="flex items-center gap-3">
                <span className="w-5 text-center font-serif text-lg text-moss-soft">{slot + 1}</span>
                <div className="h-16 w-[5.3rem] shrink-0 overflow-hidden rounded bg-paper-deep">
                  {photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoUrl(photo.id, "sm")} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <form action={setHeroPhoto} className="flex min-w-0 flex-1 items-center gap-2">
                  <input type="hidden" name="slot" value={slot} />
                  <input name="photo" type="file" accept="image/*" required className="min-w-0 flex-1 text-sm file:mr-2 file:rounded-full file:border-0 file:bg-paper-deep file:px-3 file:py-2" />
                  <button className="btn btn-quiet min-h-10 shrink-0 px-3 text-sm">{photo ? "Replace" : "Add"}</button>
                </form>
                {photo && (
                  <form action={clearHeroPhoto}>
                    <input type="hidden" name="id" value={photo.id} />
                    <button className="px-2 text-sm text-foxglove-dark" aria-label={`Remove photo ${slot + 1}`}>
                      Remove
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-xl">Guest album</h2>
        <p className="text-sm text-moss-soft">
          {guestPhotos.length} {guestPhotos.length === 1 ? "photo" : "photos"}. Hidden photos stay here but don&rsquo;t show on the site.
        </p>
        {guestPhotos.length === 0 ? (
          <p className="mt-4 text-moss-soft">Nothing yet.</p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {guestPhotos.map((p) => (
              <li key={p.id} className={`rounded-xl bg-card p-2 ring-1 ring-lichen ${p.hidden ? "opacity-50" : ""}`}>
                <a href={photoUrl(p.id)} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl(p.id, "sm")} alt="" className="aspect-square w-full rounded object-cover" loading="lazy" />
                </a>
                <p className="mt-1 truncate text-xs text-moss-soft">
                  {p.uploader || "Anonymous"} · {p.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Detroit" })}
                </p>
                <div className="mt-1 flex justify-between text-sm">
                  <form action={setPhotoHidden}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="hidden" value={p.hidden ? "0" : "1"} />
                    <button className="font-medium text-fern-dark">{p.hidden ? "Show" : "Hide"}</button>
                  </form>
                  <form action={deletePhoto}>
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmButton message="Delete this photo for good?" className="text-foxglove-dark">
                      Delete
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
