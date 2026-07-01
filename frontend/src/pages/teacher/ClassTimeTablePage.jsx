import { Fragment, useEffect, useMemo, useState } from "react";
import api from "../../services/api/client";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const PERIODS = [
  { no: 1, time: "08:00 - 08:45" },
  { no: 2, time: "08:45 - 09:30" },
  { no: 3, time: "09:30 - 10:15" },
  { no: 4, time: "10:15 - 11:00" },
  { no: 5, time: "11:00 - 11:45" },
  { no: 6, time: "12:15 - 01:00" },
  { no: 7, time: "01:00 - 01:45" },
  { no: 8, time: "01:45 - 02:30" },
];

const dayLookup = DAYS.reduce((acc, day) => {
  acc[day.toLowerCase()] = day;
  return acc;
}, {});

function SchoolBadge() {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
      <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none" aria-hidden="true">
        <path d="M32 5 52 12v17c0 13-8.4 23.2-20 29C20.4 52.2 12 42 12 29V12l20-7Z" fill="#ffffff" stroke="#0b55c8" strokeWidth="2.4" />
        <path d="M32 12 46 17v12c0 8.6-5.8 16.2-14 21-8.2-4.8-14-12.4-14-21V17l14-5Z" fill="#eff6ff" stroke="#0b55c8" strokeWidth="1.8" />
        <path d="M24 27c0-2.2 1.8-4 4-4h8c2.2 0 4 1.8 4 4v12H24V27Z" fill="#0b55c8" />
        <path d="M28 29h8M28 34h8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        <path d="M18 43c-2.4-2-4.1-5-5-8M46 43c2.4-2 4.1-5 5-8" stroke="#0b55c8" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function parseSchedule(schedule = "") {
  const lower = schedule.toLowerCase();
  const day = Object.keys(dayLookup).find((item) => lower.includes(item));
  const periodMatch = lower.match(/(?:period|lecture|lect|lec)\s*[-#:]*\s*(\d+)/i) || lower.match(/\bp\s*[-#:]*\s*(\d+)\b/i);
  const timeMatch = schedule.match(/\d{1,2}:\d{2}\s*(?:am|pm)?\s*(?:-|to)\s*\d{1,2}:\d{2}\s*(?:am|pm)?/i);

  return {
    day: day ? dayLookup[day] : "",
    period: periodMatch ? Number(periodMatch[1]) : null,
    time: timeMatch ? timeMatch[0].replace(/\s*to\s*/i, " - ") : "",
  };
}

function buildTimetable(assignments) {
  const grid = PERIODS.reduce((acc, period) => {
    acc[period.no] = DAYS.reduce((dayAcc, day) => {
      dayAcc[day] = null;
      return dayAcc;
    }, {});
    return acc;
  }, {});

  const fallbackSlots = [];
  PERIODS.forEach((period) => {
    DAYS.forEach((day) => fallbackSlots.push({ period: period.no, day }));
  });

  assignments.forEach((item, index) => {
    const parsed = parseSchedule(item.schedule || "");
    const fallback = fallbackSlots[index % fallbackSlots.length];
    const day = parsed.day || fallback.day;
    const period = parsed.period && grid[parsed.period] ? parsed.period : fallback.period;

    if (grid[period][day]) {
      const nextSlot = fallbackSlots.find((slot) => !grid[slot.period][slot.day]) || fallback;
      grid[nextSlot.period][nextSlot.day] = { ...item, parsed };
      return;
    }

    grid[period][day] = { ...item, parsed };
  });

  return grid;
}

export default function ClassTimeTablePage({ dark = false }) {
  const [teacherName, setTeacherName] = useState("");
  const [items, setItems] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [panelRes, classesRes] = await Promise.all([
          api.get("/teachers/my-panel"),
          api.get("/teacher-panel/classes", { params: { page: 1, limit: 100 } }),
        ]);

        setTeacherName(panelRes.data?.data?.teacher?.fullName || "");
        setItems(classesRes.data?.data?.items || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load class timetable");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const classOptions = useMemo(() => {
    const seen = new Set();
    return items.reduce((acc, item) => {
      const key = `${item.className}__${item.section || "A"}`;
      if (!seen.has(key)) {
        seen.add(key);
        acc.push({ key, className: item.className, section: item.section || "A" });
      }
      return acc;
    }, []);
  }, [items]);

  useEffect(() => {
    if (!selectedKey && classOptions.length) {
      setSelectedKey(classOptions[0].key);
    }
  }, [classOptions, selectedKey]);

  const selectedClass = classOptions.find((option) => option.key === selectedKey) || null;
  const selectedAssignments = useMemo(() => {
    if (!selectedClass) return [];
    return items.filter(
      (item) => item.className === selectedClass.className && (item.section || "A") === selectedClass.section
    );
  }, [items, selectedClass]);
  const timetable = useMemo(() => buildTimetable(selectedAssignments), [selectedAssignments]);

  if (loading) {
    return <p className={`text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Loading class timetable...</p>;
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>Class Time Table</h2>
          <p className={`mt-1 text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
            View saved class lectures and subject schedule.
          </p>
        </div>

        <select
          value={selectedKey}
          onChange={(event) => setSelectedKey(event.target.value)}
          className="h-11 rounded-xl border border-blue-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          {classOptions.length ? (
            classOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.className} - Section {option.section}
              </option>
            ))
          ) : (
            <option value="">No class assigned</option>
          )}
        </select>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="overflow-hidden rounded-xl border-4 border-blue-600 bg-white shadow-[0_18px_44px_rgba(37,99,235,0.14)]">
        <div className="relative overflow-hidden border-2 border-white bg-white">
          <div className="pointer-events-none absolute left-0 top-0 h-28 w-64 rounded-br-[100%] bg-blue-600" />
          <div className="pointer-events-none absolute left-4 top-2 h-24 w-80 rounded-br-[100%] border-t-4 border-white" />
          <div className="pointer-events-none absolute right-0 top-0 h-28 w-64 rounded-bl-[100%] bg-blue-600" />
          <div className="pointer-events-none absolute right-4 top-2 h-24 w-80 rounded-bl-[100%] border-t-4 border-white" />

          <div className="relative z-10 grid grid-cols-[5rem_1fr_5rem] items-start gap-4 px-5 pt-3">
            <SchoolBadge />
            <div className="text-center">
              <h3 className="text-4xl font-black uppercase leading-none tracking-wide text-blue-950">
                Teacher Wise Class Timetable
              </h3>
              <div className="mx-auto mt-2 max-w-xs bg-blue-700 px-6 py-1 text-2xl font-black uppercase text-white [clip-path:polygon(8%_0,92%_0,100%_100%,0_100%)]">
                Class: {selectedClass ? selectedClass.className : "-"}
              </div>
              <div className="mt-2 flex items-center justify-center gap-3 text-sm font-extrabold text-white">
                <span className="h-1 w-24 rounded-full bg-blue-700" />
                <span className="rounded-md bg-blue-700 px-8 py-1">
                  Class Teacher Incharge: {teacherName || "Teacher"}
                </span>
                <span className="h-1 w-24 rounded-full bg-blue-700" />
              </div>
            </div>
            <div />
          </div>

          <div className="relative z-10 px-3 pb-5 pt-3">
            <table className="w-full table-fixed border-collapse text-center text-blue-950">
              <thead>
                <tr className="bg-blue-800 text-white">
                  <th className="w-[9%] border border-blue-400 px-2 py-3 text-sm font-black uppercase">Period</th>
                  <th className="w-[12%] border border-blue-400 px-2 py-3 text-sm font-black uppercase">Time</th>
                  {DAYS.map((day) => (
                    <th key={day} className="border border-blue-400 px-2 py-3 text-sm font-black uppercase">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period) => (
                  <Fragment key={period.no}>
                    {period.no === 6 ? (
                      <tr key="break" className="bg-blue-50">
                        <td colSpan={8} className="border border-blue-300 px-3 py-2 text-xl font-black uppercase text-blue-800">
                          Break Time 11:45 AM - 12:15 PM
                        </td>
                      </tr>
                    ) : null}
                    <tr className="h-[72px]">
                      <td className="border border-blue-300 bg-blue-50 px-2 py-2 text-2xl font-black text-blue-700">
                        {period.no}
                      </td>
                      <td className="border border-blue-300 px-2 py-2 text-sm font-black">{period.time}</td>
                      {DAYS.map((day) => {
                        const cell = timetable[period.no]?.[day];
                        return (
                          <td key={`${period.no}-${day}`} className="border border-blue-300 px-2 py-2 align-middle">
                            {cell ? (
                              <div className="space-y-1">
                                <p className="text-sm font-black leading-tight">{cell.subject}</p>
                                {cell.parsed?.time || cell.schedule ? (
                                  <p className="text-[11px] font-bold leading-tight text-blue-700">
                                    {cell.parsed?.time || cell.schedule}
                                  </p>
                                ) : null}
                                {cell.roomNo ? (
                                  <p className="text-[11px] font-bold leading-tight text-slate-500">Room {cell.roomNo}</p>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-xl font-black text-blue-950">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>

            <div className="mx-auto mt-5 flex max-w-xl items-center justify-center rounded-md border border-blue-200 bg-white px-4 py-3 text-center text-sm font-semibold text-blue-950">
              Note: This timetable shows the saved subjects and schedules for the selected class.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
