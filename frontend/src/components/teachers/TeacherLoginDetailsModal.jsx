import { useState } from "react";

function StatusPill({ active, dark = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? dark
            ? "bg-emerald-500/15 text-emerald-300"
            : "bg-emerald-50 text-emerald-700"
          : dark
            ? "bg-white/[0.06] text-slate-300"
            : "bg-slate-100 text-slate-600"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : dark ? "bg-slate-400" : "bg-slate-400"}`} />
      {active ? "Active Account" : "Inactive Account"}
    </span>
  );
}

function IconEye({ open = false }) {
  return open ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4l16 16" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.2 6.2C4 7.7 2.7 9.9 2 12c1.2 4 5 7 10 7 1.7 0 3.2-.3 4.6-.9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 5.2C10.3 5.1 11.1 5 12 5c5 0 8.8 3 10 7-.6 1.9-1.6 3.6-3 5" />
    </svg>
  );
}

export default function TeacherLoginDetailsModal({ teacher, dark = false }) {
  const [showPassword, setShowPassword] = useState(false);
  const loginPassword = teacher?.profile?.loginPassword || "";
  const initials =
    (teacher?.fullName || "T")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase() || "T";

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-4 ${dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-200 bg-white"}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
              {initials}
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-[0.18em] ${dark ? "text-slate-400" : "text-slate-500"}`}>
                Teacher Login Details
              </p>
              <h4 className={`mt-1 text-lg font-semibold ${dark ? "text-white" : "text-slate-900"}`}>{teacher?.fullName || "—"}</h4>
              <p className={`text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}>{teacher?.email || "—"}</p>
            </div>
          </div>
          <StatusPill active={teacher?.isActive} dark={dark} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`rounded-2xl border px-4 py-3 ${dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-200 bg-white"}`}>
          <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-slate-400" : "text-slate-500"}`}>Teacher Name</p>
          <p className={`mt-2 text-sm font-medium ${dark ? "text-white" : "text-slate-800"}`}>{teacher?.fullName || "—"}</p>
        </div>
        <div className={`rounded-2xl border px-4 py-3 ${dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-200 bg-white"}`}>
          <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-slate-400" : "text-slate-500"}`}>Email ID</p>
          <p className={`mt-2 text-sm font-mono ${dark ? "text-white" : "text-slate-800"}`}>{teacher?.email || "—"}</p>
        </div>
      </div>

      <div className={`rounded-2xl border p-4 ${dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-200 bg-white"}`}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-slate-400" : "text-slate-500"}`}>Login Password</p>
            <p className={`mt-1 text-xs ${dark ? "text-slate-500" : "text-slate-500"}`}>Private credential</p>
          </div>
          {loginPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                dark
                  ? "border-white/[0.08] bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <IconEye open={showPassword} />
              {showPassword ? "Hide" : "Show"}
            </button>
          ) : null}
        </div>

        <div className={`mt-3 rounded-xl border px-4 py-3 ${dark ? "border-white/[0.06] bg-[#1a1b26]" : "border-slate-200 bg-slate-50"}`}>
          <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-slate-400" : "text-slate-500"}`}>Value</p>
          <p className={`mt-2 break-all font-mono text-sm ${dark ? "text-white" : "text-slate-800"}`}>
            {loginPassword ? (showPassword ? loginPassword : "••••••••••") : "Not recorded"}
          </p>
        </div>
      </div>
    </div>
  );
}
