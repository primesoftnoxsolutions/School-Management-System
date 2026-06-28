import { useEffect, useMemo, useState } from "react";
import api from "../../services/api/client";

const DEFAULT_DUTIES = [
  "Assembly Duty (Morning)",
  "Neatness Check of Classrooms",
  "Student Attendance Check",
  "Uniform Check",
  "Corridor Monitoring",
  "Discipline Monitoring",
  "Classroom Supervision",
  "Library Duty",
  "Canteen Duty",
  "Gate Duty",
  "Other Duties (If Any)",
];

function SchoolBadge() {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-blue-700">
      <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none" aria-hidden="true">
        <path d="M32 5 52 12v17c0 13-8.4 23.2-20 29C20.4 52.2 12 42 12 29V12l20-7Z" fill="#ffffff" stroke="#0b55c8" strokeWidth="2.4" />
        <path d="M32 12 46 17v12c0 8.6-5.8 16.2-14 21-8.2-4.8-14-12.4-14-21V17l14-5Z" fill="#eff6ff" stroke="#0b55c8" strokeWidth="1.8" />
        <path d="M24 27c0-2.2 1.8-4 4-4h8c2.2 0 4 1.8 4 4v12H24V27Z" fill="#0b55c8" />
        <path d="M28 29h8M28 34h8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 43c-2.4-2-4.1-5-5-8M46 43c2.4-2 4.1-5 5-8" stroke="#0b55c8" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeWidth="3" />
    </svg>
  );
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDay(value) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" })
    .format(new Date(`${value}T00:00:00`))
    .toUpperCase();
}

export default function AssignedDutiesPage({ dark = false }) {
  const [teacherName, setTeacherName] = useState("");
  const [selectedDate, setSelectedDate] = useState(() => toInputDate(new Date()));
  const [assignedDuties, setAssignedDuties] = useState([]);
  const [checkedDuties, setCheckedDuties] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const safeSelectedDate = selectedDate || toInputDate(new Date());

  useEffect(() => {
    const loadTeacher = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/teachers/my-panel");
        setTeacherName(data?.data?.teacher?.fullName || "");
        const duties = data?.data?.assignedDuties || data?.data?.teacher?.assignedDuties || [];
        setAssignedDuties(Array.isArray(duties) ? duties : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load assigned duties");
      } finally {
        setLoading(false);
      }
    };

    loadTeacher();
  }, []);

  const dayName = useMemo(() => formatDay(safeSelectedDate), [safeSelectedDate]);
  const displayDate = useMemo(() => formatDate(safeSelectedDate), [safeSelectedDate]);

  const visibleDuties = useMemo(
    () => assignedDuties.map((duty) => (typeof duty === "string" ? duty : duty.title || duty.name || duty.duty || "Assigned Duty")),
    [assignedDuties]
  );

  const markDutiesCompleted = () => {
    setMarkedDates((current) => ({
      ...current,
      [safeSelectedDate]: {
        completedAt: new Date().toLocaleString(),
        completedCount: Object.values(checkedDuties).filter(Boolean).length,
      },
    }));
  };

  const markedRecord = markedDates[safeSelectedDate];

  if (loading) {
    return <p className={`text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Loading assigned duties...</p>;
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>Assigned Duties</h2>
          <p className={`mt-1 text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
            View your duties for the selected date.
          </p>
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-800 shadow-sm">
          Date
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none"
          />
        </label>

        <button
          type="button"
          onClick={markDutiesCompleted}
          className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-black uppercase text-white shadow-sm transition hover:bg-blue-800"
        >
          Mark Duties Completed
        </button>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="overflow-hidden rounded-xl border-4 border-blue-600 bg-white shadow-[0_18px_44px_rgba(37,99,235,0.14)]">
        <div className="relative overflow-hidden border-2 border-white bg-white px-8 pb-5 pt-3 text-blue-950">
          <div className="pointer-events-none absolute left-0 top-0 h-36 w-64 rounded-br-[100%] bg-blue-600" />
          <div className="pointer-events-none absolute left-5 top-2 h-32 w-80 rounded-br-[100%] border-t-4 border-white" />
          <div className="pointer-events-none absolute right-0 top-0 h-36 w-64 rounded-bl-[100%] bg-blue-600" />
          <div className="pointer-events-none absolute right-5 top-2 h-32 w-80 rounded-bl-[100%] border-t-4 border-white" />
          <div className="pointer-events-none absolute left-16 top-10 h-28 w-28 bg-[radial-gradient(circle,#60a5fa_1px,transparent_1.5px)] [background-size:8px_8px] opacity-50" />
          <div className="pointer-events-none absolute right-16 top-10 h-28 w-28 bg-[radial-gradient(circle,#60a5fa_1px,transparent_1.5px)] [background-size:8px_8px] opacity-50" />

          <div className="relative z-10 grid grid-cols-[8rem_1fr_8rem] items-start gap-4">
            <div className="flex justify-center">
              <SchoolBadge />
            </div>
            <div className="text-center">
              <h3 className="text-4xl font-black uppercase leading-none tracking-wide text-blue-950">
                Teacher Assigned Duties
              </h3>
              <div className="mx-auto mt-3 max-w-sm bg-blue-700 px-8 py-1 text-xl font-black italic text-white [clip-path:polygon(6%_0,94%_0,100%_100%,0_100%)]">
                Your Duties For The Day
              </div>
            </div>
            <div className="flex justify-center">
              <SchoolBadge />
            </div>
          </div>

          <div className="relative z-10 mx-auto mt-4 flex max-w-xl items-center justify-center gap-4 rounded-md bg-blue-50/70 px-5 py-3 text-sm font-black uppercase">
            <span className="text-blue-800">Teacher Name:</span>
            <span className="min-w-44 border-b border-blue-300 pb-1 text-center normal-case text-slate-950">
              {teacherName || "Teacher"}
            </span>
          </div>

          <div className="relative z-10 mt-3 grid overflow-hidden rounded-md border border-blue-300 md:grid-cols-2">
            <div className="flex items-center gap-5 border-b border-blue-200 px-16 py-3 md:border-b-0 md:border-r">
              <span className="text-blue-700">
                <CalendarIcon />
              </span>
              <span className="text-base font-black uppercase text-blue-800">Date:</span>
              <span className="text-base font-bold text-slate-950">{displayDate}</span>
            </div>
            <div className="flex items-center gap-5 px-16 py-3">
              <span className="text-blue-700">
                <CalendarIcon />
              </span>
              <span className="text-base font-black uppercase text-blue-800">Day:</span>
              <span className="text-base font-black text-slate-950">{dayName}</span>
            </div>
          </div>

          <div className="relative z-10 mt-3 overflow-hidden rounded-md border border-blue-400">
            <div className="bg-blue-800 py-1 text-center text-xl font-black uppercase text-white">Assigned Duties</div>
            <table className="w-full table-fixed border-collapse text-blue-950">
              <thead>
                <tr className="bg-blue-800 text-white">
                  <th className="w-[6%] border border-blue-400 px-1 py-2 text-sm font-black uppercase">Sr. #</th>
                  <th className="border border-blue-400 px-2 py-2 text-sm font-black uppercase">Duties</th>
                  <th className="w-[10%] border border-blue-400 px-2 py-2 text-sm font-black uppercase">Completed</th>
                </tr>
              </thead>
              <tbody>
                {visibleDuties.length ? (
                  visibleDuties.map((duty, index) => (
                    <tr key={duty} className="h-9">
                      <td className="border border-blue-300 px-1 py-1 text-center text-lg font-black text-blue-700">
                        {index + 1}
                      </td>
                      <td className="border border-blue-300 px-5 py-1 text-sm font-bold text-slate-950">{duty}</td>
                      <td className="border border-blue-300 px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(checkedDuties[`${safeSelectedDate}-${index}`])}
                          onChange={(event) =>
                            setCheckedDuties((current) => ({
                              ...current,
                              [`${safeSelectedDate}-${index}`]: event.target.checked,
                            }))
                          }
                          className="h-5 w-5 rounded-sm border-blue-500 text-blue-700"
                          aria-label={`Assigned ${duty}`}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="border border-blue-300 px-4 py-8 text-center text-sm font-bold text-slate-500">
                      No duties assigned yet. Duties will appear here when Super Admin assigns them.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="relative z-10 mt-5 grid gap-5 text-sm font-bold text-slate-950 md:grid-cols-[1.5fr_0.8fr]">
            <div className="flex items-center gap-3">
              <span className="rounded bg-blue-800 px-4 py-1 font-black uppercase text-white">Note:</span>
              <span className="flex-1 border-b border-blue-300 pb-1">
                {markedRecord
                  ? `Marked ${markedRecord.completedCount} duties completed at ${markedRecord.completedAt}.`
                  : visibleDuties.length
                    ? "Please ensure all assigned duties are completed sincerely."
                    : "No duties assigned by Super Admin for this date."}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-black uppercase text-blue-800">Signature:</span>
              <span className="flex-1 border-b border-blue-300 pb-1">&nbsp;</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
