import { useEffect, useMemo, useState } from "react";
import api from "../../services/api/client";
import FormModal from "../../components/ui/FormModal";
<<<<<<< HEAD
import ModernDatePicker from "../../components/ui/ModernDatePicker";
import ScrollableSelect from "../../components/ui/ScrollableSelect";
import TeacherAttendanceModal from "../../components/teachers/TeacherAttendanceModal";
import TeacherActivityMonitor from "../../components/teachers/TeacherActivityMonitor";
import { CLASS_OPTIONS, SECTION_OPTIONS } from "../../constants/classes";
=======
import { resolveStudentPhotoUrl } from "../../utils/mediaUrl";
>>>>>>> 9c00412ab626e6b072a5de492d95634547634378

const today = () => new Date().toISOString().slice(0, 10);

const TEACHER_STATUS_LABELS = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LEAVE: "On Leave",
  LATE: "Late",
  UNMARKED: "Not Marked",
};

const TEACHER_STATUS_BADGES = {
  PRESENT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  ABSENT: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
  LEAVE: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
  LATE: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  UNMARKED: "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-[#9e9e9e]",
};

function toAttendanceDateValue(date = new Date()) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function buildDateRange(from, to) {
  if (!from || !to) return [];
  const start = new Date(`${from}T12:00:00`);
  const end = new Date(`${to}T12:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];

  const dates = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(toAttendanceDateValue(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function getTeacherAssignmentMatches(teacher, className, section) {
  const assignments = teacher?.assignedClasses || [];
  if (!assignments.length) return [];
  return assignments.filter((item) => {
    const matchesClass = !className || item.className === className;
    const matchesSection = !section || (item.section || "A") === section;
    return matchesClass && matchesSection;
  });
}

function getPrimaryTeacherAssignment(teacher, className, section) {
  const matches = getTeacherAssignmentMatches(teacher, className, section);
  const source = matches.length ? matches : teacher?.assignedClasses || [];
  if (!source.length) return { className: "Unassigned", section: "—" };
  const first = source[0];
  return {
    className: first.className || "Unassigned",
    section: first.section || "A",
  };
}

function buildDemoTeacherHistoryRows(teachers, dates, className, section) {
  const sampleTeachers =
    teachers.length > 0
      ? teachers.slice(0, Math.min(teachers.length, 8))
      : [
          { fullName: "Mr. Ahmed Khan", assignedClasses: [{ className: "Grade 6", section: "A" }] },
          { fullName: "Ms. Sana Ali", assignedClasses: [{ className: "Grade 7", section: "B" }] },
          { fullName: "Mr. Usman Raza", assignedClasses: [{ className: "Grade 8", section: "C" }] },
        ];

  const statuses = ["PRESENT", "ABSENT", "LEAVE", "LATE"];
  const rows = [];

  dates.forEach((date, dateIndex) => {
    sampleTeachers.forEach((teacher, teacherIndex) => {
      const assignments = getTeacherAssignmentMatches(teacher, className, section);
      const assignment = assignments[0] || getPrimaryTeacherAssignment(teacher, className, section);
      if (className && assignment.className !== className) return;
      if (section && assignment.section !== section) return;

      const status = statuses[(dateIndex + teacherIndex) % statuses.length];
      rows.push({
        id: `demo-${date}-${teacher.fullName}-${teacherIndex}`,
        date,
        teacherName: teacher.fullName,
        className: assignment.className,
        section: assignment.section,
        status,
      });
    });
  });

  return rows;
}

const STATUS_BUTTONS = [
  { value: "PRESENT", label: "Present", active: "bg-emerald-600 text-white border-emerald-600" },
  { value: "ABSENT", label: "Absent", active: "bg-rose-600 text-white border-rose-600" },
  { value: "LATE", label: "Late", active: "bg-amber-500 text-white border-amber-500" },
  { value: "LEAVE", label: "Leave", active: "bg-sky-600 text-white border-sky-600" },
];

<<<<<<< HEAD
export default function TeacherAttendancePage({ dark = false, onToggleTheme, branchSection = "" }) {
  const [selectedClassName, setSelectedClassName] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [fromDate, setFromDate] = useState(today());
  const [toDate, setToDate] = useState(today());
  const [teachers, setTeachers] = useState([]);
  const [historyRows, setHistoryRows] = useState([]);
  const [historyStats, setHistoryStats] = useState({ present: 0, absent: 0, leave: 0, late: 0, unmarked: 0 });
=======
const CALENDAR_DAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

const STATUS_META = {
  PRESENT: { label: "Present", dot: "bg-emerald-500", cell: "bg-emerald-500 text-white border-emerald-500" },
  ABSENT: { label: "Absent", dot: "bg-rose-500", cell: "bg-rose-500 text-white border-rose-500" },
  LATE: { label: "Late", dot: "bg-amber-500", cell: "bg-amber-500 text-white border-amber-500" },
  LEAVE: { label: "On Leave", dot: "bg-amber-400", cell: "bg-amber-400 text-white border-amber-400" },
  NO_RECORD: { label: "No Record", dot: "bg-slate-300", cell: "bg-slate-200 text-slate-700 border-slate-200" },
};

const formatDateKey = (date) => date.toISOString().slice(0, 10);

const getMonthLabel = (date) => date.toLocaleDateString([], { month: "long", year: "numeric" });

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "S";

function AttendanceProfile({ row, onClick }) {
  const photo = resolveStudentPhotoUrl(row.studentPhotoUrl);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-xs font-black text-blue-700 transition hover:bg-blue-200"
      title="Open attendance calendar"
    >
      {photo ? (
        <img src={photo} alt={`${row.name} profile`} className="h-full w-full object-cover" />
      ) : (
        getInitials(row.name)
      )}
    </button>
  );
}

function AttendanceTotal({ row }) {
  return (
    <div className="space-y-1.5 text-sm font-medium leading-none text-slate-700">
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span>Present:</span>
        <span className="font-semibold text-emerald-700">{row.present}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
        <span>Absent:</span>
        <span className="font-semibold text-rose-600">{row.absent}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span>On Leave:</span>
        <span className="font-semibold text-amber-600">{row.leave}</span>
      </div>
    </div>
  );
}

const buildCalendarCells = (monthDate) => {
  const year = monthDate.getFullYear();
  const monthIndex = monthDate.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const startOffset = firstDay.getDay();
  const totalCells = 42;
  const cells = [];

  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - startOffset + 1;
    const cellDate = new Date(year, monthIndex, dayNumber);
    const inMonth = cellDate.getMonth() === monthIndex;

    cells.push({
      key: formatDateKey(cellDate),
      day: cellDate.getDate(),
      inMonth,
    });
  }

  return cells;
};

function StudentAttendanceCalendarModal({
  open,
  dark,
  student,
  classLabel,
  monthDate,
  days,
  loading,
  error,
  onClose,
  onPrevMonth,
  onNextMonth,
}) {
  const cells = useMemo(() => buildCalendarCells(monthDate), [monthDate]);
  const dayMap = useMemo(() => {
    const map = new Map();
    days.forEach((entry) => {
      map.set(entry.date, entry.status);
    });
    return map;
  }, [days]);

  const counts = useMemo(
    () =>
      days.reduce(
        (acc, entry) => {
          if (entry.status === "PRESENT") acc.present += 1;
          if (entry.status === "ABSENT") acc.absent += 1;
          if (entry.status === "LATE") acc.late += 1;
          if (entry.status === "LEAVE") acc.leave += 1;
          return acc;
        },
        { present: 0, absent: 0, late: 0, leave: 0 }
      ),
    [days]
  );

  return (
    <FormModal
      open={open}
      title={`${student?.name || "Student"} - ${classLabel} - ${getMonthLabel(monthDate)} attendance`}
      onClose={onClose}
      dark={dark}
      extraWide
    >
      {error ? <p className="mb-4 text-sm text-rose-600">{error}</p> : null}

      <div className={`rounded-2xl border p-6 ${dark ? "border-white/[0.06] bg-[#1a1b26]" : "border-slate-200 bg-white shadow-sm"}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h4 className={`text-2xl font-black ${dark ? "text-white" : "text-slate-900"}`}>{student?.name || "Student"}</h4>
            <p className={`mt-1 text-base ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
              {classLabel} - {getMonthLabel(monthDate)} attendance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrevMonth}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                dark ? "border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.06]" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              ‹
            </button>
            <div className={`min-w-40 rounded-xl border px-4 py-2 text-center text-sm font-semibold ${dark ? "border-white/[0.08] bg-white/[0.03] text-white" : "border-slate-200 bg-white text-slate-800"}`}>
              {getMonthLabel(monthDate)}
            </div>
            <button
              type="button"
              onClick={onNextMonth}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                dark ? "border-white/[0.08] bg-white/[0.03] text-white hover:bg-white/[0.06]" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              ›
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-3">
          {CALENDAR_DAYS.map((day) => (
            <div key={day} className={`text-center text-xs font-semibold tracking-[0.18em] ${dark ? "text-[#9e9e9e]" : "text-slate-400"}`}>
              {day}
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-3">
          {loading ? (
            <div className={`col-span-7 py-10 text-center text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Loading calendar...</div>
          ) : (
            cells.map((cell) => {
              const status = dayMap.get(cell.key) || "NO_RECORD";
              const meta = STATUS_META[status] || STATUS_META.NO_RECORD;
              return (
                <div
                  key={cell.key}
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full border text-center transition ${meta.cell} ${
                    cell.inMonth ? "" : dark ? "opacity-35" : "opacity-35"
                  }`}
                  title={`${cell.key} ${meta.label}`}
                >
                  <span className="text-2xl font-bold">{cell.day}</span>
                </div>
              );
            })
          )}
        </div>

        <div className={`mt-5 border-t pt-4 ${dark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            {["PRESENT", "ABSENT", "LATE", "LEAVE"].map((status) => (
              <div key={status} className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${STATUS_META[status].dot}`} />
                <span className={dark ? "text-[#9e9e9e]" : "text-slate-600"}>{STATUS_META[status].label}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
            <span className="text-emerald-600">Total Present: {counts.present}</span>
            <span className={dark ? "text-[#9e9e9e]" : "text-slate-400"}>·</span>
            <span className="text-rose-500">Total Absent: {counts.absent}</span>
            <span className={dark ? "text-[#9e9e9e]" : "text-slate-400"}>·</span>
            <span className="text-amber-500">Total Late: {counts.late}</span>
            <span className={dark ? "text-[#9e9e9e]" : "text-slate-400"}>·</span>
            <span className="text-sky-500">Total On Leave: {counts.leave}</span>
          </div>
        </div>
      </div>
    </FormModal>
  );
}

export default function TeacherAttendancePage() {
  const [classOptions, setClassOptions] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [fromDate, setFromDate] = useState(today());
  const [toDate, setToDate] = useState(today());
  const [summaryRows, setSummaryRows] = useState([]);
>>>>>>> 9c00412ab626e6b072a5de492d95634547634378
  const [students, setStudents] = useState([]);
  const [todayRecords, setTodayRecords] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showTeacherAttendanceModal, setShowTeacherAttendanceModal] = useState(false);
  const [teacherAttendanceDate, setTeacherAttendanceDate] = useState(() => toAttendanceDateValue());
  const [teacherAttendanceRefreshKey, setTeacherAttendanceRefreshKey] = useState(0);
  const [teacherAttendanceResetting, setTeacherAttendanceResetting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [markingId, setMarkingId] = useState("");
  const [error, setError] = useState("");
<<<<<<< HEAD
  const [historyError, setHistoryError] = useState("");

  const attendanceClassNames = CLASS_OPTIONS.slice(0, 13);
  const selectedClass = selectedClassName
    ? {
        className: selectedClassName,
        section: selectedSection || "A",
      }
    : null;
=======
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentCalendar, setShowStudentCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [studentCalendarDays, setStudentCalendarDays] = useState([]);
  const [studentCalendarLoading, setStudentCalendarLoading] = useState(false);
  const [studentCalendarError, setStudentCalendarError] = useState("");

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
    () => classSectionOptions.find((c) => c._id === selectedClassId) || null,
    [classSectionOptions, selectedClassId]
  );
>>>>>>> 9c00412ab626e6b072a5de492d95634547634378

  const cardClass = dark ? "rounded-2xl border border-white/[0.06] bg-[#161722]" : "ref-card";
  const tableHeadClass = dark ? "bg-[#1a1b26] text-left text-[#9e9e9e]" : "bg-slate-50 text-left text-slate-500";
  const tableCellClass = dark ? "text-white" : "text-slate-700";
  const mutedClass = dark ? "text-[#9e9e9e]" : "text-slate-500";
  const borderClass = dark ? "border-white/[0.06]" : "border-slate-100";
  const classSelectOptions = [
    { value: "", label: "Select All Classes" },
    ...attendanceClassNames.map((className) => ({ value: className, label: className })),
  ];
  const sectionSelectOptions = [
    { value: "", label: "Select All Sections" },
    ...SECTION_OPTIONS.map((section) => ({ value: section, label: `Section ${section}` })),
  ];

  useEffect(() => {
    const loadTeachers = async () => {
      try {
        const { data } = await api.get("/teachers", { params: { page: 1, limit: 500 } });
        setTeachers(data.data?.items || []);
      } catch {
        setTeachers([]);
      }
    };

    loadTeachers();
  }, []);

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
    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistoryError("");

<<<<<<< HEAD
      const dates = buildDateRange(fromDate, toDate);
      if (!dates.length) {
        setHistoryRows([]);
        setHistoryStats({ present: 0, absent: 0, leave: 0, late: 0, unmarked: 0 });
        setHistoryLoading(false);
        return;
      }

      try {
        const responses = await Promise.all(
          dates.map((date) => api.get("/teacher-attendance", { params: { date } }))
        );
        const liveRows = [];
        let present = 0;
        let absent = 0;
        let leave = 0;
        let late = 0;

        responses.forEach((response, dateIndex) => {
          const date = dates[dateIndex];
          const attendanceItems = response.data?.data?.items || [];
          const attendanceMap = new Map(
            attendanceItems.map((item) => [String(item.teacherId), item.status || "UNMARKED"])
          );

          teachers.forEach((teacher) => {
            const matches = getTeacherAssignmentMatches(teacher, selectedClassName, selectedSection);
            const primaryAssignment = getPrimaryTeacherAssignment(teacher, selectedClassName, selectedSection);
            const assignment = matches[0] || primaryAssignment;

            if (selectedClassName && assignment.className !== selectedClassName) return;
            if (selectedSection && assignment.section !== selectedSection) return;

            const status = attendanceMap.get(String(teacher._id)) || "UNMARKED";
            if (status === "PRESENT") present += 1;
            else if (status === "ABSENT") absent += 1;
            else if (status === "LEAVE") leave += 1;
            else if (status === "LATE") late += 1;

            liveRows.push({
              id: `${date}-${teacher._id}`,
              date,
              teacherName: teacher.fullName || "Teacher",
              className: assignment.className || "Unassigned",
              section: assignment.section || "A",
              status,
            });
          });
        });

        if (liveRows.length) {
          setHistoryRows(liveRows);
          setHistoryStats({
            present,
            absent,
            leave,
            late,
            unmarked: Math.max(teachers.length * dates.length - liveRows.filter((row) => row.status !== "UNMARKED").length, 0),
          });
          return;
        }

        const demoRows = buildDemoTeacherHistoryRows(teachers, dates, selectedClassName, selectedSection);
        const demoStatusTotals = demoRows.reduce(
          (acc, row) => {
            if (row.status === "PRESENT") acc.present += 1;
            else if (row.status === "ABSENT") acc.absent += 1;
            else if (row.status === "LEAVE") acc.leave += 1;
            else if (row.status === "LATE") acc.late += 1;
            return acc;
          },
          { present: 0, absent: 0, leave: 0, late: 0 }
        );

        setHistoryRows(demoRows);
        setHistoryStats({
          ...demoStatusTotals,
          unmarked: Math.max(demoRows.length - (demoStatusTotals.present + demoStatusTotals.absent + demoStatusTotals.leave + demoStatusTotals.late), 0),
        });
      } catch (err) {
        setHistoryError(err.response?.data?.message || "Failed to load teacher attendance history");
        const demoRows = buildDemoTeacherHistoryRows(teachers, dates, selectedClassName, selectedSection);
        setHistoryRows(demoRows);
        setHistoryStats({ present: 0, absent: 0, leave: 0, late: 0, unmarked: 0 });
      } finally {
        setHistoryLoading(false);
      }
    };

    loadHistory();
  }, [fromDate, toDate, selectedClassName, selectedSection, teachers]);

  const onClassChange = (className) => {
    setSelectedClassName(className);
    setSelectedSection("");
    setShowModal(false);
    setStudents([]);
    setTodayRecords({});
  };

  const onSectionChange = (section) => {
    setSelectedSection(section);
    setShowModal(false);
    setStudents([]);
    setTodayRecords({});
  };

  const openMarkAttendance = async () => {
=======
  useEffect(() => {
    if (selectedClass && fromDate && toDate) {
      loadSummary(selectedClass.className, selectedClass.section, fromDate, toDate);
    } else {
      setSummaryRows([]);
    }
  }, [selectedClassId, fromDate, toDate, selectedClass]);

  useEffect(() => {
    const loadStudentCalendar = async () => {
      if (!showStudentCalendar || !selectedStudent || !selectedClass) return;

      setStudentCalendarLoading(true);
      setStudentCalendarError("");

      try {
        const year = calendarMonth.getFullYear();
        const monthIndex = calendarMonth.getMonth();
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const requests = Array.from({ length: daysInMonth }, (_, index) => {
          const date = formatDateKey(new Date(year, monthIndex, index + 1));
          return api
            .get("/teacher-panel/attendance", {
              params: {
                className: selectedClass.className,
                section: selectedClass.section || "A",
                date,
                page: 1,
                limit: 200,
              },
            })
            .then(({ data }) => ({ date, items: data.data?.items || [] }))
            .catch(() => ({ date, items: [] }));
        });

        const results = await Promise.all(requests);
        const studentId = selectedStudent.studentId;
        const days = results.map(({ date, items }) => {
          const record = items.find((item) => {
            const sid = item.studentId?._id || item.studentId;
            return sid === studentId;
          });
          return { date, status: record?.status || "NO_RECORD" };
        });

        setStudentCalendarDays(days);
      } catch (err) {
        setStudentCalendarError(err.response?.data?.message || "Failed to load attendance calendar");
        setStudentCalendarDays([]);
      } finally {
        setStudentCalendarLoading(false);
      }
    };

    loadStudentCalendar();
  }, [showStudentCalendar, selectedStudent, selectedClass, calendarMonth]);

  const onClassChange = async (classId) => {
    setSelectedClassId(classId);
    if (!classId) {
      setShowModal(false);
      setStudents([]);
      return;
    }
    const cls = classSectionOptions.find((c) => c._id === classId);
    if (!cls) return;
>>>>>>> 9c00412ab626e6b072a5de492d95634547634378
    setShowModal(true);
    await loadModalData(selectedClassName || attendanceClassNames[0], selectedSection || "A");
  };

  const handleTeacherAttendanceChange = () => {
    setTeacherAttendanceRefreshKey((key) => key + 1);
  };

  const resetTeacherAttendance = async () => {
    const dateLabel = new Date(`${teacherAttendanceDate}T12:00:00`).toLocaleDateString("en-US", {
      dateStyle: "medium",
    });
    if (!window.confirm(`Reset teacher attendance for ${dateLabel}? (Demo / test only)`)) return;

    setTeacherAttendanceResetting(true);
    setError("");
    try {
      await api.post("/teacher-attendance/reset-demo", { date: teacherAttendanceDate });
      setTeacherAttendanceRefreshKey((key) => key + 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset attendance");
    } finally {
      setTeacherAttendanceResetting(false);
    }
  };

  const openStudentCalendar = (row) => {
    if (!selectedClass) return;
    setSelectedStudent({
      studentId: row.studentId,
      name: row.name,
      rollNo: row.rollNo,
    });
    setCalendarMonth(new Date());
    setShowStudentCalendar(true);
  };

  const closeStudentCalendar = () => {
    setShowStudentCalendar(false);
    setSelectedStudent(null);
    setStudentCalendarDays([]);
    setStudentCalendarError("");
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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark attendance");
    } finally {
      setMarkingId("");
    }
  };

  const studentCalendarClassLabel = selectedClass ? `${selectedClass.className} - ${selectedClass.section || "A"}` : "";

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="w-full xl:max-w-sm">
          <h2 className={`text-2xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>Attendance</h2>
          <p className={`text-sm ${mutedClass}`}>Record and review teacher attendance and history.</p>
        </div>
<<<<<<< HEAD
        <div className="flex w-full flex-wrap items-end gap-3 xl:w-auto xl:justify-end">
          <div className="min-w-[180px] max-w-[220px] flex-1">
            <ScrollableSelect
              label="Class"
              placeholder="Select class"
              value={selectedClassName}
              options={classSelectOptions}
              onChange={onClassChange}
              dark={dark}
              portal
            />
          </div>
          <div className="min-w-[150px] max-w-[180px] flex-1">
            <ScrollableSelect
              label="Section"
              placeholder="Select section"
              value={selectedSection}
              options={sectionSelectOptions}
              onChange={onSectionChange}
              dark={dark}
              portal
            />
          </div>
          <div className="min-w-[170px] max-w-[220px] flex-1">
            <ModernDatePicker
              label="Date From"
              value={fromDate}
              onChange={setFromDate}
              dark={dark}
              placeholder="Select date"
            />
          </div>
          <div className="min-w-[170px] max-w-[220px] flex-1">
            <ModernDatePicker
              label="Date To"
              value={toDate}
              onChange={setToDate}
              dark={dark}
              placeholder="Select date"
            />
          </div>
          <button
            type="button"
            className={`h-[46px] rounded-xl border px-4 py-2.5 text-sm font-medium ${
              dark
                ? "border-white/[0.06] bg-[#161722] text-white hover:bg-white/[0.04]"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
            onClick={() => setShowTeacherAttendanceModal(true)}
          >
            Teacher Attendance
          </button>
=======

        <div className="ml-auto flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-nowrap">
          <select
            className="h-11 w-full rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-48"
            value={selectedClassId}
            onChange={(e) => onClassChange(e.target.value)}
            disabled={!classSectionOptions.length}
          >
            <option value="">Select class</option>
            {classSectionOptions.map((c) => (
              <option key={c._id} value={c._id}>
                {c.className} - {c.section}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="h-11 w-full rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-44"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="From"
            title="From date"
          />
          <input
            type="date"
            className="h-11 w-full rounded-xl border border-blue-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-44"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="To"
            title="To date"
          />
>>>>>>> 9c00412ab626e6b072a5de492d95634547634378
        </div>
      </div>

      {error ? <p className={`text-sm ${dark ? "text-[#e91e63]" : "text-rose-600"}`}>{error}</p> : null}

<<<<<<< HEAD
      <div className={`${cardClass} overflow-hidden p-0`}>
        <div className={`border-b px-5 py-4 ${borderClass}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className={`text-base font-semibold ${dark ? "text-white" : "text-slate-800"}`}>
              Attendance Records ({historyRows.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Present", value: historyStats.present, tone: "text-emerald-600" },
                { label: "Absent", value: historyStats.absent, tone: "text-rose-600" },
                { label: "On Leave", value: historyStats.leave, tone: "text-sky-600" },
                { label: "Late", value: historyStats.late, tone: "text-amber-600" },
                { label: "Not Marked", value: historyStats.unmarked, tone: "text-slate-500" },
              ].map((item) => (
                <span
                  key={item.label}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    dark ? "border-white/[0.06] bg-[#1a1b26]" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <span className={dark ? "text-[#9e9e9e]" : "text-slate-500"}>{item.label}: </span>
                  <span className={item.tone}>{item.value}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
        <table className="min-w-full text-sm">
          <thead className={tableHeadClass}>
            <tr>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Teacher</th>
              <th className="px-5 py-3 font-medium">Class</th>
              <th className="px-5 py-3 font-medium">Section</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {historyLoading ? (
              <tr>
                <td colSpan={5} className={`px-5 py-6 ${mutedClass}`}>
                  Loading...
                </td>
              </tr>
            ) : historyError ? (
              <tr>
                <td colSpan={5} className={`px-5 py-6 ${mutedClass}`}>
                  {historyError}
                </td>
              </tr>
            ) : historyRows.length ? (
              historyRows.map((row) => (
                <tr key={row.id} className={`border-t ${borderClass}`}>
                  <td className={`px-5 py-3 ${tableCellClass}`}>
                    {new Date(`${row.date}T12:00:00`).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className={`px-5 py-3 ${tableCellClass}`}>{row.teacherName}</td>
                  <td className={`px-5 py-3 ${tableCellClass}`}>{row.className}</td>
                  <td className={`px-5 py-3 ${tableCellClass}`}>Section {row.section}</td>
                  <td className={`px-5 py-3 ${tableCellClass}`}>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        TEACHER_STATUS_BADGES[row.status] || TEACHER_STATUS_BADGES.UNMARKED
                      }`}
                    >
                      {TEACHER_STATUS_LABELS[row.status] || "Not Marked"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className={`px-5 py-6 ${mutedClass}`}>
                  No teacher attendance history for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
=======
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white p-0 shadow-[0_14px_34px_rgba(37,99,235,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Attendance Records ({summaryRows.length})</h3>
            <p className="text-xs font-medium text-slate-500">Click any student row to view their attendance calendar.</p>
          </div>
          {selectedClass ? (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
              {selectedClass.className} - {selectedClass.section || "A"}
            </span>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-blue-50 text-left text-[11px] font-bold uppercase tracking-[0.08em] text-blue-700">
              <tr>
                <th className="px-4 py-3 font-bold">Profile</th>
                <th className="px-4 py-3 font-bold">Roll Number</th>
                <th className="px-4 py-3 font-bold">Student ID</th>
                <th className="px-4 py-3 font-bold">Name</th>
                <th className="px-4 py-3 font-bold">Class</th>
                <th className="px-4 py-3 font-bold">Total Attendance</th>
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
                  <tr
                    key={row.studentId}
                    onClick={() => openStudentCalendar(row)}
                    className="cursor-pointer border-t border-blue-50 transition hover:bg-blue-50/60"
                  >
                    <td className="px-4 py-4">
                      <AttendanceProfile row={row} onClick={() => openStudentCalendar(row)} />
                    </td>
                    <td className="px-4 py-4 font-mono text-sm font-medium text-slate-950">{row.rollNo || "-"}</td>
                    <td className="px-4 py-4 font-mono text-sm font-medium text-slate-950">{row.admissionNo || row.studentId}</td>
                    <td className="px-4 py-4 font-bold text-slate-950">{row.name || "-"}</td>
                    <td className="px-4 py-4 font-medium text-slate-950">
                      {row.className || selectedClass.className} - {row.section || selectedClass.section || "A"}
                    </td>
                    <td className="px-4 py-4">
                      <AttendanceTotal row={row} />
                    </td>
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
>>>>>>> 9c00412ab626e6b072a5de492d95634547634378
      </div>

      <FormModal
        open={showModal && !!selectedClass}
<<<<<<< HEAD
        title={
          selectedClass
            ? `Attendance — ${selectedClass.className} - ${selectedClass.section}`
            : "Attendance"
        }
=======
        title={selectedClass ? `Mark Attendance — ${selectedClass.className} - ${selectedClass.section}` : "Mark Attendance"}
>>>>>>> 9c00412ab626e6b072a5de492d95634547634378
        onClose={() => setShowModal(false)}
        wide
        dark={dark}
      >
        {modalLoading ? (
          <p className={`text-sm ${mutedClass}`}>Loading students...</p>
        ) : students.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={tableHeadClass}>
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
                    <tr key={student._id} className={`border-t ${borderClass}`}>
                      <td className={`px-3 py-3 ${tableCellClass}`}>{student.admissionNo}</td>
                      <td className={`px-3 py-3 ${tableCellClass}`}>
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
                                currentStatus === btn.value ? btn.active : idleStatusClass
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
          <p className={`text-sm ${mutedClass}`}>No students found in this class.</p>
        )}
      </FormModal>

<<<<<<< HEAD
      <div className="pt-1">
        <TeacherActivityMonitor
          dark={dark}
          onToggleTheme={onToggleTheme}
          refreshKey={teacherAttendanceRefreshKey}
          branchSection={branchSection}
        />
      </div>

      <FormModal
        open={showTeacherAttendanceModal}
        title="Teacher Attendance"
        onClose={() => {
          setShowTeacherAttendanceModal(false);
          setError("");
        }}
        extraWide
        dark={dark}
        onDemoReset={resetTeacherAttendance}
        demoResetting={teacherAttendanceResetting}
        error={showTeacherAttendanceModal ? error : ""}
      >
        {showTeacherAttendanceModal ? (
          <TeacherAttendanceModal
            dark={dark}
            date={teacherAttendanceDate}
            onDateChange={setTeacherAttendanceDate}
            onAttendanceChange={handleTeacherAttendanceChange}
            refreshKey={teacherAttendanceRefreshKey}
          />
        ) : null}
      </FormModal>
=======
      <StudentAttendanceCalendarModal
        open={showStudentCalendar}
        dark={false}
        student={selectedStudent}
        classLabel={studentCalendarClassLabel}
        monthDate={calendarMonth}
        days={studentCalendarDays}
        loading={studentCalendarLoading}
        error={studentCalendarError}
        onClose={closeStudentCalendar}
        onPrevMonth={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
        onNextMonth={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
      />
>>>>>>> 9c00412ab626e6b072a5de492d95634547634378
    </section>
  );
}
