import type { Metadata, Viewport } from "next";
import { Figtree, Young_Serif } from "next/font/google";
import { coupleNames, site } from "@/content/site";
import "./globals.css";

const youngSerif = Young_Serif({ weight: "400", subsets: ["latin"], variable: "--font-young-serif" });
const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });

export const metadata: Metadata = {
  title: { default: coupleNames, template: `%s · ${coupleNames}` },
  description: `${coupleNames} are getting married ${site.dateLabel} at ${site.venue.name}.`,
};

export const viewport: Viewport = {
  themeColor: "#edf2e6",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${youngSerif.variable} ${figtree.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
