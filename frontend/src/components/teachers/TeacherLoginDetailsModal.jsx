import { useState } from "react";

function StatusPill({ active, dark = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        active
          ? dark
            ? "bg-emerald-500/15 text-emerald-300"
            : "bg-emerald-50 text-emerald-700"
          : dark
            ? "bg-white/[0.06] text-[#9e9e9e]"
            : "bg-slate-100 text-slate-600"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : dark ? "bg-[#9e9e9e]" : "bg-slate-400"}`} />
      {active ? "Active Account" : "Inactive Account"}
    </span>
  );
}

function DetailCard({ label, value, dark = false, mono = false }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        dark ? "border-white/[0.06] bg-[#1a1b26]/70" : "border-slate-200 bg-slate-50/70"
      }`}
    >
      <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
        {label}
      </p>
      <p className={`mt-2 text-sm font-medium ${mono ? "font-mono" : ""} ${dark ? "text-white" : "text-slate-800"}`}>{value}</p>
    </div>
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

  return (
    <div className="space-y-5">
      <div
        className={`overflow-hidden rounded-[28px] border ${
          dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-200 bg-white"
        }`}
      >
        <div
          className={`flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between ${
            dark
              ? "bg-[linear-gradient(135deg,rgba(124,77,255,0.22),rgba(22,23,34,0.92))]"
              : "bg-[linear-gradient(135deg,rgba(99,102,241,0.12),rgba(255,255,255,0.96))]"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#7c4dff] text-xl font-bold text-white shadow-lg shadow-[#7c4dff]/20">
              {(teacher?.fullName || "T")
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0] || "")
                .join("")
                .toUpperCase() || "T"}
            </div>
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${dark ? "text-[#cfc8ff]" : "text-indigo-600"}`}>
                Teacher Login Profile
              </p>
              <h4 className={`mt-1 text-[22px] font-semibold leading-tight ${dark ? "text-white" : "text-slate-900"}`}>
                {teacher?.fullName || "—"}
              </h4>
              <p className={`mt-1 text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>{teacher?.email || "—"}</p>
            </div>
          </div>
          <StatusPill active={teacher?.isActive} dark={dark} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <DetailCard label="Teacher Name" value={teacher?.fullName || "—"} dark={dark} />
        <DetailCard label="Email ID" value={teacher?.email || "—"} dark={dark} mono />
        <div
          className={`sm:col-span-2 rounded-[28px] border px-4 py-4 ${
            dark ? "border-white/[0.06] bg-[#1a1b26]/70" : "border-slate-200 bg-slate-50/70"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                Password
              </p>
              <p className={`mt-1 text-xs ${dark ? "text-[#7f8197]" : "text-slate-500"}`}>
                Keep these credentials private and share them securely.
              </p>
            </div>
            {loginPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  dark
                    ? "border-[#7c4dff]/25 bg-[#7c4dff]/10 text-[#cfc8ff] hover:bg-[#7c4dff]/15"
                    : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                <IconEye open={showPassword} />
                {showPassword ? "Hide Password" : "Show Password"}
              </button>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div
              className={`min-w-0 flex-1 rounded-2xl border px-4 py-3 ${
                dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-200 bg-white"
              }`}
            >
              <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                Login Password
              </p>
              <p className={`mt-2 break-all font-mono text-sm ${dark ? "text-white" : "text-slate-800"}`}>
                {loginPassword ? (showPassword ? loginPassword : "••••••••••") : "Not recorded"}
              </p>
            </div>
            <div className={`rounded-2xl border px-4 py-3 ${dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-200 bg-white"}`}>
              <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                Account
              </p>
              <div className="mt-2">
                <StatusPill active={teacher?.isActive} dark={dark} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
