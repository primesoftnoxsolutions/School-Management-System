import { useMemo, useState } from "react";
import api from "../../services/api/client";
import { CLASS_OPTIONS, SECTION_OPTIONS, SUBJECT_OPTIONS } from "../../constants/classes";
import ModernDatePicker from "../ui/ModernDatePicker";
import ScrollableSelect from "../ui/ScrollableSelect";

const ALL_CLASSES = "ALL_CLASSES";
const ALL_SECTIONS = "ALL_SECTIONS";
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

function toLocalDateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function filterRows(rows, from, to, className, section) {
  return rows.filter((row) => {
    const key = toLocalDateKey(row.assignedAt);
    if (key < from || key > to) return false;
    if (className && className !== ALL_CLASSES && row.className !== className) return false;
    if (section && section !== ALL_SECTIONS && row.section !== section) return false;
    return true;
  });
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
        display: `${classLabel}, ${subjects.join(", ")}`,
      };
    });
}

function groupHistoryByTeacher(rows = []) {
  const map = new Map();

  rows.forEach((row) => {
    const key = row.teacherId || `${row.teacherName}|${row.email}`;
    if (!map.has(key)) {
      map.set(key, {
        teacherId: key,
        teacherName: row.teacherName,
        email: row.email,
        assignedAt: row.assignedAt,
        assignments: [],
      });
    }

    const entry = map.get(key);
    if (new Date(row.assignedAt).getTime() > new Date(entry.assignedAt).getTime()) {
      entry.assignedAt = row.assignedAt;
    }
    entry.assignments.push({
      className: row.className,
      section: row.section,
      subject: row.subject,
      assignmentStatus: row.assignmentStatus,
    });
  });

  return [...map.values()].sort((a, b) => a.teacherName.localeCompare(b.teacherName));
}

function HistoryClassBadge({ assignments = [], dark = false }) {
  if (!assignments.length) {
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

  const grouped = groupAssignedClasses(assignments);

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

function getOverallAssignmentStatus(assignments = []) {
  if (!assignments.length) return "Inactive";
  return assignments.every((item) => item.assignmentStatus === "Removed") ? "Removed" : "Active";
}

function formatClassLabel(value) {
  if (!value || value === ALL_CLASSES) return "All Classes";
  return value;
}

function formatSectionLabel(value) {
  if (!value || value === ALL_SECTIONS) return "All Sections";
  return `Section ${value}`;
}

function formatDisplayDate(value) {
  const date = parseLocalDateInput(value);
  if (!date) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function exportAssignmentHistoryCsv(groupedTeachers, { from, to, className, section }) {
  const header = ["Assigned On", "Teacher Name", "Assigned Class", "Assignment Status"];
  const csvRows = groupedTeachers.map((teacher) => [
    formatDateTime(teacher.assignedAt),
    teacher.teacherName,
    groupAssignedClasses(teacher.assignments)
      .map((group) => group.display)
      .join("; "),
    getOverallAssignmentStatus(teacher.assignments),
  ]);
  const csv = [header, ...csvRows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `teacher-assignment-history_${from}_${to}_${slugify(formatClassLabel(className))}_${slugify(formatSectionLabel(section))}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function IconDownload() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
    </svg>
  );
}

function StatusBadge({ label, tone = "neutral", dark = false }) {
  const tones = {
    active: dark ? "bg-[#4caf50]/15 text-[#4caf50]" : "bg-emerald-50 text-emerald-700",
    removed: dark ? "bg-[#e91e63]/15 text-[#e91e63]" : "bg-rose-50 text-rose-700",
    inactive: dark ? "bg-white/[0.06] text-[#9e9e9e]" : "bg-slate-100 text-slate-600",
    neutral: dark ? "bg-[#7c4dff]/15 text-[#7c4dff]" : "bg-indigo-50 text-indigo-700",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone] || tones.neutral}`}>
      {label}
    </span>
  );
}

export default function TeacherAssignmentHistoryModal({ dark = false }) {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const defaultFrom = monthAgo.toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(today);
  const [className, setClassName] = useState(ALL_CLASSES);
  const [section, setSection] = useState(ALL_SECTIONS);
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [appliedClass, setAppliedClass] = useState("");
  const [appliedSection, setAppliedSection] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterError, setFilterError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [total, setTotal] = useState(0);

  const groupedTeachers = useMemo(() => groupHistoryByTeacher(rows), [rows]);

  const classOptions = useMemo(
    () => [
      { value: ALL_CLASSES, label: "Select All Classes" },
      ...CLASS_OPTIONS.map((item) => ({ value: item, label: item })),
    ],
    []
  );
  const sectionOptions = useMemo(
    () => [
      { value: ALL_SECTIONS, label: "Select All Sections" },
      ...SECTION_OPTIONS.map((item) => ({ value: item, label: `Section ${item}` })),
    ],
    []
  );

  const loadHistory = async (from, to, nextClass, nextSection) => {
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await api.get("/teachers/assignment-history", {
        params: {
          from,
          to,
          className: nextClass,
          section: nextSection,
          page: 1,
          limit: 200,
        },
      });
      const items = filterRows(data.data?.items || [], from, to, nextClass, nextSection);
      setRows(items);
      setTotal(items.length);
    } catch (err) {
      setLoadError(err.response?.data?.message || "Failed to load assignment history");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    const message = validateFilters(fromDate, toDate);
    if (message) {
      setFilterError(message);
      return;
    }
    setFilterError("");
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setAppliedClass(className || ALL_CLASSES);
    setAppliedSection(section || ALL_SECTIONS);
    loadHistory(fromDate, toDate, className || ALL_CLASSES, section || ALL_SECTIONS);
  };

  const handleExport = () => {
    if (!appliedFrom || !appliedTo) {
      setFilterError("Apply filter first before exporting.");
      return;
    }
    if (!rows.length) {
      setFilterError("No assignment history to export for the selected filters.");
      return;
    }
    setFilterError("");
    exportAssignmentHistoryCsv(groupedTeachers, {
      from: appliedFrom,
      to: appliedTo,
      className: appliedClass,
      section: appliedSection,
    });
  };

  const filterSummary =
    appliedFrom && appliedTo
      ? `${formatClassLabel(appliedClass)} · ${formatSectionLabel(appliedSection)} · ${
          appliedFrom === appliedTo
            ? formatDisplayDate(appliedFrom)
            : `${formatDisplayDate(appliedFrom)} to ${formatDisplayDate(appliedTo)}`
        }`
      : "";

  return (
    <div className="space-y-5">
      <div
        className={`rounded-2xl border p-4 ${
          dark ? "border-white/[0.06] bg-[#1a1b26]/60" : "border-slate-200 bg-slate-50/70"
        }`}
      >
        <p className={`mb-3 text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>
          Filter assignment history
        </p>
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <ModernDatePicker
            label="From date"
            value={fromDate}
            max={toDate || today}
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
            max={today}
            dark={dark}
            onChange={(value) => {
              setToDate(value);
              setFilterError("");
            }}
          />
          <ScrollableSelect
            label="Class"
            placeholder="Select class"
            value={className}
            options={classOptions}
            onChange={(value) => {
              setClassName(value);
              setFilterError("");
            }}
            dark={dark}
          />
          <ScrollableSelect
            label="Section"
            placeholder="Select section"
            value={section}
            options={sectionOptions}
            onChange={(value) => {
              setSection(value);
              setFilterError("");
            }}
            dark={dark}
          />
          <button
            type="button"
            onClick={handleApplyFilter}
            disabled={loading}
            className={`h-[42px] w-full shrink-0 rounded-xl px-5 text-sm font-semibold text-white disabled:opacity-60 xl:w-auto ${
              dark ? "bg-[#7c4dff] hover:bg-[#6a3df0]" : "ref-btn-primary"
            }`}
          >
            {loading ? "Loading..." : "Apply Filter"}
          </button>
        </div>
        {filterError ? (
          <p className={`mt-3 text-sm ${dark ? "text-[#e91e63]" : "text-rose-600"}`} role="alert">
            {filterError}
          </p>
        ) : null}
        {filterSummary ? (
          <p className={`mt-3 text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
            Showing history for {filterSummary}
          </p>
        ) : null}
      </div>

      {loadError ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            dark ? "border-[#e91e63]/30 bg-[#e91e63]/10 text-[#e91e63]" : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
          role="alert"
        >
          {loadError}
        </div>
      ) : null}

      {!appliedFrom && !loading ? (
        <div
          className={`rounded-xl border px-4 py-10 text-center text-sm ${
            dark ? "border-white/[0.06] text-[#9e9e9e]" : "border-slate-200 text-slate-500"
          }`}
        >
          Select date range, class, section and click Apply Filter to view assignment history.
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl border ${dark ? "border-white/[0.06]" : "border-slate-200"}`}>
          <div
            className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 text-sm ${
              dark ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e]" : "border-slate-100 bg-slate-50 text-slate-600"
            }`}
          >
            <span>
              {groupedTeachers.length} teacher{groupedTeachers.length === 1 ? "" : "s"} · {total} assignment
              {total === 1 ? "" : "s"}
            </span>
            <button
              type="button"
              onClick={handleExport}
              disabled={loading || !groupedTeachers.length}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                dark
                  ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <IconDownload />
              Export
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr
                  className={`border-b text-left text-[11px] font-semibold uppercase tracking-wider ${
                    dark ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e]" : "border-slate-100 bg-slate-50/80 text-slate-500"
                  }`}
                >
                  <th className="px-4 py-3">Assigned On</th>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Assigned Class</th>
                  <th className="px-4 py-3">Assignment</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className={`px-4 py-10 text-center ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                      Loading assignment history...
                    </td>
                  </tr>
                ) : groupedTeachers.length ? (
                  groupedTeachers.map((teacher) => {
                    const status = getOverallAssignmentStatus(teacher.assignments);
                    return (
                      <tr
                        key={teacher.teacherId}
                        className={
                          dark ? "border-b border-white/[0.06] hover:bg-white/[0.03]" : "border-b border-slate-50 hover:bg-slate-50/50"
                        }
                      >
                        <td className={`px-4 py-3 whitespace-nowrap ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
                          {formatDateTime(teacher.assignedAt)}
                        </td>
                        <td className={`px-4 py-3 font-medium ${dark ? "text-white" : "text-slate-800"}`}>
                          {teacher.teacherName}
                        </td>
                        <td className="px-4 py-3">
                          <HistoryClassBadge assignments={teacher.assignments} dark={dark} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge
                            label={status}
                            tone={status === "Active" ? "active" : "removed"}
                            dark={dark}
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className={`px-4 py-10 text-center ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                      No assignments found for {formatClassLabel(appliedClass)}, {formatSectionLabel(appliedSection)} on the selected date
                      {appliedFrom === appliedTo ? "" : " range"}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
