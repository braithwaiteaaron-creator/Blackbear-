"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/components/nav-links";

type PageShellProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 md:px-8">
      <header className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              GitHub Mastery Ecosystem
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
          </div>
          <Link
            href="/quiz"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            Start Quiz
          </Link>
        </div>
      </header>

      <nav aria-label="Platform navigation" className="mb-8">
        <ul className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-3 lg:grid-cols-5">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-md px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <main>{children}</main>
    </div>
  );
}
