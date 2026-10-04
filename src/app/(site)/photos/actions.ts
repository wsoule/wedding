"use server";

import { revalidatePath } from "next/cache";
import { clientIp } from "@/lib/client-ip";
import { savePhoto } from "@/lib/photos";
import { createLimiter } from "@/lib/rate-limit";

// Anyone with the site can add photos (that's the point on the day); 40 an
// hour per device keeps one person from flooding it, and the couple can hide
// any photo from /admin/photos.
const uploads = createLimiter({ max: 40, windowMs: 60 * 60_000 });

export async function uploadGuestPhoto(form: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  const ip = await clientIp();
  if (uploads.blocked(ip)) return { ok: false, error: "That's a lot of photos! Take a breather and try again in a bit." };
  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a photo first." };
  try {
    await savePhoto(file, { kind: "guest", uploader: String(form.get("name") ?? ""), caption: String(form.get("caption") ?? "") });
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "That upload didn't work. Try again." };
  }
  uploads.hit(ip);
  revalidatePath("/photos");
  return { ok: true };
}
