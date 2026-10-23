import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, EB_Garamond, Pinyon_Script } from "next/font/google";
import { coupleNames, site } from "@/content/site";
import "./globals.css";

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["300", "400", "500", "600"], style: ["normal", "italic"], variable: "--font-cormorant-garamond" });
const garamond = EB_Garamond({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-eb-garamond" });
const pinyon = Pinyon_Script({ subsets: ["latin"], weight: "400", variable: "--font-pinyon" });

export const metadata: Metadata = {
  title: { default: coupleNames, template: `%s · ${coupleNames}` },
  description: `${coupleNames} are getting married ${site.dateLabel} at ${site.venue.name}.`,
};

export const viewport: Viewport = {
  themeColor: "#f7f2ea",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${garamond.variable} ${pinyon.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
