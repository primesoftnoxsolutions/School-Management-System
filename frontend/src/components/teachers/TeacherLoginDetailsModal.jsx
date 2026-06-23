import { useState } from "react";

function StatusPill({ active, dark = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? dark
            ? "bg-[#4caf50]/15 text-[#4caf50]"
            : "bg-emerald-50 text-emerald-700"
          : dark
            ? "bg-white/[0.06] text-[#9e9e9e]"
            : "bg-slate-100 text-slate-600"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : dark ? "bg-[#9e9e9e]" : "bg-slate-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function DetailRow({ label, value, dark = false, mono = false }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        dark ? "border-white/[0.06] bg-[#1a1b26]/60" : "border-slate-200 bg-slate-50/70"
      }`}
    >
      <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
        {label}
      </p>
      <p className={`mt-1 text-sm font-medium ${mono ? "font-mono" : ""} ${dark ? "text-white" : "text-slate-800"}`}>
        {value}
      </p>
    </div>
  );
}

export default function TeacherLoginDetailsModal({ teacher, dark = false }) {
  const [showPassword, setShowPassword] = useState(false);
  const loginPassword = teacher?.profile?.loginPassword || "";

  return (
    <div className="space-y-4">
      <DetailRow label="Teacher Name" value={teacher?.fullName || "—"} dark={dark} />
      <DetailRow label="Email ID" value={teacher?.email || "—"} dark={dark} />
      <div
        className={`rounded-xl border px-4 py-3 ${
          dark ? "border-white/[0.06] bg-[#1a1b26]/60" : "border-slate-200 bg-slate-50/70"
        }`}
      >
        <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
          Password
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p className={`flex-1 text-sm font-medium font-mono ${dark ? "text-white" : "text-slate-800"}`}>
            {loginPassword ? (showPassword ? loginPassword : "••••••••") : "Not recorded"}
          </p>
          {loginPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={`rounded-lg px-2 py-1 text-xs font-medium ${
                dark ? "text-[#7c4dff] hover:bg-white/[0.04]" : "text-indigo-600 hover:bg-indigo-50"
              }`}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          ) : null}
        </div>
      </div>
      <div
        className={`rounded-xl border px-4 py-3 ${
          dark ? "border-white/[0.06] bg-[#1a1b26]/60" : "border-slate-200 bg-slate-50/70"
        }`}
      >
        <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
          Status
        </p>
        <div className="mt-2">
          <StatusPill active={teacher?.isActive} dark={dark} />
        </div>
      </div>
    </div>
  );
}
