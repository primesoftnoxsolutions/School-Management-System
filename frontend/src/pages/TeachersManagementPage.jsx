import { useEffect, useState } from "react";
import api from "../services/api/client";
import FormModal from "../components/ui/FormModal";
import CreateTeacherWizard, {
  assignedClassesToFormState,
  buildAssignmentsFromSelection,
  initialCreateTeacherForm,
  isNoAssignClass,
} from "../components/teachers/CreateTeacherWizard";
import TeacherAttendanceModal from "../components/teachers/TeacherAttendanceModal";
import TeacherRemoveModal from "../components/teachers/TeacherRemoveModal";
import TeacherAssignmentHistoryModal from "../components/teachers/TeacherAssignmentHistoryModal";
import TeacherLoginDetailsModal from "../components/teachers/TeacherLoginDetailsModal";
import TeacherActivityMonitor from "../components/teachers/TeacherActivityMonitor";
import TablePagination from "../components/ui/TablePagination";
import { CLASS_OPTIONS, SECTION_OPTIONS, SUBJECT_OPTIONS } from "../constants/classes";

function toAttendanceDateValue(date = new Date()) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function IconUsers() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m8-4a4 4 0 11-8 0 4 4 0 018 0zm-4 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

function IconHistory() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3M3.05 11a9 9 0 1 0 .5-3.5M3 4v4h4" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function IconUserPlus() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6" />
    </svg>
  );
}

function IconClipboardCheck() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  );
}

function IconUserMinus() {
  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 11h-6" />
    </svg>
  );
}

function TeacherIllustration() {
  return (
    <svg viewBox="0 0 200 180" className="h-36 w-44 shrink-0" aria-hidden="true">
      <ellipse cx="100" cy="165" rx="70" ry="10" fill="#E0E7FF" />
      <rect x="55" y="95" width="90" height="70" rx="12" fill="#4F46E5" />
      <rect x="70" y="110" width="60" height="45" rx="6" fill="#EEF2FF" />
      <circle cx="100" cy="58" r="28" fill="#FCD9BD" />
      <path d="M72 58c0-18 12-28 28-28s28 10 28 28" fill="#312E81" />
      <rect x="118" y="108" width="28" height="36" rx="4" fill="#F8FAFC" stroke="#C7D2FE" />
      <line x1="124" y1="118" x2="140" y2="118" stroke="#94A3B8" strokeWidth="2" />
      <line x1="124" y1="126" x2="140" y2="126" stroke="#94A3B8" strokeWidth="2" />
      <line x1="124" y1="134" x2="136" y2="134" stroke="#94A3B8" strokeWidth="2" />
    </svg>
  );
}

function TeacherAvatar({ name }) {
  const parts = (name || "").trim().split(/\s+/);
  const initials = `${parts[0]?.[0] || ""}${parts[1]?.[0] || ""}`.toUpperCase() || "?";
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-bold text-indigo-700 ring-2 ring-white">
      {initials}
    </div>
  );
}

function StatusPill({ active, dark = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? dark
            ? "bg-[#4caf50]/15 text-[#4caf50]"
            : "bg-emerald-50 text-emerald-700"
          : dark
            ? "bg-white/[0.06] text-[#9e9e9e]"
            : "bg-slate-100 text-slate-600"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : dark ? "bg-[#9e9e9e]" : "bg-slate-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function subjectSortIndex(subject) {
  const idx = SUBJECT_OPTIONS.indexOf(subject || "Class Teacher");
  return idx === -1 ? SUBJECT_OPTIONS.length : idx;
}

function groupAssignedClasses(assignedClasses = []) {
  const groups = new Map();

  assignedClasses.forEach((item) => {
    const section = item.section || "A";
    const key = `${item.className}|${section}`;
    if (!groups.has(key)) {
      groups.set(key, {
        className: item.className,
        section,
        subjects: new Set(),
      });
    }
    groups.get(key).subjects.add(item.subject || "Class Teacher");
  });

  return [...groups.values()]
    .sort((a, b) => {
      const classDiff = CLASS_OPTIONS.indexOf(a.className) - CLASS_OPTIONS.indexOf(b.className);
      if (classDiff !== 0) return classDiff;
      return SECTION_OPTIONS.indexOf(a.section) - SECTION_OPTIONS.indexOf(b.section);
    })
    .map((group) => {
      const classLabel = `${group.className} ${group.section}`;
      const subjects = [...group.subjects].sort((a, b) => subjectSortIndex(a) - subjectSortIndex(b));
      return {
        key: `${group.className}|${group.section}`,
        classLabel,
        subjects,
        display: `${classLabel}, ${subjects.join(", ")}`,
      };
    });
}

function ClassBadge({ assignedClasses = [], dark = false }) {
  if (!assignedClasses.length) {
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
          dark ? "bg-[#ff9800]/15 text-[#ff9800]" : "bg-amber-50 text-amber-700"
        }`}
      >
        Not assigned
      </span>
    );
  }

  const grouped = groupAssignedClasses(assignedClasses);

  return (
    <div className="flex flex-wrap gap-1">
      {grouped.map((group) => (
        <span
          key={group.key}
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            dark ? "bg-[#7c4dff]/15 text-[#7c4dff]" : "bg-indigo-50 text-indigo-700"
          }`}
        >
          {group.display}
        </span>
      ))}
    </div>
  );
}

function ActivityStatusBadge({ status }) {
  const success = status === "SUCCESS";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        success ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      }`}
    >
      {success ? "✓" : "!"}
      {status}
    </span>
  );
}

export default function TeachersManagementPage({ dark = false, onToggleTheme }) {
  const [createForm, setCreateForm] = useState({ ...initialCreateTeacherForm });
  const [assignTeacherId, setAssignTeacherId] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createModalTeacherName, setCreateModalTeacherName] = useState("");
  const [createWizardKey, setCreateWizardKey] = useState(0);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLoginDetailsModal, setShowLoginDetailsModal] = useState(false);
  const [loginDetailsTeacher, setLoginDetailsTeacher] = useState(null);
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);
  const [attendanceDate, setAttendanceDate] = useState(() => toAttendanceDateValue());
  const [attendanceResetting, setAttendanceResetting] = useState(false);

  const loadData = async (nextPage = page, nextSearch = search) => {
    setLoading(true);
    setError("");
    try {
      const teachersRes = await api.get("/teachers", {
        params: { search: nextSearch, page: nextPage, limit: pagination.limit },
      });
      const data = teachersRes.data?.data || {};
      setTeachers(data.items || []);
      setPagination({
        total: data.total || 0,
        totalPages: data.totalPages || 1,
        limit: data.limit || 10,
      });
      setPage(data.page || nextPage);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load teachers data");
      setTeachers([]);
      setPagination({ totalPages: 1, total: 0, limit: 10 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetCreateForm = () => {
    setCreateForm({ ...initialCreateTeacherForm });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setAssignTeacherId(null);
    setCreateModalTeacherName("");
    setError("");
    resetCreateForm();
  };

  const onSaveAssignments = async (teacherId, wizardForm) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const assignments = isNoAssignClass(wizardForm.className)
        ? []
        : buildAssignmentsFromSelection(
            wizardForm.className,
            wizardForm.sections,
            wizardForm.sectionSubjects
          );
      await api.put(`/teachers/${teacherId}`, { assignments });
      closeCreateModal();
      setSuccess(
        assignments.length
          ? "Class assignments saved successfully."
          : "Teacher marked as NO ASSIGN — all class assignments removed."
      );
      await loadData(page, search);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save class assignments");
    } finally {
      setSaving(false);
    }
  };

  const onWizardSubmit = async (wizardForm) => {
    if (assignTeacherId) {
      await onSaveAssignments(assignTeacherId, wizardForm);
      return;
    }
    await onCreateTeacher(wizardForm);
  };

  const onCreateTeacher = async (wizardForm) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const assignments = isNoAssignClass(wizardForm.className)
        ? []
        : buildAssignmentsFromSelection(
            wizardForm.className,
            wizardForm.sections,
            wizardForm.sectionSubjects
          );
      const payload = {
        fullName: wizardForm.fullName.trim(),
        email: wizardForm.email.trim(),
        password: wizardForm.password,
        cnic: wizardForm.cnic,
        address: wizardForm.address,
        phoneNumber: wizardForm.phoneNumber,
        designation: wizardForm.designation,
        qualification: wizardForm.qualification,
        expertise: wizardForm.expertise,
        salary: wizardForm.salary,
        allowPasswordReset: wizardForm.allowPasswordReset,
        assignments,
      };
      await api.post("/teachers", payload);
      resetCreateForm();
      setSuccess(
        assignments.length
          ? "Teacher created successfully with assigned classes."
          : "Teacher created successfully without class assignment."
      );
      setShowCreateModal(false);
      await loadData(1, search);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create teacher");
    } finally {
      setSaving(false);
    }
  };

  const openLoginDetailsModal = (teacher) => {
    setLoginDetailsTeacher(teacher);
    setShowLoginDetailsModal(true);
  };

  const closeLoginDetailsModal = () => {
    setShowLoginDetailsModal(false);
    setLoginDetailsTeacher(null);
  };

  const openAssignModal = (teacher) => {
    setAssignTeacherId(teacher._id);
    setCreateForm(assignedClassesToFormState(teacher.assignedClasses, teacher));
    setCreateModalTeacherName(teacher.fullName || "");
    setCreateWizardKey((key) => key + 1);
    setError("");
    setShowCreateModal(true);
  };

  const handleAttendanceChange = () => {
    setAttendanceRefreshKey((key) => key + 1);
  };

  const resetDemoAttendance = async () => {
    const dateLabel = new Date(`${attendanceDate}T12:00:00`).toLocaleDateString("en-US", {
      dateStyle: "medium",
    });
    if (!window.confirm(`Reset teacher attendance for ${dateLabel}? (Demo / test only)`)) return;
    setAttendanceResetting(true);
    setError("");
    try {
      await api.post("/teacher-attendance/reset-demo", { date: attendanceDate });
      setAttendanceRefreshKey((key) => key + 1);
      setSuccess(`Attendance reset for ${dateLabel}.`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset attendance");
    } finally {
      setAttendanceResetting(false);
    }
  };

  const cardClass = dark
    ? "overflow-hidden rounded-2xl border border-white/[0.06] bg-[#161722]"
    : "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm";

  const hasOpenModal =
    showCreateModal || showAttendanceModal || showRemoveModal || showHistoryModal || showLoginDetailsModal;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg ${
              dark ? "bg-[#7c4dff] shadow-[#7c4dff]/20" : "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-200"
            }`}
          >
            <IconUsers />
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>Teachers Management</h2>
            <p className={`mt-0.5 text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
              Create teacher accounts, assign classes and monitor teacher activities.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setAssignTeacherId(null);
              resetCreateForm();
              setCreateWizardKey((key) => key + 1);
              setError("");
              setShowCreateModal(true);
            }}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium text-white ${
              dark ? "bg-[#7c4dff] hover:bg-[#6a3df0]" : "ref-btn-primary"
            }`}
          >
            <IconUserPlus />
            Create Teacher
          </button>
          <button
            type="button"
            onClick={() => setShowAttendanceModal(true)}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium ${
              dark
                ? "border-white/[0.06] bg-[#161722] text-white hover:bg-white/[0.04]"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <IconClipboardCheck />
            Teacher Attendance
          </button>
          <button
            type="button"
            onClick={() => setShowRemoveModal(true)}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-medium ${
              dark
                ? "border-[#e91e63]/30 bg-[#e91e63]/10 text-[#e91e63] hover:bg-[#e91e63]/15"
                : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            <IconUserMinus />
            Teacher Remove at School
          </button>
          <TeacherIllustration />
        </div>
      </div>

      {error && !hasOpenModal ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            dark ? "border-[#e91e63]/30 bg-[#e91e63]/10 text-[#e91e63]" : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {error}
        </div>
      ) : null}
      {success ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            dark ? "border-[#4caf50]/30 bg-[#4caf50]/10 text-[#4caf50]" : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {success}
        </div>
      ) : null}

      {/* Search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-[#9e9e9e]" : "text-slate-400"}`}>
            <IconSearch />
          </span>
          <input
            className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm outline-none ${
              dark
                ? "border-white/[0.06] bg-[#161722] text-white placeholder:text-[#9e9e9e] focus:border-[#7c4dff]/40 focus:ring-2 focus:ring-[#7c4dff]/15"
                : "border-slate-200 bg-white text-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            }`}
            placeholder="Search teacher by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadData(1, search)}
          />
        </div>
        <button
          type="button"
          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium ${
            dark
              ? "border-white/[0.06] bg-[#161722] text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <IconFilter />
          Filter
        </button>
        <button
          type="button"
          onClick={() => loadData(1, search)}
          className={`inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-semibold text-white shadow-md ${
            dark
              ? "bg-[#7c4dff] shadow-[#7c4dff]/20 hover:bg-[#6a3df0]"
              : "bg-gradient-to-r from-indigo-500 to-violet-600 shadow-indigo-200 hover:from-indigo-600 hover:to-violet-700"
          }`}
        >
          Search
        </button>
      </div>

      {/* Teacher accounts table */}
      <div className={cardClass}>
        <div
          className={`flex items-center justify-between border-b px-5 py-4 ${
            dark ? "border-white/[0.06]" : "border-slate-100"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                dark ? "bg-[#7c4dff]/15 text-[#7c4dff]" : "bg-indigo-50 text-indigo-600"
              }`}
            >
              <IconUsers />
            </span>
            <h3 className={`text-base font-semibold ${dark ? "text-white" : "text-slate-800"}`}>
              Teacher Accounts{pagination.total ? ` (${pagination.total})` : ""}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              title="Assignment history"
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                dark
                  ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <IconHistory />
              History
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr
                className={`border-b text-left text-[11px] font-semibold uppercase tracking-wider ${
                  dark ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e]" : "border-slate-100 bg-slate-50/80 text-slate-500"
                }`}
              >
                <th className="px-5 py-3">Teacher Name</th>
                <th className="px-5 py-3">Assigned Class</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className={`px-5 py-10 text-center ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                    Loading teachers...
                  </td>
                </tr>
              ) : teachers.length ? (
                teachers.map((teacher) => (
                  <tr
                    key={teacher._id}
                    className={dark ? "border-b border-white/[0.06] hover:bg-white/[0.03]" : "border-b border-slate-50 hover:bg-slate-50/50"}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <TeacherAvatar name={teacher.fullName} />
                        <div>
                          <p className={`font-semibold ${dark ? "text-white" : "text-slate-800"}`}>{teacher.fullName}</p>
                          <p className={`text-xs whitespace-nowrap ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                            Created{" "}
                            {new Date(teacher.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <ClassBadge assignedClasses={teacher.assignedClasses} dark={dark} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill active={teacher.isActive} dark={dark} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openLoginDetailsModal(teacher)}
                          title="View login details"
                          className={`inline-flex items-center rounded-lg p-1.5 ${
                            dark ? "text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          }`}
                        >
                          <IconEye />
                        </button>
                        <button
                          type="button"
                          onClick={() => openAssignModal(teacher)}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                            dark ? "text-[#7c4dff] hover:bg-white/[0.04]" : "text-indigo-600 hover:bg-indigo-50"
                          }`}
                        >
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className={`px-5 py-10 text-center ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                    No teachers found. Create a teacher to enable their panel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <TablePagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          dark={dark}
          onPrev={() => loadData(page - 1, search)}
          onNext={() => loadData(page + 1, search)}
        />
      </div>

      {/* Activity monitor */}
      <div className={cardClass}>
        <TeacherActivityMonitor
          dark={dark}
          onToggleTheme={onToggleTheme}
          refreshKey={attendanceRefreshKey}
        />
      </div>

      <FormModal
        open={showCreateModal}
        title={assignTeacherId ? "Class Assignments" : "Create Teacher"}
        subtitle={createModalTeacherName}
        onClose={closeCreateModal}
        wide
        dark={dark}
        onToggleTheme={onToggleTheme}
      >
        {showCreateModal ? (
          <CreateTeacherWizard
            key={createWizardKey}
            form={createForm}
            setForm={setCreateForm}
            onSubmit={onWizardSubmit}
            saving={saving}
            onCancel={closeCreateModal}
            onTitleChange={setCreateModalTeacherName}
            dark={dark}
            mode={assignTeacherId ? "assign" : "create"}
            submitError={error}
            onDismissError={() => setError("")}
          />
        ) : null}
      </FormModal>

      <FormModal
        open={showAttendanceModal}
        title="Teacher Attendance"
        onClose={() => {
          setShowAttendanceModal(false);
          setError("");
        }}
        extraWide
        dark={dark}
        onToggleTheme={onToggleTheme}
        onDemoReset={resetDemoAttendance}
        demoResetting={attendanceResetting}
        error={showAttendanceModal ? error : ""}
      >
        {showAttendanceModal ? (
          <TeacherAttendanceModal
            dark={dark}
            date={attendanceDate}
            onDateChange={setAttendanceDate}
            onAttendanceChange={handleAttendanceChange}
            refreshKey={attendanceRefreshKey}
          />
        ) : null}
      </FormModal>

      <FormModal
        open={showHistoryModal}
        title="Teacher Assignment History"
        subtitle="Class / Section / Subject"
        onClose={() => setShowHistoryModal(false)}
        extraWide
        dark={dark}
        onToggleTheme={onToggleTheme}
      >
        {showHistoryModal ? <TeacherAssignmentHistoryModal dark={dark} /> : null}
      </FormModal>

      <FormModal
        open={showLoginDetailsModal}
        title="Teacher Login Details"
        subtitle={loginDetailsTeacher?.fullName || ""}
        onClose={closeLoginDetailsModal}
        dark={dark}
        onToggleTheme={onToggleTheme}
      >
        {showLoginDetailsModal && loginDetailsTeacher ? (
          <TeacherLoginDetailsModal teacher={loginDetailsTeacher} dark={dark} />
        ) : null}
      </FormModal>

      <FormModal
        open={showRemoveModal}
        title="Teacher Remove at School"
        onClose={() => setShowRemoveModal(false)}
        extraWide
        dark={dark}
        onToggleTheme={onToggleTheme}
      >
        {showRemoveModal ? (
          <TeacherRemoveModal
            dark={dark}
            onRemoved={(name) => {
              setSuccess(`${name} removed from school successfully.`);
              loadData(page, search);
            }}
          />
        ) : null}
      </FormModal>
    </section>
  );
}
