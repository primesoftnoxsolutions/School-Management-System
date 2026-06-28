import StudentActivityMonitor from "../components/students/StudentActivityMonitor";

export default function StudentAttendancePage({ dark = false, onToggleTheme }) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className={`text-2xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>Student Attendance</h2>
        <p className={`text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
          Search students and view their monthly attendance calendar.
        </p>
      </div>

      <div className={dark ? "rounded-2xl border border-white/[0.06] bg-[#161722]" : "ref-card p-0"}>
        <StudentActivityMonitor dark={dark} onToggleTheme={onToggleTheme} />
      </div>
    </section>
  );
}
