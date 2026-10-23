import type { Metadata } from "next";
import { connection } from "next/server";
import type { CSSProperties } from "react";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { getGuestPhotos } from "@/lib/data";
import { photoUrl } from "@/lib/photos";
import { Booth } from "./booth";
import { Uploader } from "./uploader";

export const metadata: Metadata = { title: "Photobooth" };

const tilts = [-2, 1.5, -1, 2, 1, -1.5];

export default async function PhotosPage() {
  await connection();
  const photos = await getGuestPhotos();

  return (
    <>
      <PageHeader title="Photobooth" intro="Step into the booth, or add your own photos. Everything lands in one album for everyone to see." />

      <Booth />
      <div className="my-8 flex items-center gap-4 text-sm text-moss-soft">
        <span className="h-px flex-1 bg-lichen" />
        or
        <span className="h-px flex-1 bg-lichen" />
      </div>
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
                {p.uploader && <span className="block pt-2 text-center font-serif text-lg italic leading-none text-moss-soft">{p.uploader}</span>}
              </a>
            </Reveal>
          ))}
        </ul>
      )}
    </>
  );
}
