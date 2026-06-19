import { useCallback, useEffect, useState } from "react";
import api from "../services/api/client";

const statusStyles = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  ABSENT: "bg-rose-100 text-rose-700",
  LATE: "bg-amber-100 text-amber-700",
  LEAVE: "bg-sky-100 text-sky-700",
  UNMARKED: "bg-slate-100 text-slate-600",
};

const statusLabels = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  LEAVE: "On Leave",
  UNMARKED: "Not Marked",
};

function toDateInputValue(date = new Date()) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export default function TimeAttendancePage() {
  const [date, setDate] = useState(toDateInputValue());
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalTeachers: 0,
    presentTeachers: 0,
    absentTeachers: 0,
    onLeave: 0,
    unmarked: 0,
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAttendance = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/teacher-attendance", { params: { date } });
      setItems(data.data?.items || []);
      setStats(data.data?.stats || {});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load teacher attendance");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const markAttendance = async (teacherId, status) => {
    setMarkingId(teacherId);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post("/teacher-attendance/mark", {
        teacherId,
        status,
        date,
      });
      setStats(data.data?.stats || stats);
      setSuccess(`Teacher marked as ${statusLabels[status] || status.toLowerCase()}.`);
      await loadAttendance();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update attendance");
    } finally {
      setMarkingId(null);
    }
  };

  const filtered = items.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      item.fullName?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q)
    );
  });

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="premium-title text-2xl font-semibold">Time & Attendance</h2>
          <p className="text-sm text-sky-800/70">
            Mark teacher attendance from Teachers Management. Dashboard stats update automatically.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-600">
            Date
            <input
              type="date"
              className="premium-input ml-2"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
          <input
            className="premium-input min-w-[220px]"
            placeholder="Search teacher by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: "Total Teachers", value: stats.totalTeachers ?? 0, tone: "text-sky-700" },
          { label: "Present", value: stats.presentTeachers ?? 0, tone: "text-emerald-700" },
          { label: "Absent", value: stats.absentTeachers ?? 0, tone: "text-rose-700" },
          { label: "On Leave", value: stats.onLeave ?? 0, tone: "text-sky-700" },
          { label: "Not Marked", value: stats.unmarked ?? 0, tone: "text-slate-600" },
        ].map((card) => (
          <div key={card.label} className="premium-card p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className={`mt-1 text-2xl font-bold ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}

      <div className="premium-card overflow-hidden p-0">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">Teachers</h3>
          <p className="text-xs text-slate-500">Teachers are loaded from Teachers Management.</p>
        </div>

        {loading ? (
          <p className="px-5 py-8 text-sm text-slate-500">Loading teachers...</p>
        ) : !filtered.length ? (
          <p className="px-5 py-8 text-sm text-slate-500">
            {items.length ? "No teachers match your search." : "No active teachers found. Add teachers from Teachers Management."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Teacher Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((teacher) => {
                  const isMarking = markingId === teacher.teacherId;
                  return (
                    <tr key={teacher.teacherId} className="border-t border-slate-100">
                      <td className="px-5 py-3 font-medium text-slate-800">{teacher.fullName}</td>
                      <td className="px-5 py-3 text-slate-600">{teacher.email}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[teacher.status] || statusStyles.UNMARKED}`}
                        >
                          {statusLabels[teacher.status] || teacher.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {teacher.status === "UNMARKED" ? (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={isMarking}
                              onClick={() => markAttendance(teacher.teacherId, "PRESENT")}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Mark Present
                            </button>
                            <button
                              type="button"
                              disabled={isMarking}
                              onClick={() => markAttendance(teacher.teacherId, "ABSENT")}
                              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                            >
                              Mark Absent
                            </button>
                            <button
                              type="button"
                              disabled={isMarking}
                              onClick={() => markAttendance(teacher.teacherId, "LEAVE")}
                              className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
                            >
                              On Leave
                            </button>
                          </div>
                        ) : (
                          <p className="text-right text-xs text-slate-500">
                            {isMarking ? "Saving..." : "Marked for today"}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
