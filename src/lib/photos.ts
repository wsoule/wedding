import "server-only";
import { inArray } from "drizzle-orm";
import sharp from "sharp";
import { db } from "@/db/client";
import { photos, type Photo } from "@/db/schema";
import { putObject } from "./storage";

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

// Each photo is stored twice: a large version and a small one for grids.
// Phones send huge files with rotation in EXIF; this fixes the rotation,
// strips location data, and shrinks everything to webp.
export async function savePhoto(
  file: File,
  meta: { kind: "guest" | "site"; uploader?: string | null; caption?: string | null },
): Promise<Photo> {
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("That photo is too big. Try one under 15 MB.");
  const input = Buffer.from(await file.arrayBuffer());
  const base = sharp(input, { failOn: "none" }).rotate();
  const info = await base.metadata().catch(() => null);
  if (!info?.width) throw new Error("That file isn't a photo we can read. Try a JPEG or PNG.");

  const large = await base.clone().resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const small = await base.clone().resize({ width: 640, height: 640, fit: "inside", withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();

  const [row] = await db
    .insert(photos)
    .values({
      kind: meta.kind,
      width: large.info.width,
      height: large.info.height,
      uploader: meta.uploader?.trim().slice(0, 80) || null,
      caption: meta.caption?.trim().slice(0, 200) || null,
    })
    .returning();
  await Promise.all([putObject(`${row.id}.webp`, large.data, "image/webp"), putObject(`${row.id}-sm.webp`, small, "image/webp")]);
  return row;
}

export function photoUrl(id: string, size: "lg" | "sm" = "lg") {
  return `/media/${id}${size === "sm" ? "-sm" : ""}.webp`;
}

export async function getPhotosById(ids: (string | null)[]) {
  const wanted = ids.filter((id): id is string => !!id);
  if (wanted.length === 0) return new Map<string, Photo>();
  const rows = await db.select().from(photos).where(inArray(photos.id, wanted));
  return new Map(rows.map((r) => [r.id, r]));
}
