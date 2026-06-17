import { moduleTableData } from "../data/mockData";

export default function ModuleDataPage({ title }) {
  const moduleData = moduleTableData[title];

  if (!moduleData) {
    return (
      <div className="premium-card">
        <p className="text-sm text-slate-600">Module configuration not found.</p>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="premium-title text-xl font-semibold">{title}</h2>
        <p className="text-sm text-sky-800/70">
          Live-ready screen structure with populated sample data for UX and workflow testing.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {moduleData.stats.map((card) => (
          <article key={card.label} className="premium-card">
            <p className="text-xs uppercase tracking-wide text-sky-800/65">{card.label}</p>
            <h3 className="premium-title mt-2 text-xl font-semibold">{card.value}</h3>
          </article>
        ))}
      </div>

      <div className="premium-card">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder={`Search in ${title}`}
            className="premium-input w-full md:max-w-xs"
          />
          <input type="date" className="premium-input" />
          <input type="date" className="premium-input" />
          <button type="button" className="premium-btn">
            Apply Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-sky-100/60 text-left text-sky-900">
              <tr>
                {moduleData.headers.map((header) => (
                  <th key={header} className="px-4 py-3 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {moduleData.rows.map((row, index) => (
                <tr key={`${row[0]}-${index}`} className="border-t border-sky-100/80">
                  {row.map((cell, cellIndex) => (
                    <td key={`${cell}-${cellIndex}`} className="px-4 py-3 text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
