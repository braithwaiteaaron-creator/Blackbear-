import type { Metadata } from "next";
import Link from "next/link";
import "@/app/globals.css";
import { NavLinks } from "@/components/nav-links";

export const metadata: Metadata = {
  title: "GitHub Mastery Ecosystem",
  description:
    "Interactive GitHub assessment, badge certification, and learning platform.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link className="text-sm font-semibold tracking-tight sm:text-base" href="/">
              GitHub Mastery Ecosystem
            </Link>
            <NavLinks />
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
