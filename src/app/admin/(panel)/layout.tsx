import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-dvh bg-paper-deep/40">
      <header className="sticky top-0 z-30 border-b border-lichen bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 pt-3">
          <Link href="/admin" className="font-serif text-xl">
            Wedding admin
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-fern-dark underline underline-offset-4">
              View site
            </Link>
            <form action={logout}>
              <button className="text-moss-soft">Sign out</button>
            </form>
          </div>
        </div>
        <AdminNav />
      </header>
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-24">{children}</main>
    </div>
  );
}
