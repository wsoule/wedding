import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jaden & Wyat · May 22, 2027",
  description:
    "Jaden Corliss & Wyat Soule · May 22, 2027 · Little Flower Barn, Lake Isabella, Michigan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" data-floral="standard">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=Pinyon+Script&display=swap"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
