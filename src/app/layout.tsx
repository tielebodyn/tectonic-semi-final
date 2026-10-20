import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KBC Mantel",
  description: "Samen zorgen voor wie je graag ziet. De ouder houdt de sleutel.",
};

export const viewport: Viewport = {
  themeColor: "#0a2b57",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl-BE" className={`${figtree.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
