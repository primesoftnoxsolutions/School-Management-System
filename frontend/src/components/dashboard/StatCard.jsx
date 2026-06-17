const toneMap = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  purple: "bg-violet-50 text-violet-600",
  orange: "bg-orange-50 text-orange-600",
  rose: "bg-rose-50 text-rose-600",
  sky: "bg-sky-50 text-sky-600",
  amber: "bg-amber-50 text-amber-600",
};

export default function StatCard({ title, value, change, tone = "blue", icon: Icon }) {
  return (
    <article className="ref-card group flex items-start justify-between p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
        {change ? <p className="mt-2 text-xs font-medium text-emerald-600">{change}</p> : null}
      </div>
      <div
        className={`ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-105 ${toneMap[tone]}`}
      >
        {Icon ? <Icon /> : null}
      </div>
    </article>
  );
}
