import type { Metadata } from "next";
import { connection } from "next/server";
import { FrameArt } from "@/components/botanicals";
import { PageHeader } from "@/components/page-header";
import { Print } from "@/components/print";
import { getStory } from "@/lib/data";
import { getPhotosById, photoUrl } from "@/lib/photos";

export const metadata: Metadata = { title: "Our story" };

export default async function StoryPage() {
  await connection();
  const items = await getStory();
  const photos = await getPhotosById(items.map((i) => i.photoId));

  return (
    <>
      <PageHeader title="Our story" intro="How Jaden & Wyat got here." />
      {items.length === 0 ? (
        <p className="text-center text-moss-soft">Our story is coming soon.</p>
      ) : (
        <ol className="space-y-14">
          {items.map((item, i) => {
            const photo = item.photoId ? photos.get(item.photoId) : undefined;
            const tilt = i % 2 ? 2 : -2;
            return (
              <li key={item.id} className={`flex flex-col ${i % 2 ? "items-end" : "items-start"}`}>
                <Print tilt={tilt} tape className="w-[82%]" innerClassName="pb-4">
                  <div className="aspect-[4/5] overflow-hidden bg-paper-deep">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl(photo.id)} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <FrameArt variant={i} />
                    )}
                  </div>
                  <p className="pt-3 text-center font-serif text-xl italic leading-none text-foxglove-dark">{item.when}</p>
                </Print>
                <div className={`mt-5 w-full ${i % 2 ? "text-right" : "text-left"}`}>
                  <h2 className="text-[2rem]">{item.title}</h2>
                  {item.body && <p className="mt-2 whitespace-pre-line text-moss-soft">{item.body}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
