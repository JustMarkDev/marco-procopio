import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";

import "./redesign.css";
import { SITE_URL } from "@/lib/content";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  // Optical sizing tightens the large headlines, as in the design.
  axes: ["opsz"],
});

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Marco Procopio", template: "%s | Marco Procopio" },
  description: "Experimental redesign of Marco Procopio's site.",
  // Work in progress: keep it out of search results until it replaces the current site.
  robots: { index: false, follow: false },
};

/** Root layout for the experimental redesign under /redesign. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} ${hanken.variable} antialiased`}>{children}</body>
    </html>
  );
}
