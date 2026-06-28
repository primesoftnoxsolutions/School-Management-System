import { useEffect, useMemo, useState } from "react";
import api from "../../services/api/client";
import AppointmentLetterModal from "../../components/teachers/AppointmentLetterModal";

const MONTHS = [
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

const toInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

<<<<<<< HEAD
export default function TeacherAcademicRecordsPage({ dark = false }) {
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [items, setItems] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [students, setStudents] = useState([]);
=======
const monthRange = (year, monthIndex) => ({
  from: toInputDate(new Date(year, monthIndex, 1)),
  to: toInputDate(new Date(year, monthIndex + 1, 0)),
});

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function StatusBadge({ status }) {
  const tones = {
    PRESENT: "bg-emerald-50 text-emerald-700 border-emerald-100",
    ABSENT: "bg-rose-50 text-rose-700 border-rose-100",
    LATE: "bg-amber-50 text-amber-700 border-amber-100",
    LEAVE: "bg-violet-50 text-violet-700 border-violet-100",
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase ${tones[status] || "bg-slate-50 text-slate-600 border-slate-100"}`}>
      {status || "No Record"}
    </span>
  );
}

export default function TeacherAcademicRecordsPage() {
  const now = new Date();
  const [teacherName, setTeacherName] = useState("");
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());
  const [attendance, setAttendance] = useState(null);
>>>>>>> 9c00412ab626e6b072a5de492d95634547634378
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
<<<<<<< HEAD
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [showAppointmentLetter, setShowAppointmentLetter] = useState(false);
=======
>>>>>>> 9c00412ab626e6b072a5de492d95634547634378

  const range = useMemo(() => monthRange(year, monthIndex), [year, monthIndex]);

  const loadAttendance = async () => {
    setLoading(true);
    setError("");
    try {
      const [panelRes, attendanceRes] = await Promise.all([
        api.get("/teachers/my-panel"),
        api.get("/teacher-panel/my-attendance/summary", {
          params: { fromDate: range.from, toDate: range.to },
        }),
      ]);
      setTeacherName(panelRes.data?.data?.teacher?.fullName || "");
      setAttendance(attendanceRes.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load teacher attendance records");
      setAttendance(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [range.from, range.to]);

  const totals = attendance?.totals || { present: 0, absent: 0, late: 0, leave: 0, marked: 0 };

  const cardClass = dark ? "rounded-2xl border border-white/[0.06] bg-[#161722]" : "ref-card";
  const inputClass = dark
    ? "w-full rounded-xl border border-white/[0.08] bg-[#1a1b26] px-3 py-2.5 text-sm text-white outline-none focus:border-[#7c4dff]/50"
    : "ref-input";
  const tableHeadClass = dark ? "bg-[#1a1b26] text-left text-[#9e9e9e]" : "bg-slate-50 text-left text-slate-500";
  const tableCellClass = dark ? "text-white" : "text-slate-700";
  const mutedClass = dark ? "text-[#9e9e9e]" : "text-slate-500";
  const borderClass = dark ? "border-white/[0.06]" : "border-slate-100";
  const primaryBtnClass = dark
    ? "rounded-xl bg-[#7c4dff] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#875cff] disabled:opacity-60"
    : "ref-btn-primary";
  const outlineBtnClass = dark
    ? "rounded-xl border border-white/[0.08] bg-transparent px-4 py-2.5 text-sm font-medium text-[#d7d2ff] hover:bg-white/[0.04]"
    : "ref-btn-outline";
  const dangerBtnClass = dark
    ? "rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/15"
    : "ref-btn-danger";

  return (
    <section className="space-y-6">
<<<<<<< HEAD
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`text-2xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>Academic</h2>
          <p className={`text-sm ${mutedClass}`}>Add, edit and manage student marks and grades.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAppointmentLetter(true)}
          className={primaryBtnClass}
        >
          Appointment Letter
        </button>
      </div>

      {error ? <p className={`text-sm ${dark ? "text-[#e91e63]" : "text-rose-600"}`}>{error}</p> : null}

      <form onSubmit={onSubmit} className={`${cardClass} grid grid-cols-1 gap-3 p-5 md:grid-cols-3`}>
        <select
          className={inputClass}
          value={classOptions.find((c) => c.className === form.className && c.section === form.section)?._id || ""}
          onChange={(e) => onClassSelect(e.target.value)}
          required={!editId}
        >
          <option value="">Select class</option>
          {classOptions.map((c) => (
            <option key={c._id} value={c._id}>
              {c.className} - {c.section} ({c.subject})
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={form.studentId}
          onChange={(e) => setForm({ ...form, studentId: e.target.value })}
          required={!editId}
          disabled={!form.className}
        >
          <option value="">Select student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.firstName} {s.lastName}
            </option>
          ))}
        </select>
        <input
          className={inputClass}
          placeholder="Exam type (Midterm, Final...)"
          value={form.examType}
          onChange={(e) => setForm({ ...form, examType: e.target.value })}
          required
        />
        <input
          className={inputClass}
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          required
        />
        <input
          type="number"
          className={inputClass}
          placeholder="Marks"
          value={form.marks}
          onChange={(e) => setForm({ ...form, marks: e.target.value })}
          required
          min="0"
        />
        <input
          type="number"
          className={inputClass}
          placeholder="Max marks"
          value={form.maxMarks}
          onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
          required
          min="1"
        />
        <input
          className={inputClass}
          placeholder="Grade (A, B, C...)"
          value={form.grade}
          onChange={(e) => setForm({ ...form, grade: e.target.value })}
        />
        <input
          className={`${inputClass} md:col-span-2`}
          placeholder="Remarks"
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
        />
        <div className="flex gap-2 md:col-span-3">
          <button type="submit" className={primaryBtnClass} disabled={saving}>
            {saving ? "Saving..." : editId ? "Update Record" : "Add Record"}
          </button>
          {editId ? (
            <button type="button" className={outlineBtnClass} onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className={`${cardClass} overflow-hidden p-0`}>
        <div className={`flex flex-wrap items-center gap-3 border-b px-5 py-4 ${borderClass}`}>
          <h3 className={`text-base font-semibold ${dark ? "text-white" : "text-slate-800"}`}>
            Records ({pagination.total})
          </h3>
          <input
            className={`${inputClass} ml-auto w-full max-w-xs`}
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(1, search)}
          />
          <button type="button" className={outlineBtnClass} onClick={() => load(1, search)}>
            Search
          </button>
        </div>
        <table className="min-w-full text-sm">
          <thead className={tableHeadClass}>
=======
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-950">Academic Records</h2>
          <p className="text-sm text-slate-500">Month-wise attendance record for this teacher portal.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="h-11 rounded-xl border border-blue-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none"
            value={monthIndex}
            onChange={(event) => setMonthIndex(Number(event.target.value))}
          >
            {MONTHS.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>
          <input
            type="number"
            className="h-11 w-28 rounded-xl border border-blue-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none"
            value={year}
            onChange={(event) => setYear(Number(event.target.value) || now.getFullYear())}
          />
        </div>
      </div>

      {error ? <p className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-5">
        {[
          ["Teacher", teacherName || "-"],
          ["Marked", totals.marked],
          ["Present", totals.present],
          ["Absent", totals.absent],
          ["Leave", totals.leave],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
            <p className="text-xs font-black uppercase tracking-[0.08em] text-blue-700">{label}</p>
            <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_14px_34px_rgba(37,99,235,0.08)]">
        <div className="border-b border-blue-100 px-5 py-4">
          <h3 className="text-base font-black text-slate-900">{MONTHS[monthIndex]} {year} Attendance</h3>
          <p className="text-xs font-medium text-slate-500">Present, absent, late and leave records for this month.</p>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-blue-50 text-left text-xs font-black uppercase text-blue-700">
>>>>>>> 9c00412ab626e6b072a5de492d95634547634378
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
<<<<<<< HEAD
              <tr>
                <td colSpan={5} className={`px-5 py-6 ${mutedClass}`}>
                  Loading...
                </td>
              </tr>
            ) : items.length ? (
              items.map((item) => (
                <tr key={item._id} className={`border-t ${borderClass}`}>
                  <td className={`px-5 py-3 ${tableCellClass}`}>
                    {item.studentId
                      ? `${item.studentId.firstName} ${item.studentId.lastName}`
                      : "-"}
                  </td>
                  <td className={`px-5 py-3 ${tableCellClass}`}>{item.subject}</td>
                  <td className={`px-5 py-3 ${tableCellClass}`}>{item.examType}</td>
                  <td className={`px-5 py-3 ${tableCellClass}`}>
                    {item.marks}/{item.maxMarks} {item.grade ? `(${item.grade})` : ""}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button type="button" className={outlineBtnClass} onClick={() => onEdit(item)}>
                        Edit
                      </button>
                      <button type="button" className={dangerBtnClass} onClick={() => onDelete(item._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={`px-5 py-6 ${mutedClass}`}>
                  No academic records yet.
                </td>
              </tr>
=======
              <tr><td colSpan={3} className="px-5 py-6 text-slate-500">Loading...</td></tr>
            ) : attendance?.items?.length ? (
              attendance.items.map((item) => (
                <tr key={`${item.date}-${item.status}`} className="border-t border-blue-50">
                  <td className="px-5 py-4 font-bold text-slate-950">{formatDate(item.date)}</td>
                  <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-5 py-4 text-slate-600">{item.remarks || "-"}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={3} className="px-5 py-6 text-slate-500">No teacher attendance records found for this month.</td></tr>
>>>>>>> 9c00412ab626e6b072a5de492d95634547634378
            )}
          </tbody>
        </table>
      </div>

      <AppointmentLetterModal
        open={showAppointmentLetter}
        onClose={() => setShowAppointmentLetter(false)}
        dark={dark}
      />
    </section>
  );
}
