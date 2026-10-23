import { getObject } from "@/lib/storage";

// Serves stored images. Keys are photo ids, so they never change once written.
export async function GET(_: Request, { params }: RouteContext<"/media/[key]">) {
  const { key } = await params;
  if (!/^[0-9a-f-]{36}(-sm)?\.webp$/i.test(key)) return new Response("Not found", { status: 404 });
  const body = await getObject(key);
  if (!body) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(body), {
    headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
