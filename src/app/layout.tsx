import type { Metadata, Viewport } from "next";
import { Cormorant, Jost } from "next/font/google";
import { coupleNames, site } from "@/content/site";
import "./globals.css";

const cormorant = Cormorant({ subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"], variable: "--font-cormorant" });
const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });

export const metadata: Metadata = {
  title: { default: coupleNames, template: `%s · ${coupleNames}` },
  description: `${coupleNames} are getting married ${site.dateLabel} at ${site.venue.name}.`,
};

export const viewport: Viewport = {
  themeColor: "#f2f4ee",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
