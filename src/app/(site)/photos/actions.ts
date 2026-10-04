"use server";

import { revalidatePath } from "next/cache";
import { clientIp } from "@/lib/client-ip";
import { savePhoto, UploadError } from "@/lib/photos";
import { createLimiter } from "@/lib/rate-limit";

// Anyone with the site can add photos (that's the point on the day). Every
// attempt counts, successful or not: 40 an hour per device, and 600 an hour
// across the whole site, far above a real wedding but a ceiling on abuse.
// The couple can hide or delete any photo from /admin/photos.
const uploads = createLimiter({ max: 40, windowMs: 60 * 60_000 });
const allUploads = createLimiter({ max: 600, windowMs: 60 * 60_000 });

export async function uploadGuestPhoto(form: FormData): Promise<{ ok: true } | { ok: false; error: string }> {
  const ip = await clientIp();
  if (uploads.blocked(ip) || allUploads.blocked("all")) {
    return { ok: false, error: "That's a lot of photos! Take a breather and try again in a bit." };
  }
  uploads.hit(ip);
  allUploads.hit("all");
  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a photo first." };
  try {
    await savePhoto(file, { kind: "guest", uploader: String(form.get("name") ?? ""), caption: String(form.get("caption") ?? "") });
  } catch (e) {
    if (e instanceof UploadError) return { ok: false, error: e.message };
    console.error("[photo upload failed]", e);
    return { ok: false, error: "That upload didn't work. Try again." };
  }
  revalidatePath("/photos");
  return { ok: true };
}
