import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wyat & Jaden · May 22, 2027",
  description:
    "Wyat Soule & Jaden Corliss · May 22, 2027 · Little Flower Barn, Lake Isabella, Michigan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" data-floral="subtle">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Pinyon+Script&family=Tangerine:wght@400;700&family=Parisienne&family=Petit+Formal+Script&family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Cardo:ital,wght@0,400;1,400&family=Prata&display=swap"
        />
        <Script src="/image-slot.js" strategy="beforeInteractive" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
