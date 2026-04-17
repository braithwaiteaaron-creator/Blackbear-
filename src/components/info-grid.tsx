"use client";

type InfoItem = {
  title: string;
  description: string;
};

type InfoGridProps = {
  title?: string;
  subtitle?: string;
  items: InfoItem[];
};

export function InfoGrid({ title, subtitle, items }: InfoGridProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {title || subtitle ? (
        <header className="space-y-1">
          {title ? <h2 className="text-xl font-semibold text-slate-900">{title}</h2> : null}
          {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
        </header>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <h3 className="font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-700">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
