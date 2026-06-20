import { useEffect, useState } from "react";
import api from "../../services/api/client";
import FormModal from "../../components/ui/FormModal";

const today = () => new Date().toISOString().slice(0, 10);

const STATUS_BUTTONS = [
  { value: "PRESENT", label: "Present", active: "bg-emerald-600 text-white border-emerald-600" },
  { value: "ABSENT", label: "Absent", active: "bg-rose-600 text-white border-rose-600" },
  { value: "LATE", label: "Late", active: "bg-amber-500 text-white border-amber-500" },
  { value: "LEAVE", label: "Leave", active: "bg-sky-600 text-white border-sky-600" },
];

export default function TeacherAttendancePage() {
  const [classOptions, setClassOptions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [summaryRows, setSummaryRows] = useState([]);
  const [students, setStudents] = useState([]);
  const [todayRecords, setTodayRecords] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [markingId, setMarkingId] = useState("");
  const [error, setError] = useState("");

  const selectedClass = classOptions.find((c) => c._id === selectedClassId) || null;

  const loadClasses = async () => {
    try {
      const { data } = await api.get("/teacher-panel/class-options");
      setClassOptions(data.data || []);
    } catch {
      setClassOptions([]);
    }
  };

  const loadSummary = async (className, section, from, to) => {
    if (!className || !from || !to) {
      setSummaryRows([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/teacher-panel/attendance/summary", {
        params: { className, section: section || "A", fromDate: from, toDate: to },
      });
      setSummaryRows(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attendance summary");
      setSummaryRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadModalData = async (className, section) => {
    setModalLoading(true);
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        api.get("/teacher-panel/students", { params: { className, section: section || "A" } }),
        api.get("/teacher-panel/attendance", {
          params: {
            className,
            section: section || "A",
            date: today(),
            page: 1,
            limit: 200,
          },
        }),
      ]);

      setStudents(studentsRes.data.data || []);

      const map = {};
      (attendanceRes.data.data?.items || []).forEach((item) => {
        const sid = item.studentId?._id || item.studentId;
        if (sid) {
          map[sid] = { id: item._id, status: item.status };
        }
      });
      setTodayRecords(map);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load students");
      setStudents([]);
      setTodayRecords({});
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadSummary(selectedClass.className, selectedClass.section, fromDate, toDate);
    } else {
      setSummaryRows([]);
    }
  }, [selectedClassId, fromDate, toDate]);

  const onClassChange = async (classId) => {
    setSelectedClassId(classId);
    if (!classId) {
      setShowModal(false);
      setStudents([]);
      return;
    }
    const cls = classOptions.find((c) => c._id === classId);
    if (!cls) return;
    setShowModal(true);
    await loadModalData(cls.className, cls.section);
  };

  const markAttendance = async (studentId, status) => {
    if (!selectedClass) return;
    setMarkingId(studentId);
    setError("");
    const payload = {
      studentId,
      className: selectedClass.className,
      section: selectedClass.section || "A",
      date: today(),
      status,
      remarks: "",
    };

    try {
      const existing = todayRecords[studentId];
      if (existing?.id) {
        await api.put(`/teacher-panel/attendance/${existing.id}`, { status, date: today(), remarks: "" });
        setTodayRecords((prev) => ({
          ...prev,
          [studentId]: { ...existing, status },
        }));
      } else {
        const { data } = await api.post("/teacher-panel/attendance", payload);
        setTodayRecords((prev) => ({
          ...prev,
          [studentId]: { id: data.data._id, status },
        }));
      }
      if (fromDate && toDate) {
        await loadSummary(selectedClass.className, selectedClass.section, fromDate, toDate);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setMarkingId("");
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Mark Attendance</h2>
          <p className="text-sm text-slate-500">Record and manage daily student attendance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            className="ref-input min-w-[180px]"
            value={selectedClassId}
            onChange={(e) => onClassChange(e.target.value)}
            disabled={!classOptions.length}
          >
            <option value="">Select class</option>
            {classOptions.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className} - {c.section} ({c.subject})
              </option>
            ))}
          </select>
          <input
            type="date"
            className="ref-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="From"
            title="From date"
          />
          <input
            type="date"
            className="ref-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="To"
            title="To date"
          />
        </div>
      </div>

      {!classOptions.length ? (
        <div className="ref-card p-5 text-sm text-slate-600">
          Please add a class in <strong>My Classes</strong> first, then mark attendance here.
        </div>
      ) : null}

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="ref-card overflow-hidden p-0">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">
            Attendance Records ({summaryRows.length})
          </h3>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Roll No#</th>
              <th className="px-5 py-3 font-medium">Student</th>
              <th className="px-5 py-3 font-medium">Present</th>
              <th className="px-5 py-3 font-medium">Absent</th>
              <th className="px-5 py-3 font-medium">Late</th>
              <th className="px-5 py-3 font-medium">Leave</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : !selectedClass || !fromDate || !toDate ? (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-slate-500">
                  Select class, from date and to date to view attendance summary.
                </td>
              </tr>
            ) : summaryRows.length ? (
              summaryRows.map((row) => (
                <tr key={row.studentId} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{row.rollNo}</td>
                  <td className="px-5 py-3 text-slate-700">{row.name}</td>
                  <td className="px-5 py-3 text-slate-700">{row.present}</td>
                  <td className="px-5 py-3 text-slate-700">{row.absent}</td>
                  <td className="px-5 py-3 text-slate-700">{row.late}</td>
                  <td className="px-5 py-3 text-slate-700">{row.leave}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-5 py-6 text-slate-500">
                  No attendance records for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModal
        open={showModal && !!selectedClass}
        title={
          selectedClass
            ? `Mark Attendance — ${selectedClass.className} - ${selectedClass.section}`
            : "Mark Attendance"
        }
        onClose={() => setShowModal(false)}
        wide
      >
        {modalLoading ? (
          <p className="text-sm text-slate-500">Loading students...</p>
        ) : students.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Roll No#</th>
                  <th className="px-3 py-2 font-medium">Name</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const currentStatus = todayRecords[student._id]?.status;
                  const isMarking = markingId === student._id;
                  return (
                    <tr key={student._id} className="border-t border-slate-100">
                      <td className="px-3 py-3 text-slate-700">{student.admissionNo}</td>
                      <td className="px-3 py-3 text-slate-700">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          {STATUS_BUTTONS.map((btn) => (
                            <button
                              key={btn.value}
                              type="button"
                              disabled={isMarking}
                              onClick={() => markAttendance(student._id, btn.value)}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                currentStatus === btn.value
                                  ? btn.active
                                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">No students found in this class.</p>
        )}
      </FormModal>
    </section>
  );
}
