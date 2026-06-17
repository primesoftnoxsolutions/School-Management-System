import { superAdminKpis, teacherKpis, trendSeries } from "../data/mockData";

function SectionHeading({ title, subtitle }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div>
        <h3 className="premium-title text-xl font-semibold">{title}</h3>
        {subtitle ? <p className="text-xs text-sky-800/70">{subtitle}</p> : null}
      </div>
      <span className="rounded-full border border-sky-200 bg-white/70 px-3 py-1 text-[11px] font-medium text-sky-700">
        Live
      </span>
    </div>
  );
}

function SimpleTrendChart({ title, unit, keyName, colorClass }) {
  const maxValue = Math.max(...trendSeries.map((item) => item[keyName]));
  const latestValue = trendSeries[trendSeries.length - 1][keyName];

  return (
    <article className="premium-card relative overflow-hidden">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-sky-200/50 blur-2xl" />
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-sky-800/60">Last 6 months</p>
        </div>
        <div className="rounded-xl border border-sky-200 bg-white/80 px-3 py-1.5 text-right">
          <p className="text-[10px] uppercase tracking-wide text-sky-700/80">Latest</p>
          <p className="text-sm font-semibold text-slate-800">
            {latestValue}
            {unit}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {trendSeries.map((item) => {
          const width = Math.max((item[keyName] / maxValue) * 100, 10);
          return (
            <div key={`${title}-${item.month}`} className="grid grid-cols-[42px_1fr_62px] items-center gap-2">
              <span className="text-xs font-medium text-sky-800/70">{item.month}</span>
              <div className="relative h-2.5 rounded-full bg-sky-100/90">
                <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${width}%` }} />
                <span
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-sky-400 shadow-sm"
                  style={{ left: `calc(${width}% - 8px)` }}
                />
              </div>
              <span className="text-right text-xs font-medium text-slate-700">
                {item[keyName]}
                {unit}
              </span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

export default function RoleDashboard({ role }) {
  const isSuperAdmin = role === "SUPER_ADMIN";
  const kpis = isSuperAdmin ? superAdminKpis : teacherKpis;
  const teacherStats = kpis.filter((item) => item.label.toLowerCase().includes("teacher"));
  const studentStats = kpis.filter((item) => item.label.toLowerCase().includes("student"));
  const otherStats = kpis.filter(
    (item) =>
      !item.label.toLowerCase().includes("teacher") &&
      !item.label.toLowerCase().includes("student")
  );

  return (
    <section className="space-y-5">
      <div>
        <h2 className="premium-title text-3xl font-semibold">
          {isSuperAdmin ? "Super Admin Dashboard" : "Teacher Dashboard"}
        </h2>
        <p className="text-sm text-sky-800/70">
          {isSuperAdmin
            ? "System-wide KPIs, finance and operations overview."
            : "Classroom operations, attendance and workload snapshot."}
        </p>
      </div>

      {isSuperAdmin ? (
        <>
          <div>
            <SectionHeading title="Teacher Stats" subtitle="Attendance and presence overview" />
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {teacherStats.map((item) => (
                <article key={item.label} className="premium-card relative overflow-hidden py-3">
                  <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-sky-200/50 blur-xl" />
                  <p className="text-[11px] uppercase tracking-wide text-sky-800/65">{item.label}</p>
                  <h3 className="premium-title mt-1 text-2xl font-semibold">{item.value}</h3>
                </article>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading title="Student Stats" subtitle="Enrollment and daily attendance snapshot" />
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {studentStats.map((item) => (
                <article key={item.label} className="premium-card relative overflow-hidden py-3">
                  <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-cyan-200/50 blur-xl" />
                  <p className="text-[11px] uppercase tracking-wide text-sky-800/65">{item.label}</p>
                  <h3 className="premium-title mt-1 text-2xl font-semibold">{item.value}</h3>
                </article>
              ))}
            </div>
          </div>

          {otherStats.length ? (
            <div>
              <SectionHeading title="Other Stats" subtitle="Fee, leave and operational indicators" />
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {otherStats.map((item) => (
                  <article
                    key={item.label}
                    className="rounded-2xl border border-sky-200/80 bg-gradient-to-br from-white/90 to-sky-100/60 p-4 backdrop-blur-xl"
                  >
                    <p className="text-[11px] uppercase tracking-wide text-sky-900/70">{item.label}</p>
                    <h3 className="premium-title mt-1 text-2xl font-semibold">{item.value}</h3>
                    <p className="mt-1 text-xs text-sky-700/70">Operational status</p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {kpis.map((item) => (
            <article key={item.label} className="premium-card py-3">
              <p className="text-[11px] uppercase tracking-wide text-sky-800/65">{item.label}</p>
              <h3 className="premium-title mt-1 text-2xl font-semibold">{item.value}</h3>
            </article>
          ))}
        </div>
      )}

      {isSuperAdmin ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <SimpleTrendChart title="Monthly Admissions" unit="" keyName="admissions" colorClass="bg-sky-500" />
          <SimpleTrendChart title="Fee Collection Trend (M PKR)" unit="" keyName="fee" colorClass="bg-cyan-500" />
          <SimpleTrendChart title="Attendance Trend (%)" unit="%" keyName="attendance" colorClass="bg-blue-500" />
          <SimpleTrendChart title="Payroll Trend (M PKR)" unit="" keyName="payroll" colorClass="bg-sky-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <div className="premium-card">
            <h3 className="text-sm font-semibold text-slate-800">Teacher Actions</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {["Mark Attendance", "View Assigned Classes", "Update Academic Records", "Download Attendance Report"].map(
                (action) => (
                  <button
                    key={action}
                    type="button"
                    className="premium-btn-soft text-left"
                  >
                    {action}
                  </button>
                )
              )}
            </div>
          </div>
          <div className="premium-card">
            <h3 className="text-sm font-semibold text-slate-800">Today's Class Insights</h3>
            <div className="mt-3 space-y-3">
              {[
                ["Grade 8-A", "Attendance 94%"],
                ["Grade 7-B", "Homework pending: 11"],
                ["Grade 9-C", "Tests to check: 28"],
              ].map((item) => (
                <div key={item[0]} className="rounded-xl border border-sky-100 bg-white/70 px-3 py-2">
                  <p className="text-sm font-medium text-slate-800">{item[0]}</p>
                  <p className="text-xs text-sky-800/70">{item[1]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
