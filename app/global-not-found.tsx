import type { Metadata } from "next";
import { NotFoundPage } from "@/components/not-found-page";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page not found — Marco Procopio",
  description: "The requested page could not be found.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <NotFoundPage />
        </ThemeProvider>
      </body>
    </html>
  );
}
