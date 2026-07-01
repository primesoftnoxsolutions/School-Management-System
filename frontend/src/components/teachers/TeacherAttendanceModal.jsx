import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../services/api/client";
import { SUBJECT_OPTIONS } from "../../constants/classes";
import ModernDatePicker from "../ui/ModernDatePicker";

function toDateInputValue(date = new Date()) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function buildDemoDateOptions(count = 7) {
  const options = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const value = toDateInputValue(date);
    const label =
      i === 0
        ? "Today"
        : i === 1
          ? "Yesterday"
          : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    options.push({ value, label });
  }
  return options;
}
function subjectSortIndex(subject) {
  const idx = SUBJECT_OPTIONS.indexOf(subject || "Class Teacher");
  return idx === -1 ? SUBJECT_OPTIONS.length : idx;
}

function getAssignmentColumns(assignedClasses = []) {
  if (!assignedClasses.length) {
    return { className: "—", section: "—", subjects: "—" };
  }

  const className = assignedClasses[0].className || "—";
  const section = assignedClasses[0].section || "A";
  const subjects = [
    ...new Set(
      assignedClasses
        .filter((row) => row.className === className && (row.section || "A") === section)
        .map((row) => row.subject)
        .filter(Boolean)
    ),
  ].sort((a, b) => subjectSortIndex(a) - subjectSortIndex(b));

  return {
    className,
    section,
    subjects: subjects.length ? subjects.join(", ") : "—",
  };
}

function getAssignmentColumnsV2(assignedClasses = []) {
  if (!assignedClasses.length) {
    return { className: "â€”", section: "â€”", subjects: "â€”" };
  }

  const classNames = [...new Set(assignedClasses.map((row) => row.className).filter(Boolean))];
  const sections = [...new Set(assignedClasses.map((row) => row.section || "A").filter(Boolean))];
  const subjectGroups = new Map();

  assignedClasses.forEach((row) => {
    const key = `${row.className || ""}|${row.section || "A"}`;
    if (!subjectGroups.has(key)) {
      subjectGroups.set(key, []);
    }
    if (row.subject && !subjectGroups.get(key).includes(row.subject)) {
      subjectGroups.get(key).push(row.subject);
    }
  });

  const subjects = [...subjectGroups.entries()]
    .map(([key, items]) => {
      const [className, section] = key.split("|");
      const label = `${className || "â€”"} ${section || "A"}`;
      const sortedSubjects = items.sort((a, b) => subjectSortIndex(a) - subjectSortIndex(b));
      return `${label}: ${sortedSubjects.join(", ") || "Class Teacher"}`;
    })
    .join(" | ");

  return {
    className: classNames.join(", ") || "â€”",
    section: sections.join(", ") || "â€”",
    subjects: subjects || "â€”",
  };
}

function AttendanceActionButton({ label, tone, active, disabled, onClick, dark }) {
  const tones = {
    present: active
      ? dark
        ? "border-[#4caf50]/40 bg-[#4caf50]/20 text-[#4caf50]"
        : "border-emerald-300 bg-emerald-100 text-emerald-800"
      : dark
        ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e] hover:border-[#4caf50]/30 hover:text-[#4caf50]"
        : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700",
    absent: active
      ? dark
        ? "border-[#e91e63]/40 bg-[#e91e63]/20 text-[#e91e63]"
        : "border-rose-300 bg-rose-100 text-rose-800"
      : dark
        ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e] hover:border-[#e91e63]/30 hover:text-[#e91e63]"
        : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-700",
    leave: active
      ? dark
        ? "border-[#26a69a]/40 bg-[#26a69a]/20 text-[#26a69a]"
        : "border-sky-300 bg-sky-100 text-sky-800"
      : dark
        ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e] hover:border-[#26a69a]/30 hover:text-[#26a69a]"
        : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-700",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex shrink-0 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${tones[tone]}`}
    >
      {label}
    </button>
  );
}

export default function TeacherAttendanceModal({
  dark = false,
  date,
  onDateChange,
  onAttendanceChange,
  refreshKey = 0,
}) {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const [error, setError] = useState("");
  const demoDates = useMemo(() => buildDemoDateOptions(7), []);
  const today = toDateInputValue();

  const loadRows = useCallback(async () => {
    if (!date) return;
    setLoading(true);
    setError("");
    try {
      const [teachersRes, attendanceRes] = await Promise.all([
        api.get("/teachers", { params: { page: 1, limit: 100 } }),
        api.get("/teacher-attendance", { params: { date } }),
      ]);

      const teachers = teachersRes.data?.data?.items || [];
      const attendanceItems = attendanceRes.data?.data?.items || [];
      const statusMap = new Map(
        attendanceItems.map((item) => [String(item.teacherId), item.status])
      );

      setStats(attendanceRes.data?.data?.stats || {});
      setRows(
        teachers.map((teacher) => ({
          teacherId: teacher._id,
          fullName: teacher.fullName,
          isActive: teacher.isActive !== false,
          status: statusMap.get(String(teacher._id)) || "UNMARKED",
          ...getAssignmentColumnsV2(teacher.assignedClasses),
        }))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load teacher attendance");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadRows();
  }, [loadRows, refreshKey]);
  const markAttendance = async (teacherId, status) => {
    setMarkingId(teacherId);
    setError("");
    try {
      const { data } = await api.post("/teacher-attendance/mark", {
        teacherId,
        status,
        date,
      });
      setStats(data.data?.stats || {});
      setRows((prev) =>
        prev.map((row) => (row.teacherId === teacherId ? { ...row, status } : row))
      );
      onAttendanceChange?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setMarkingId(null);
    }
  };

  const summaryCards = useMemo(
    () => [
      { label: "Present", value: stats.presentTeachers ?? 0, tone: dark ? "text-[#4caf50]" : "text-emerald-600" },
      { label: "Absent", value: stats.absentTeachers ?? 0, tone: dark ? "text-[#e91e63]" : "text-rose-600" },
      { label: "On Leave", value: stats.onLeave ?? 0, tone: dark ? "text-[#26a69a]" : "text-sky-600" },
      { label: "Not Marked", value: stats.unmarked ?? 0, tone: dark ? "text-[#9e9e9e]" : "text-slate-500" },
    ],
    [stats, dark]
  );

  const thClass = dark
    ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e]"
    : "border-slate-100 bg-slate-50/80 text-slate-500";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <ModernDatePicker
            label="Attendance date"
            value={date}
            max={today}
            dark={dark}
            onChange={onDateChange}
          />
          <div>
            <p className={`mb-2 text-xs font-medium ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
              Demo dates (daily attendance)
            </p>
            <div className="flex flex-wrap gap-2">
              {demoDates.map((item) => {
                const active = date === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onDateChange?.(item.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? dark
                          ? "bg-[#7c4dff] text-white"
                          : "bg-indigo-600 text-white"
                        : dark
                          ? "border border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {summaryCards.map((card) => (
            <span
              key={card.label}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                dark ? "border border-white/[0.06] bg-[#1a1b26]" : "border border-slate-200 bg-slate-50"
              }`}
            >
              <span className={dark ? "text-[#9e9e9e]" : "text-slate-500"}>{card.label}: </span>
              <span className={card.tone}>{card.value}</span>
            </span>
          ))}
        </div>
      </div>

      <p className={`text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
        Mark attendance for{" "}
        {new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { dateStyle: "medium" })}
      </p>
      {error ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            dark ? "border-[#e91e63]/30 bg-[#e91e63]/10 text-[#e91e63]" : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className={`py-8 text-center text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
          Loading teachers...
        </p>
      ) : !rows.length ? (
        <p className={`py-8 text-center text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
          No teachers found. Create teachers first.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-transparent">
          <table className="min-w-full text-sm">
            <thead>
              <tr className={`border-b text-left text-[11px] font-semibold uppercase tracking-wider ${thClass}`}>
                <th className="px-4 py-3">Teacher Name</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Section</th>
                <th className="px-4 py-3">Subjects</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isMarking = markingId === row.teacherId;
                const isMarked = row.status !== "UNMARKED";

                return (
                  <tr
                    key={row.teacherId}
                    className={dark ? "border-b border-white/[0.06]" : "border-b border-slate-100"}
                  >
                    <td className={`px-4 py-3 font-medium ${dark ? "text-white" : "text-slate-800"}`}>
                      {row.fullName}
                      {!row.isActive ? (
                        <span className={`ml-2 text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-400"}`}>
                          (Inactive)
                        </span>
                      ) : null}
                    </td>
                    <td className={`px-4 py-3 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>{row.className}</td>
                    <td className={`px-4 py-3 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>{row.section}</td>
                    <td className={`px-4 py-3 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>{row.subjects}</td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-nowrap justify-end gap-2 overflow-x-auto">
                        <AttendanceActionButton
                          label="Present"
                          tone="present"
                          dark={dark}
                          active={row.status === "PRESENT" || row.status === "LATE"}
                          disabled={
                            !row.isActive ||
                            isMarking ||
                            (isMarked && row.status !== "PRESENT" && row.status !== "LATE")
                          }
                          onClick={() => markAttendance(row.teacherId, "PRESENT")}
                        />
                        <AttendanceActionButton
                          label="Absent"
                          tone="absent"
                          dark={dark}
                          active={row.status === "ABSENT"}
                          disabled={!row.isActive || isMarking || (isMarked && row.status !== "ABSENT")}
                          onClick={() => markAttendance(row.teacherId, "ABSENT")}
                        />
                        <AttendanceActionButton
                          label="On Leave"
                          tone="leave"
                          dark={dark}
                          active={row.status === "LEAVE"}
                          disabled={!row.isActive || isMarking || (isMarked && row.status !== "LEAVE")}
                          onClick={() => markAttendance(row.teacherId, "LEAVE")}
                        />
                      </div>
                      {isMarking ? (
                        <p className={`mt-1 text-right text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-400"}`}>
                          Saving...
                        </p>
                      ) : !row.isActive ? (
                        <p className={`mt-1 text-right text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-400"}`}>
                          Inactive teacher
                        </p>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
