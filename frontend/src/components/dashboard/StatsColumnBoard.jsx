const toneStyles = {
  blue: { accent: "bg-blue-500" },
  green: { accent: "bg-emerald-500" },
  purple: { accent: "bg-violet-500" },
  orange: { accent: "bg-orange-500" },
  rose: { accent: "bg-rose-500" },
  sky: { accent: "bg-sky-500" },
  amber: { accent: "bg-amber-500" },
};

export function StatsRowCard({ title, value, tone = "blue", icon: Icon, unit = "" }) {
  const styles = toneStyles[tone] || toneStyles.blue;

  return (
    <article className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-slate-100 bg-white px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4">
      <span className={`absolute bottom-3 left-0 top-3 w-1 rounded-r-full ${styles.accent}`} />
      <div className="ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 sm:h-11 sm:w-11">
        {Icon ? <Icon /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">{title}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-2xl font-bold leading-none text-slate-900 sm:text-[1.65rem]">{value}</p>
        {unit ? <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">{unit}</p> : null}
      </div>
    </article>
  );
}

export function StatsColumnBoard({ title, subtitle, items = [] }) {
  return (
    <div className="ref-card p-5 sm:p-6">
      <div className="mb-5 border-b border-slate-100 pb-4">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <StatsRowCard
            key={item.label}
            title={item.label}
            value={item.value}
            tone={item.tone}
            icon={item.icon}
            unit={item.unit}
          />
        ))}
      </div>
    </div>
  );
}
