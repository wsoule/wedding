"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/details", label: "Details", icon: ClockIcon },
  { href: "/rsvp", label: "RSVP", icon: null },
  { href: "/travel", label: "Travel", icon: BedIcon },
  { href: "/registry", label: "Registry", icon: GiftIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-lichen/70 bg-paper/90 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-[34rem] grid-cols-5 items-end px-2">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          if (!Icon) {
            return (
              <li key={href} className="flex justify-center">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className="-mt-5 mb-2 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-foxglove text-[0.8rem] font-semibold text-white shadow-[0_6px_18px_-6px_rgb(180_95_120/0.7)] ring-4 ring-paper transition active:scale-95"
                >
                  RSVP
                </Link>
              </li>
            );
          }
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[0.72rem] font-medium ${
                  active ? "text-fern-dark" : "text-moss-soft/80"
                }`}
              >
                <Icon active={active} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

type IconProps = { active: boolean };
const iconProps = (active: boolean) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: active ? 2 : 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

function HomeIcon({ active }: IconProps) {
  return (
    <svg {...iconProps(active)}>
      <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}
function ClockIcon({ active }: IconProps) {
  return (
    <svg {...iconProps(active)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}
function BedIcon({ active }: IconProps) {
  return (
    <svg {...iconProps(active)}>
      <path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" />
      <circle cx="7" cy="11" r="1.6" />
    </svg>
  );
}
function GiftIcon({ active }: IconProps) {
  return (
    <svg {...iconProps(active)}>
      <rect x="4" y="9" width="16" height="11" rx="1" />
      <path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9c2 0 6 1 6-1.5S14 5 12 9" />
    </svg>
  );
}
