type DashboardItem = {
  title: string;
  body: string;
};

type DashboardGridProps = {
  title?: string;
  description?: string;
  items: DashboardItem[];
};

export function DashboardGrid({ title, description, items }: DashboardGridProps) {
  return (
    <section className="space-y-4">
      {title ? (
        <header className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-2 text-sm text-slate-700">{description}</p>
          ) : null}
        </header>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm text-slate-700">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
