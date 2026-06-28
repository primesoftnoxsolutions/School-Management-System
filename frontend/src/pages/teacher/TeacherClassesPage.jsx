import { useEffect, useMemo, useState } from "react";
import api from "../../services/api/client";
import ModernDatePicker from "../../components/ui/ModernDatePicker";
import ScrollableSelect from "../../components/ui/ScrollableSelect";
import { CLASS_OPTIONS, SECTION_OPTIONS } from "../../constants/classes";

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDateInput(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function validateFilters(from, to) {
  if (!from || !to) return "From date and To date are both required.";
  const fromDate = parseLocalDateInput(from);
  const toDate = parseLocalDateInput(to);
  if (!fromDate || !toDate) return "Please enter valid dates.";
  if (fromDate > toDate) return "From date cannot be after To date.";
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (toDate > today) return "To date cannot be in the future.";
  return "";
}

function formatDisplayDate(value) {
  const parsed = parseLocalDateInput(value);
  if (!parsed) return value;
  return parsed.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTeacherCreatedDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
}

function safeIndex(list, value) {
  const idx = list.indexOf(value);
  return idx === -1 ? 999 : idx;
}

function groupAssignments(assignedClasses = []) {
  const groups = new Map();

  assignedClasses.forEach((item) => {
    const key = `${item.className || ""}|${item.section || "A"}`;
    if (!groups.has(key)) {
      groups.set(key, {
        className: item.className || "-",
        section: item.section || "A",
        subjects: [],
      });
    }
    const group = groups.get(key);
    if (item.subject && !group.subjects.includes(item.subject)) {
      group.subjects.push(item.subject);
    }
  });

  return [...groups.values()].sort((a, b) => {
    const classDiff = safeIndex(CLASS_OPTIONS, a.className) - safeIndex(CLASS_OPTIONS, b.className);
    if (classDiff !== 0) return classDiff;
    return safeIndex(SECTION_OPTIONS, a.section) - safeIndex(SECTION_OPTIONS, b.section);
  });
}

function buildAssignmentStats(assignedClasses = []) {
  const classes = new Set();
  const sections = new Set();
  const subjects = new Set();

  assignedClasses.forEach((item) => {
    if (item.className) classes.add(item.className);
    if (item.section) sections.add(item.section);
    if (item.subject) subjects.add(item.subject);
  });

  return {
    classes: classes.size,
    sections: sections.size,
    subjects: subjects.size,
    total: assignedClasses.length,
  };
}

function TeacherAvatar({ name, dark = false, size = "md" }) {
  const dim = size === "lg" ? "h-20 w-20 text-xl" : "h-10 w-10 text-sm";
  const initials =
    (String(name || "")
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?");

  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full font-semibold ${
        dark ? "bg-[#7c4dff]/20 text-[#d7d2ff]" : "bg-indigo-100 text-indigo-700"
      }`}
    >
      {initials}
    </div>
  );
}

function StatCard({ label, value, tone, dark = false, icon }) {
  const toneMap = {
    blue: {
      light: "bg-blue-600",
      text: dark ? "text-blue-400" : "text-blue-700",
    },
    green: {
      light: "bg-emerald-600",
      text: dark ? "text-emerald-400" : "text-emerald-700",
    },
    purple: {
      light: "bg-violet-600",
      text: dark ? "text-violet-400" : "text-violet-700",
    },
    orange: {
      light: "bg-orange-500",
      text: dark ? "text-orange-400" : "text-orange-600",
    },
  };
  const accent = toneMap[tone] || toneMap.blue;

  return (
    <div
      className={`rounded-2xl border p-4 shadow-sm ${
        dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${accent.light}`}>{icon}</div>
        <div className="min-w-0">
          <p className={`text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>{label}</p>
          <p className={`mt-1 text-3xl font-bold ${accent.text}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function IconUsers() {
  return (
    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m8-4a4 4 0 11-8 0 4 4 0 018 0zm-4 0a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      />
    </svg>
  );
}

function IconBook() {
  return (
    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 20H5a2 2 0 01-2-2V6a2 2 0 012-2h7m0 16h7a2 2 0 002-2V6a2 2 0 00-2-2h-7m0 16V4"
      />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function TeacherDetailsCard({ teacher, dark = false, loading = false }) {
  const assignedClasses = teacher?.assignedClasses || [];
  const stats = buildAssignmentStats(assignedClasses);
  const grouped = groupAssignments(assignedClasses);

  return (
    <div className={`space-y-5 rounded-2xl border p-5 ${dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-200 bg-white"}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <TeacherAvatar name={teacher?.fullName} dark={dark} />
          <div>
            <p className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${dark ? "text-[#9e9e9e]" : "text-indigo-600"}`}>
              Selected Teacher
            </p>
            <h3 className={`mt-1 text-2xl font-bold ${dark ? "text-white" : "text-slate-900"}`}>
              {teacher?.fullName || "Select a teacher"}
            </h3>
            <p className={`mt-1 text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>{teacher?.email || "Teacher email"}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
              teacher?.isActive === false
                ? dark
                  ? "bg-white/[0.06] text-[#9e9e9e]"
                  : "bg-slate-100 text-slate-600"
                : dark
                  ? "bg-[#4caf50]/15 text-[#4caf50]"
                  : "bg-emerald-50 text-emerald-700"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${teacher?.isActive === false ? "bg-slate-400" : "bg-emerald-500"}`} />
            {teacher?.isActive === false ? "Inactive" : "Active"}
          </span>
          <span className={`text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
            Created {teacher?.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : "—"}
          </span>
        </div>
      </div>

      {loading ? (
        <div
          className={`rounded-xl border px-4 py-8 text-center text-sm ${
            dark ? "border-white/[0.06] text-[#9e9e9e]" : "border-slate-200 text-slate-500"
          }`}
        >
          Loading teacher details...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Classes Assigned" value={stats.classes} tone="blue" dark={dark} icon={<IconUsers />} />
            <StatCard label="Sections Assigned" value={stats.sections} tone="green" dark={dark} icon={<IconFolder />} />
            <StatCard label="Subjects Assigned" value={stats.subjects} tone="purple" dark={dark} icon={<IconBook />} />
            <StatCard label="Total Assignments" value={stats.total} tone="orange" dark={dark} icon={<IconCheck />} />
          </div>

          <div className={`overflow-hidden rounded-2xl border ${dark ? "border-white/[0.06]" : "border-slate-200"}`}>
            <div className={`border-b px-4 py-3 ${dark ? "border-white/[0.06] bg-[#1a1b26]" : "border-slate-100 bg-slate-50"}`}>
              <h4 className={`text-sm font-bold uppercase tracking-[0.12em] ${dark ? "text-white" : "text-slate-800"}`}>
                Assignments Overview
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className={dark ? "bg-[#102a5c] text-white" : "bg-[#0b3a8d] text-white"}>
                  <tr>
                    <th className="px-4 py-3 font-semibold">Class</th>
                    <th className="px-4 py-3 font-semibold">Sections</th>
                    <th className="px-4 py-3 font-semibold">Subjects Assigned</th>
                    <th className="px-4 py-3 font-semibold">No. of Subjects</th>
                  </tr>
                </thead>
                <tbody className={dark ? "bg-[#161722]" : "bg-white"}>
                  {grouped.length ? (
                    grouped.map((row, index) => (
                      <tr
                        key={`${row.className}-${row.section}-${index}`}
                        className={dark ? "border-t border-white/[0.06]" : "border-t border-slate-200"}
                      >
                        <td className={`px-4 py-4 align-top ${dark ? "text-white" : "text-slate-800"}`}>
                          <div className="flex flex-col items-start gap-2">
                            <span
                              className={`inline-flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
                                dark ? "bg-blue-500/15 text-blue-300" : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {row.className.replace(/\D+/g, "") || row.className.charAt(0)}
                            </span>
                            <p className="font-semibold">{row.className}</p>
                          </div>
                        </td>
                        <td className={`px-4 py-4 font-semibold ${dark ? "text-[#e0e0e0]" : "text-slate-700"}`}>
                          {row.className} - {row.section}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            {(row.subjects.length ? row.subjects : ["Class Teacher"]).map((subject) => (
                              <span
                                key={subject}
                                className={`inline-flex rounded-md px-3 py-1.5 text-sm font-medium ${
                                  dark ? "bg-[#7c4dff]/15 text-[#d7d2ff]" : "bg-indigo-50 text-indigo-700"
                                }`}
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className={`px-4 py-4 text-center text-base font-bold ${dark ? "text-white" : "text-slate-900"}`}>
                          {row.subjects.length || 1}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className={`px-4 py-8 text-center text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                        No class assignments found for this teacher.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function TeacherClassesPage({ dark = false }) {
  const [teachers, setTeachers] = useState([]);
  const [fromDate, setFromDate] = useState(todayKey());
  const [toDate, setToDate] = useState(todayKey());
  const [teacherFilter, setTeacherFilter] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [appliedTeacherFilter, setAppliedTeacherFilter] = useState("");
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loadingTeacher, setLoadingTeacher] = useState(false);
  const [error, setError] = useState("");
  const [filterError, setFilterError] = useState("");

  const teacherOptions = useMemo(
    () =>
      teachers
        .map((item) => ({ value: item._id, label: item.fullName || "Unnamed Teacher" }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [teachers]
  );

  const loadTeachers = async () => {
    setLoadingTeachers(true);
    setError("");
    try {
      const { data } = await api.get("/teachers", { params: { page: 1, limit: 500 } });
      setTeachers(data.data?.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load teachers");
      setTeachers([]);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const loadTeacher = async (teacherId) => {
    if (!teacherId) {
      setSelectedTeacher(null);
      return;
    }

    setLoadingTeacher(true);
    setError("");
    try {
      const { data } = await api.get(`/teachers/${teacherId}`);
      setSelectedTeacher(data.data || null);
    } catch (err) {
      const fallback = teachers.find((item) => item._id === teacherId) || null;
      setSelectedTeacher(fallback);
      setError(err.response?.data?.message || "Failed to load teacher details");
    } finally {
      setLoadingTeacher(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacherId) {
      loadTeacher(selectedTeacherId);
    } else {
      setSelectedTeacher(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeacherId]);

  const handleApplyFilter = () => {
    const message = validateFilters(fromDate, toDate);
    if (message) {
      setFilterError(message);
      return;
    }

    setFilterError("");

    const from = parseLocalDateInput(fromDate);
    const to = parseLocalDateInput(toDate);
    if (!from || !to) {
      setFilterError("Please enter valid dates.");
      return;
    }

    const selectedTeacherRow = teacherFilter ? teachers.find((item) => item._id === teacherFilter) || null : null;
    const nextFiltered = teachers.filter((teacher) => {
      const created = teacher?.createdAt ? new Date(teacher.createdAt) : null;
      if (!created || Number.isNaN(created.getTime())) return false;

      const day = new Date(created.getFullYear(), created.getMonth(), created.getDate());
      const withinRange = day >= from && day <= to;
      const matchesTeacher = !teacherFilter || teacher._id === teacherFilter;
      return withinRange && matchesTeacher;
    });

    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setAppliedTeacherFilter(teacherFilter);
    setFilteredTeachers(nextFiltered);

    const nextSelected = selectedTeacherRow || nextFiltered[0] || null;
    setSelectedTeacherId(nextSelected?._id || "");
  };

  const pageClass = dark ? "text-white" : "text-slate-900";
  const panelClass = dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-200 bg-white";
  const summary = appliedFrom && appliedTo ? `${formatDisplayDate(appliedFrom)} to ${formatDisplayDate(appliedTo)}` : "";

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className={`text-2xl font-bold ${pageClass}`}>Assigned Classes & Sections</h2>
        <p className={`text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
          Choose a date range and a teacher, then inspect assignment details below.
        </p>
      </div>

      {error ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            dark ? "border-[#e91e63]/30 bg-[#e91e63]/10 text-[#e91e63]" : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <div className={`rounded-2xl border p-5 ${panelClass}`}>
        <p className={`mb-3 text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>Filter teacher profiles</p>
        <div className="grid grid-cols-1 items-end gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <ModernDatePicker
            label="From date"
            value={fromDate}
            max={toDate || todayKey()}
            dark={dark}
            onChange={(value) => {
              setFromDate(value);
              setFilterError("");
            }}
          />
          <ModernDatePicker
            label="To date"
            value={toDate}
            min={fromDate || undefined}
            max={todayKey()}
            dark={dark}
            onChange={(value) => {
              setToDate(value);
              setFilterError("");
            }}
          />
          <ScrollableSelect
            label="Select Teachers"
            placeholder={loadingTeachers ? "Loading teachers..." : "All teachers"}
            value={teacherFilter}
            options={[{ value: "", label: "All teachers" }, ...teacherOptions]}
            onChange={(value) => {
              setTeacherFilter(value);
              setFilterError("");
            }}
            menuMaxHeight={340}
            openUpward={false}
            dark={dark}
          />
          <button
            type="button"
            onClick={handleApplyFilter}
            disabled={loadingTeachers}
            className={`h-[42px] w-full shrink-0 rounded-xl px-5 text-sm font-semibold text-white disabled:opacity-60 xl:w-auto ${
              dark ? "bg-[#7c4dff] hover:bg-[#6a3df0]" : "ref-btn-primary"
            }`}
          >
            Apply Filters
          </button>
        </div>
        {filterError ? (
          <p className={`mt-3 text-sm ${dark ? "text-[#e91e63]" : "text-rose-600"}`} role="alert">
            {filterError}
          </p>
        ) : null}
        {summary ? (
          <p className={`mt-3 text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
            Showing teachers for {summary}
            {appliedTeacherFilter ? ` · ${teacherOptions.find((item) => item.value === appliedTeacherFilter)?.label || ""}` : ""}
          </p>
        ) : null}
      </div>

      {!appliedFrom && !loadingTeachers ? (
        <div
          className={`rounded-2xl border px-4 py-10 text-center text-sm ${
            dark ? "border-white/[0.06] text-[#9e9e9e]" : "border-slate-200 text-slate-500"
          }`}
        >
          Select date range and teacher, then click Apply Filters to view assigned classes and sections.
        </div>
      ) : (
        <div className="space-y-5">
          <div className={`overflow-hidden rounded-2xl border ${dark ? "border-white/[0.06]" : "border-slate-200"}`}>
            <div
              className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 text-sm ${
                dark ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e]" : "border-slate-100 bg-slate-50 text-slate-600"
              }`}
            >
              <span>
                {filteredTeachers.length} teacher{filteredTeachers.length === 1 ? "" : "s"} found
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className={dark ? "bg-[#102a5c] text-white" : "bg-[#0b3a8d] text-white"}>
                  <tr>
                    <th className="px-4 py-3 font-semibold">Teacher Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Assigned Classes</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className={dark ? "bg-[#161722]" : "bg-white"}>
                  {loadingTeachers ? (
                    <tr>
                      <td colSpan={4} className={`px-4 py-8 text-center ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                        Loading teachers...
                      </td>
                    </tr>
                  ) : filteredTeachers.length ? (
                    filteredTeachers.map((teacher) => {
                      const isActive = teacher.isActive !== false;
                      const isSelected = selectedTeacherId === teacher._id;
                      const assignmentCount = (teacher.assignedClasses || []).length;
                      return (
                        <tr
                          key={teacher._id}
                          className={`cursor-pointer border-t ${dark ? "border-white/[0.06]" : "border-slate-200"} ${
                            isSelected ? (dark ? "bg-[#7c4dff]/10" : "bg-indigo-50/70") : ""
                          }`}
                          onClick={() => setSelectedTeacherId(teacher._id)}
                        >
                          <td className={`px-4 py-3 font-medium ${dark ? "text-white" : "text-slate-800"}`}>
                            <div className="flex items-center gap-3">
                              <TeacherAvatar name={teacher.fullName} dark={dark} />
                              <div>
                                <p>{teacher.fullName}</p>
                                <p className={`text-xs font-normal ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                                  {teacher.createdAt ? `Created ${formatTeacherCreatedDate(teacher.createdAt)}` : ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className={`px-4 py-3 ${dark ? "text-[#e0e0e0]" : "text-slate-700"}`}>{teacher.email || "—"}</td>
                          <td className={`px-4 py-3 ${dark ? "text-[#e0e0e0]" : "text-slate-700"}`}>{assignmentCount}</td>
                          <td className={`px-4 py-3 ${dark ? "text-[#e0e0e0]" : "text-slate-700"}`}>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                isActive
                                  ? dark
                                    ? "bg-[#4caf50]/15 text-[#4caf50]"
                                    : "bg-emerald-50 text-emerald-700"
                                  : dark
                                    ? "bg-white/[0.06] text-[#9e9e9e]"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className={`px-4 py-8 text-center ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                        No teachers found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <TeacherDetailsCard teacher={selectedTeacher} dark={dark} loading={loadingTeacher} />
        </div>
      )}
    </section>
  );
}
