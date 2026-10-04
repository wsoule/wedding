import "server-only";
import { headers } from "next/headers";

// The last X-Forwarded-For entry is the one Railway's proxy appended; earlier
// entries come from the client and can be made up.
export async function clientIp() {
  return (await headers()).get("x-forwarded-for")?.split(",").at(-1)?.trim() || "unknown";
}
