"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/guests", label: "Guests" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/photos", label: "Photos" },
  { href: "/admin/notes", label: "Songs & notes" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="mx-auto max-w-3xl overflow-x-auto px-2">
      <ul className="flex">
        {links.map((l) => {
          const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`block border-b-2 px-3 py-3 text-[0.95rem] font-medium whitespace-nowrap ${
                  active ? "border-fern text-fern-dark" : "border-transparent text-moss-soft"
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
