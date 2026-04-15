"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/quiz", label: "Quiz" },
  { href: "/results", label: "Results" },
  { href: "/dashboard/results", label: "Dashboard" },
  { href: "/learn", label: "Learn" },
  { href: "/pricing", label: "Pricing" },
  { href: "/enterprise", label: "Enterprise" },
];

export const NAV = NAV_LINKS;

export function NavLinks() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isSignedIn = Boolean(session?.user?.email);

  return (
    <nav aria-label="Primary navigation" className="flex flex-wrap gap-3">
      {NAV_LINKS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-xl px-3 py-2 text-sm transition ${
              active
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => (isSignedIn ? signOut({ callbackUrl: "/" }) : signIn())}
        className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
      >
        {isSignedIn ? "Sign out" : "Sign in"}
      </button>
    </nav>
  );
}
