import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";

function PortalCard({ label, value, accent = "text-slate-900", dark = false }) {
  return (
    <div
      className={`rounded-3xl border px-5 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] ${
        dark ? "border-white/[0.06] bg-[#161722]" : "border-white/70 bg-white/90"
      }`}
    >
      <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
        {label}
      </p>
      <p className={`mt-2 text-lg font-semibold ${dark ? "text-white" : accent}`}>{value}</p>
    </div>
  );
}

function ActionTile({ title, text, icon, dark = false }) {
  return (
    <div
      className={`rounded-[28px] border p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ${
        dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-100 bg-white"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ background: "linear-gradient(135deg, #0b63d8, #0f8a56)" }}
        >
          {icon}
        </div>
        <div>
          <h3 className={`text-base font-semibold ${dark ? "text-white" : "text-slate-900"}`}>{title}</h3>
          <p className={`mt-1 text-sm leading-6 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>{text}</p>
        </div>
      </div>
    </div>
  );
}

export default function StudentPortalPage({ user, dark = false }) {
  const dispatch = useDispatch();
  const initials =
    `${user?.fullName || ""}`
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";

  return (
    <section
      className={`relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-[32px] border p-5 sm:p-6 ${
        dark ? "border-white/[0.06] bg-[#0b0c15]" : "border-white/60 bg-[radial-gradient(circle_at_top,#ffffff_0,#f5f9ff_45%,#edf3fb_100%)]"
      }`}
    >
      <div className="absolute inset-x-0 top-0 z-0 h-48 bg-[radial-gradient(circle_at_top_left,rgba(11,99,216,0.14),transparent_55%),radial-gradient(circle_at_top_right,rgba(15,138,86,0.16),transparent_42%)]" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[28px] border px-5 py-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0b63d8]">Student Portal</p>
            <h1 className={`mt-1 text-3xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>
              Welcome back, {user?.fullName || "Student"}
            </h1>
            <p className={`mt-2 text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
              Your school profile, login details, and quick access cards in one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold text-white"
              style={{ background: "linear-gradient(135deg, #0b63d8, #0f8a56)" }}
            >
              {initials}
            </div>
            <button
              type="button"
              onClick={() => dispatch(logout())}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div
            className={`overflow-hidden rounded-[32px] border p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ${
              dark ? "border-white/[0.06] bg-[#161722]" : "border-white/70 bg-white/95"
            }`}
          >
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <PortalCard label="Student Name" value={user?.fullName || "-"} dark={dark} />
              <PortalCard label="Admission No" value={user?.admissionNo || "-"} dark={dark} />
              <PortalCard label="Class" value={user?.className || "-"} dark={dark} />
              <PortalCard label="Section" value={user?.section || "-"} dark={dark} />
            </div>

            <div className="mt-6 rounded-[28px] border border-dashed border-[#0b63d8]/20 bg-gradient-to-br from-[#eff6ff] to-white p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0b63d8]">Quick status</p>
                  <h2 className={`mt-2 text-2xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>Ready for class updates</h2>
                  <p className={`mt-2 text-sm leading-6 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
                    Student login is active. Fees, attendance, and academic records can be connected here as the portal grows.
                  </p>
                </div>
                <div className="rounded-[24px] bg-white px-5 py-4 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Login ID</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{user?.email || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <ActionTile
              title="Attendance"
              text="Daily attendance and presence tracking can be shown here."
              dark={dark}
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 6h14v14H5V6ZM8 4v4M16 4v4M5 10h14" />
                  <path d="m9 15 2 2 4-5" />
                </svg>
              }
            />
            <ActionTile
              title="Fee Summary"
              text="Fee status and payment progress can be surfaced for students and parents."
              dark={dark}
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 4h8l3 3v13H7V4Z" />
                  <path d="M15 4v4h3M10 12h5M10 16h5" />
                </svg>
              }
            />
            <ActionTile
              title="Notices"
              text="Announcements, homework, and school notices can be connected next."
              dark={dark}
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3 19 6v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" />
                  <path d="m9 12 2 2 4-5" />
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
