import type { Metadata } from "next";
import { connection } from "next/server";
import type { CSSProperties } from "react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { getGuestPhotos } from "@/lib/data";
import { photoUrl } from "@/lib/photos";
import { Uploader } from "./uploader";

export const metadata: Metadata = { title: "Photos" };

const tilts = [-2, 1.5, -1, 2, 1, -1.5];

export default async function PhotosPage() {
  await connection();
  const photos = await getGuestPhotos();

  return (
    <>
      <PageHeader title="Photos" intro="Share what you see. Everything lands in one album for everyone to enjoy." />
      <Uploader />

      <h2 className="mt-16 mb-6 text-center text-[2rem] text-fern-dark">The album</h2>
      {photos.length === 0 ? (
        <p className="text-center text-moss-soft">No photos yet. Be the first!</p>
      ) : (
        <ul className="columns-2 gap-4">
          {photos.map((p, i) => (
            <Reveal as="li" key={p.id} tilt={tilts[i % tilts.length]} className="mb-5 break-inside-avoid">
              <a
                href={photoUrl(p.id)}
                target="_blank"
                rel="noreferrer"
                className="print block p-2 pb-3"
                style={{ "--tilt": `${tilts[i % tilts.length]}deg` } as CSSProperties}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl(p.id, "sm")} alt={p.caption ?? "Guest photo"} width={p.width} height={p.height} loading="lazy" className="h-auto w-full" />
                {p.caption && <span className="block pt-2 text-center text-xs leading-snug text-moss-soft">{p.caption}</span>}
                {p.uploader && <span className="block pt-1 text-center font-serif text-lg italic leading-none text-moss-soft">{p.uploader}</span>}
              </a>
            </Reveal>
          ))}
        </ul>
      )}
    </>
  );
}
