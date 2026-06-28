import { useEffect, useMemo, useState } from "react";
import api from "../../services/api/client";

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DEFAULT_ROWS = [
  "ENGLISH",
  "URDU",
  "MATHEMATICS",
  "ISLAMIC STUDIES",
  "GENERAL SCIENCE",
  "SOCIAL STUDIES",
  "COMPUTER",
  "NAZRA",
];

const createRows = () =>
  DEFAULT_ROWS.map((subject) => ({
    id: crypto.randomUUID(),
    subject,
    syllabus: "",
    covered: "",
  }));

function SchoolBadge() {
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/85 text-blue-700">
      <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none" aria-hidden="true">
        <path d="M32 5 52 12v17c0 13-8.4 23.2-20 29C20.4 52.2 12 42 12 29V12l20-7Z" fill="#ffffff" stroke="#0b55c8" strokeWidth="2.4" />
        <path d="M32 12 46 17v12c0 8.6-5.8 16.2-14 21-8.2-4.8-14-12.4-14-21V17l14-5Z" fill="#eff6ff" stroke="#0b55c8" strokeWidth="1.8" />
        <path d="M32 22 24 26l8 4 8-4-8-4Z" fill="#0b55c8" />
        <path d="M27 31v5c0 1.7 2.3 3.1 5 3.1s5-1.4 5-3.1v-5" stroke="#0b55c8" strokeWidth="2" strokeLinecap="round" />
        <path d="M22 43c-3-2-5.1-5.4-6-9M42 43c3-2 5.1-5.4 6-9" stroke="#0b55c8" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function EditableCell({ value, onChange, className = "", multiline = false, placeholder = "" }) {
  const base =
    "w-full border-0 bg-transparent text-center font-bold uppercase text-blue-950 outline-none placeholder:text-blue-300";

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={2}
        className={`${base} min-h-14 resize-none py-2 text-sm leading-6 normal-case ${className}`}
      />
    );
  }

  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={`${base} ${className}`}
    />
  );
}

export default function MonthlySyllabusPage({ dark = false }) {
  const now = new Date();
  const [teacherName, setTeacherName] = useState("");
  const [classOptions, setClassOptions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [viewMode, setViewMode] = useState("MONTHLY");
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [monthTitle, setMonthTitle] = useState(MONTH_OPTIONS[now.getMonth()].toUpperCase());
  const [bookTitle, setBookTitle] = useState("BOOKS NAME");
  const [rowsByMonth, setRowsByMonth] = useState(() =>
    MONTH_OPTIONS.reduce((acc, _month, index) => {
      acc[index] = createRows();
      return acc;
    }, {})
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const classSectionOptions = useMemo(() => {
    const seen = new Set();
    return classOptions.filter((option) => {
      const key = `${option.className}__${option.section || "A"}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [classOptions]);

  const selectedClass = useMemo(
    () => classSectionOptions.find((option) => option._id === selectedClassId) || null,
    [classSectionOptions, selectedClassId]
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [panelRes, classesRes] = await Promise.all([
          api.get("/teachers/my-panel"),
          api.get("/teacher-panel/class-options"),
        ]);

        setTeacherName(panelRes.data?.data?.teacher?.fullName || "");
        setClassOptions(classesRes.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load monthly syllabus data");
        setClassOptions([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!selectedClassId && classSectionOptions.length) {
      setSelectedClassId(classSectionOptions[0]._id);
    }
  }, [classSectionOptions, selectedClassId]);

  const updateRow = (monthIndex, id, field, value) => {
    setRowsByMonth((current) => ({
      ...current,
      [monthIndex]: (current[monthIndex] || []).map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    }));
  };

  const monthsToShow = [selectedMonth];

  const printSyllabus = () => {
    const printMonths = viewMode === "ANNUALLY" ? MONTH_OPTIONS.map((_month, index) => index) : [selectedMonth];
    const selectedClassLabel = selectedClass ? `${selectedClass.className} ${selectedClass.section || "A"}` : "No Class";
    const content = printMonths
      .map((monthIndex) => {
        const rows = rowsByMonth[monthIndex] || [];
        const body = rows
          .map(
            (row) =>
              `<tr><td>${row.subject || ""}</td><td>${row.syllabus || ""}</td><td>${row.covered || ""}</td></tr>`
          )
          .join("");
        return `
          <section class="sheet">
            <h2>${MONTH_OPTIONS[monthIndex]} - ${bookTitle}</h2>
            <p><strong>Class:</strong> ${selectedClassLabel} &nbsp; <strong>Teacher:</strong> ${teacherName || "Teacher"}</p>
            <table><thead><tr><th>Books/Subjects</th><th>Syllabus</th><th>Covered%</th></tr></thead><tbody>${body}</tbody></table>
          </section>
        `;
      })
      .join("");
    const win = window.open("", "_blank", "width=1100,height=800");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Syllabus</title>
          <style>
            body{font-family:Inter,Segoe UI,Arial,sans-serif;color:#172554;padding:24px}
            .sheet{page-break-after:always;border:4px solid #1d4ed8;padding:18px;margin-bottom:20px}
            h2{text-align:center;text-transform:uppercase;font-size:30px;margin:0 0 10px}
            table{width:100%;border-collapse:collapse;margin-top:12px}
            th{background:#1d4ed8;color:white;text-transform:uppercase}
            th,td{border:1px solid #3b82f6;padding:10px;font-weight:700;vertical-align:top}
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  };

  const renderSyllabusTable = (monthIndex) => {
    const rows = rowsByMonth[monthIndex] || [];

    return (
      <div key={monthIndex} className={viewMode === "ANNUALLY" ? "mb-8 last:mb-0" : ""}>
        {viewMode === "ANNUALLY" ? (
          <div className="mb-3 rounded-md bg-blue-700 px-4 py-2 text-center text-xl font-black uppercase text-white">
            {MONTH_OPTIONS[monthIndex]} Syllabus
          </div>
        ) : null}
        <table className="w-full table-fixed border-collapse text-blue-950">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="w-[13%] border border-blue-500 px-2 py-3 text-sm font-black uppercase">Books/Subjects</th>
              <th className="w-[79%] border border-blue-500 px-3 py-3 text-sm font-black uppercase">Syllabus</th>
              <th className="w-[8%] border border-blue-500 px-1 py-3 text-sm font-black uppercase">Covered%</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="h-[58px]">
                <td className="border border-blue-500 px-2 py-2 align-middle">
                  <EditableCell value={row.subject} onChange={(value) => updateRow(monthIndex, row.id, "subject", value)} />
                </td>
                <td className="border border-blue-500 px-3 py-2 align-middle">
                  <EditableCell
                    value={row.syllabus}
                    onChange={(value) => updateRow(monthIndex, row.id, "syllabus", value)}
                    multiline
                    placeholder={`Write ${MONTH_OPTIONS[monthIndex]} syllabus here`}
                  />
                </td>
                <td className="border border-blue-500 px-1 py-2 align-middle">
                  <EditableCell
                    value={row.covered}
                    onChange={(value) => updateRow(monthIndex, row.id, "covered", value)}
                    className="text-lg"
                    placeholder="0%"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return <p className={`text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Loading monthly syllabus...</p>;
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>Monthly Syllabus</h2>
          <p className={`mt-1 text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
            Create class-wise monthly syllabus coverage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl border border-blue-200 bg-white p-1">
            {["MONTHLY", "ANNUALLY"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`rounded-lg px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition ${
                  viewMode === mode ? "bg-blue-700 text-white" : "text-blue-700 hover:bg-blue-50"
                }`}
              >
                {mode === "MONTHLY" ? "Monthly" : "Annually"}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={printSyllabus}
            className="rounded-xl bg-blue-700 px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-white"
          >
            Print Syllabus
          </button>
          <label className={`text-xs font-bold uppercase tracking-[0.12em] ${dark ? "text-[#9e9e9e]" : "text-blue-700"}`}>
            Month Select
          </label>
          <select
            value={selectedMonth}
            onChange={(event) => {
              const nextMonth = Number(event.target.value);
              setSelectedMonth(nextMonth);
              setMonthTitle(MONTH_OPTIONS[nextMonth].toUpperCase());
            }}
            className="h-11 rounded-xl border border-blue-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            {MONTH_OPTIONS.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="overflow-hidden rounded-xl border-4 border-blue-600 bg-white shadow-[0_18px_44px_rgba(37,99,235,0.14)]">
        <div className="relative overflow-hidden border-2 border-white bg-white">
          <div className="pointer-events-none absolute left-0 top-0 h-28 w-60 rounded-br-[100%] bg-blue-600" />
          <div className="pointer-events-none absolute left-5 top-2 h-24 w-72 rounded-br-[100%] border-t-4 border-white" />
          <div className="pointer-events-none absolute right-0 top-0 h-28 w-60 rounded-bl-[100%] bg-blue-600" />
          <div className="pointer-events-none absolute right-5 top-2 h-24 w-72 rounded-bl-[100%] border-t-4 border-white" />
          <div className="pointer-events-none absolute left-56 top-0 h-12 w-28 bg-[radial-gradient(circle,#60a5fa_1px,transparent_1.5px)] [background-size:8px_8px] opacity-45" />
          <div className="pointer-events-none absolute right-56 top-0 h-12 w-28 bg-[radial-gradient(circle,#60a5fa_1px,transparent_1.5px)] [background-size:8px_8px] opacity-45" />

          <div className="relative z-10 grid grid-cols-[8rem_1fr_8rem] items-start gap-4 px-7 pt-3">
            <div className="flex justify-center">
              <SchoolBadge />
            </div>

            <div className="pt-1 text-center">
              <div className="mx-auto flex max-w-xl items-center justify-center gap-3">
                <input
                  value={monthTitle}
                  onChange={(event) => setMonthTitle(event.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent text-right text-4xl font-black uppercase leading-none tracking-wide text-blue-950 outline-none"
                  aria-label="Month name"
                />
                <span className="text-4xl font-black leading-none text-blue-950">-</span>
                <input
                  value={bookTitle}
                  onChange={(event) => setBookTitle(event.target.value)}
                  className="min-w-0 flex-1 border-0 bg-transparent text-left text-4xl font-black uppercase leading-none tracking-wide text-blue-950 outline-none"
                  aria-label="Books name"
                />
              </div>

              <div className="mt-2 inline-flex items-center rounded-md bg-blue-600 px-7 py-0.5 text-2xl font-black uppercase text-white">
                Class: {selectedClass ? `${selectedClass.className} ${selectedClass.section || "A"}` : "No Class"}
              </div>

              <div className="mt-1 flex items-center justify-center gap-2 text-sm font-extrabold uppercase text-blue-950">
                <span className="h-px w-32 bg-blue-600" />
                <span>
                  Class Teacher Incharge: {teacherName || "Teacher"}
                </span>
                <span className="h-px w-32 bg-blue-600" />
              </div>
            </div>

            <div className="flex justify-center">
              <SchoolBadge />
            </div>
          </div>

          <div className="relative z-10 px-2 pb-9 pt-2">
            {monthsToShow.map((monthIndex) => renderSyllabusTable(monthIndex))}
          </div>
        </div>
      </div>
    </section>
  );
}
