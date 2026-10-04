import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifyToken } from "./session";

export async function isAdmin() {
  const jar = await cookies();
  return verifyToken(jar.get(SESSION_COOKIE)?.value);
}

// Call at the top of every admin page and server action.
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
