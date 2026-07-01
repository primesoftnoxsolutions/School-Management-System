import { useEffect, useMemo, useState } from "react";
import api from "../../services/api/client";
import { CLASS_OPTIONS, SECTION_OPTIONS } from "../../constants/classes";
import ModernDatePicker from "../ui/ModernDatePicker";
import ScrollableSelect from "../ui/ScrollableSelect";

const ALL_CLASSES = "ALL_CLASSES";
const ALL_SECTIONS = "ALL_SECTIONS";
const ALL_STATUSES = "ALL_STATUSES";

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

function formatClassLabel(value) {
  if (!value || value === ALL_CLASSES) return "All Classes";
  return value;
}

function formatSectionLabel(value) {
  if (!value || value === ALL_SECTIONS) return "All Sections";
  return `Section ${value}`;
}

function formatStatusLabel(value) {
  if (!value || value === ALL_STATUSES) return "All Status";
  return value;
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

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatSalary(value) {
  if (value === "" || value == null) return "Not set";
  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value);
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatAssignedClassSection(row) {
  if (!row?.className) return "";
  return `${row.className}-${row.section || "A"}`;
}

function exportTeacherHistoryCsv(teachers, { from, to, className, section, status }) {
  const header = [
    "Teacher Name",
    "Email ID",
    "Password",
    "Created Date",
    "Joining Date",
    "Qualification",
    "Designation",
    "Assign Classes/Section",
    "Branch",
    "Phone Number",
    "Salary",
    "Address",
    "Status",
  ];
  const csvRows = teachers.map((teacher) => [
    teacher.teacherName,
    teacher.email,
    teacher.loginPassword,
    formatDate(teacher.createdAt),
    formatDate(teacher.joiningDate),
    teacher.qualification,
    teacher.designation,
    teacher.assignedClassSections,
    teacher.branches,
    teacher.phoneNumber,
    teacher.salary,
    teacher.address,
    teacher.status,
  ]);
  const csv = [header, ...csvRows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `teacher-assignment-history_${from}_${to}_${slugify(formatClassLabel(className))}_${slugify(
    formatSectionLabel(section)
  )}_${slugify(formatStatusLabel(status))}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function IconEye() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function IconKey() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.5 7.5a4 4 0 11-5.6 5.6L4 19v-3H1v-3l5.9-5.9a4 4 0 018.6.4z"
      />
      <circle cx="15" cy="9" r="1.5" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
    </svg>
  );
}

function StatusBadge({ status, dark = false }) {
  const active = status === "Active";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? dark
            ? "bg-[#4caf50]/15 text-[#4caf50]"
            : "bg-emerald-50 text-emerald-700"
          : dark
            ? "bg-[#e91e63]/15 text-[#e91e63]"
            : "bg-rose-50 text-rose-700"
      }`}
    >
      {status}
    </span>
  );
}

function getTeacherDetailRows(rows = []) {
  const map = new Map();

  rows.forEach((row) => {
    const key = row.teacherId || `${row.teacherName}|${row.email}`;
    if (!map.has(key)) {
      map.set(key, {
        id: key,
        teacher: {
          _id: row.teacherId,
          id: row.teacherId,
          fullName: row.teacherName || "Not set",
          email: row.email || "",
          isActive: Boolean(row.isActive),
          createdAt: row.teacherCreatedAt || row.createdAt,
          assignedClasses: row.assignedClasses || [],
          profile: row.profile || null,
        },
        teacherName: row.teacherName || "Not set",
        email: row.email || "Not set",
        loginPassword: row.profile?.loginPassword || "Not set",
        createdAt: row.teacherCreatedAt || row.createdAt,
        joiningDate: row.teacherCreatedAt || row.createdAt,
        qualification: row.profile?.qualification || "Not set",
        designation: row.profile?.designation || "Not set",
        branches: new Set(),
        phoneNumber: row.profile?.phoneNumber || "Not set",
        salary: formatSalary(row.profile?.salary),
        address: row.profile?.address || "Not set",
        status: row.teacherStatus === "Removed" || row.assignmentStatus === "Removed" ? "Removed" : "Active",
        assignedClassSections: new Set(),
      });
    }

    const entry = map.get(key);
    const classSection = formatAssignedClassSection(row);
    if (classSection) entry.assignedClassSections.add(classSection);
    if (Array.isArray(row.assignedClasses) && row.assignedClasses.length) {
      row.assignedClasses.forEach((assignment) => {
        if (assignment?.branch) entry.branches.add(assignment.branch === "Boys" ? "Boys" : "Girls");
      });
    }
    if (row.teacherStatus !== "Removed" && row.assignmentStatus === "Active") {
      entry.status = "Active";
    }
  });

  return [...map.values()]
    .map((teacher) => ({
      ...teacher,
      assignedClassSections: [...teacher.assignedClassSections].join(", ") || "Not set",
      branches: [...teacher.branches].join(", ") || "Not set",
    }))
    .sort((a, b) => a.teacherName.localeCompare(b.teacherName));
}

export default function TeacherAssignmentHistoryModal({
  dark = false,
  onViewProfile,
  onViewLoginDetails,
  onEditTeacher,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const defaultFrom = monthAgo.toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(today);
  const [className, setClassName] = useState(ALL_CLASSES);
  const [section, setSection] = useState(ALL_SECTIONS);
  const [status, setStatus] = useState("Active");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [appliedClass, setAppliedClass] = useState("");
  const [appliedSection, setAppliedSection] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterError, setFilterError] = useState("");
  const [loadError, setLoadError] = useState("");

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
  const statusOptions = useMemo(
    () => [
      { value: ALL_STATUSES, label: "Select Status" },
      { value: "Active", label: "Active" },
      { value: "Removed", label: "Removed" },
    ],
    []
  );

  const teacherDetails = useMemo(() => getTeacherDetailRows(rows), [rows]);
  const displayedTeacherDetails = useMemo(
    () => (status && status !== ALL_STATUSES ? teacherDetails.filter((teacher) => teacher.status === status) : teacherDetails),
    [status, teacherDetails]
  );

  useEffect(() => {
    const message = validateFilters(fromDate, toDate);
    if (message) {
      setFilterError(message);
      setRows([]);
      setAppliedFrom("");
      setAppliedTo("");
      return undefined;
    }

    let cancelled = false;
    setFilterError("");
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setAppliedClass(className || ALL_CLASSES);
    setAppliedSection(section || ALL_SECTIONS);
    setLoading(true);
    setLoadError("");

    api
      .get("/teachers/assignment-history", {
        params: {
          from: fromDate,
          to: toDate,
          className: className || ALL_CLASSES,
          section: section || ALL_SECTIONS,
          page: 1,
          limit: 200,
        },
      })
      .then(({ data }) => {
        if (cancelled) return;
        const items = filterRows(data.data?.items || [], fromDate, toDate, className || ALL_CLASSES, section || ALL_SECTIONS);
        setRows(items);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err.response?.data?.message || "Failed to load assignment history");
        setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [className, fromDate, section, toDate]);

  const handleExport = () => {
    if (!appliedFrom || !appliedTo) {
      setFilterError("Apply filter first before exporting.");
      return;
    }
    if (!displayedTeacherDetails.length) {
      setFilterError("No teacher details to export for the selected filters.");
      return;
    }
    setFilterError("");
    exportTeacherHistoryCsv(displayedTeacherDetails, {
      from: appliedFrom,
      to: appliedTo,
      className: appliedClass,
      section: appliedSection,
      status,
    });
  };

  const filterSummary =
    appliedFrom && appliedTo
      ? `${formatClassLabel(appliedClass)} - ${formatSectionLabel(appliedSection)} - ${formatStatusLabel(status)} - ${
          appliedFrom === appliedTo
            ? formatDisplayDate(appliedFrom)
            : `${formatDisplayDate(appliedFrom)} to ${formatDisplayDate(appliedTo)}`
        }`
      : "";

  return (
    <div className="space-y-5">
      <div
        className={`rounded-2xl border px-4 py-3 ${
          dark ? "border-white/[0.06] bg-[#1a1b26]/60" : "border-slate-200 bg-slate-50/70"
        }`}
      >
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
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
          <ScrollableSelect
            label="Status"
            placeholder="Select Status"
            value={status}
            options={statusOptions}
            onChange={(value) => {
              setStatus(value);
              setFilterError("");
            }}
            dark={dark}
          />
          <button
            type="button"
            onClick={handleExport}
            disabled={loading || !appliedFrom || !displayedTeacherDetails.length}
            title="Export selected teacher details"
            aria-label="Export selected teacher details"
            className={`flex h-[42px] w-full shrink-0 items-center justify-center rounded-xl border px-5 text-sm font-semibold disabled:opacity-50 xl:w-[96px] ${
              dark
                ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <IconDownload />
            <span className="ml-2">Export</span>
          </button>
        </div>
        {filterError ? (
          <p className={`mt-2 text-sm ${dark ? "text-[#e91e63]" : "text-rose-600"}`} role="alert">
            {filterError}
          </p>
        ) : null}
        {filterSummary ? (
          <p className={`mt-2 text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
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

      {appliedFrom ? (
        <div className={`overflow-hidden rounded-2xl border ${dark ? "border-white/[0.06]" : "border-slate-200"}`}>
          <div
            className={`border-b px-4 py-3 text-sm ${
              dark ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e]" : "border-slate-100 bg-slate-50 text-slate-600"
            }`}
          >
            {displayedTeacherDetails.length} teacher{displayedTeacherDetails.length === 1 ? "" : "s"} matched the selected filters.
          </div>
          <div className="max-w-full overflow-x-auto pb-3">
            <table className="min-w-[1900px] table-auto text-sm">
              <thead>
                <tr
                  className={`border-b text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
                    dark ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e]" : "border-slate-100 bg-slate-50/80 text-slate-500"
                  }`}
                >
                  <th className="min-w-[170px] px-6 py-3">Teacher Name</th>
                  <th className="min-w-[150px] px-6 py-3">Created Date</th>
                  <th className="min-w-[150px] px-6 py-3">Joining Date</th>
                  <th className="min-w-[170px] px-6 py-3">Qualification</th>
                  <th className="min-w-[170px] px-6 py-3">Designation</th>
                  <th className="min-w-[280px] px-4 py-3">Assign Classes/Section</th>
                  <th className="min-w-[120px] px-4 py-3">Branch</th>
                  <th className="min-w-[150px] px-4 py-3">Phone Number</th>
                  <th className="min-w-[130px] px-4 py-3">Salary</th>
                  <th className="min-w-[280px] px-4 py-3">Address</th>
                  <th className="min-w-[130px] px-6 py-3">Status</th>
                  <th className="min-w-[120px] px-6 py-3 text-right">Profile</th>
                  <th className="min-w-[170px] px-6 py-3 text-right">Login Details</th>
                  <th className="min-w-[100px] px-6 py-3 text-right">Edit</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={14} className={`px-4 py-10 text-center ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                      Loading teacher details...
                    </td>
                  </tr>
                ) : displayedTeacherDetails.length ? (
                  displayedTeacherDetails.map((teacher) => (
                    <tr
                      key={teacher.id}
                      className={
                        dark ? "border-b border-white/[0.06] hover:bg-white/[0.03]" : "border-b border-slate-50 hover:bg-slate-50/50"
                      }
                    >
                      <td className={`whitespace-nowrap px-6 py-3 font-medium ${dark ? "text-white" : "text-slate-800"}`}>
                        {teacher.teacherName}
                      </td>
                      <td className={`whitespace-nowrap px-6 py-3 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
                        {formatDate(teacher.createdAt)}
                      </td>
                      <td className={`whitespace-nowrap px-6 py-3 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
                        {formatDate(teacher.joiningDate)}
                      </td>
                      <td className={`whitespace-nowrap px-6 py-3 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
                        {teacher.qualification}
                      </td>
                      <td className={`whitespace-nowrap px-6 py-3 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
                        {teacher.designation}
                      </td>
                      <td className={`whitespace-nowrap px-4 py-3 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
                        {teacher.assignedClassSections}
                      </td>
                      <td className={`whitespace-nowrap px-4 py-3 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
                        {teacher.branches}
                      </td>
                      <td className={`whitespace-nowrap px-4 py-3 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
                        {teacher.phoneNumber}
                      </td>
                      <td className={`whitespace-nowrap px-4 py-3 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
                        {teacher.salary}
                      </td>
                      <td className={`whitespace-nowrap px-4 py-3 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
                        {teacher.address}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3">
                        <StatusBadge status={teacher.status} dark={dark} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right">
                        {teacher.status === "Active" ? (
                          <button
                            type="button"
                            onClick={() => onViewProfile?.(teacher.teacher)}
                            title="View teacher profile"
                            className={`inline-flex items-center rounded-lg border p-1.5 ${
                              dark
                                ? "border-white/[0.06] text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                                : "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                            }`}
                          >
                            <IconEye />
                          </button>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right">
                        {teacher.status === "Active" ? (
                          <button
                            type="button"
                            onClick={() => onViewLoginDetails?.(teacher.teacher)}
                            title="View login details"
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium ${
                              dark
                                ? "border-[#7c4dff]/30 bg-[#7c4dff]/10 text-[#7c4dff] hover:bg-[#7c4dff]/15"
                                : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                            }`}
                          >
                            <IconKey />
                            Login Details
                          </button>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-6 py-3 text-right">
                        {teacher.status === "Active" ? (
                          <button
                            type="button"
                            onClick={() => onEditTeacher?.(teacher.teacher)}
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                              dark ? "text-[#7c4dff] hover:bg-white/[0.04]" : "text-indigo-600 hover:bg-indigo-50"
                            }`}
                          >
                            Edit
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={14} className={`px-4 py-10 text-center ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                      No teachers found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          className={`rounded-xl border px-4 py-10 text-center text-sm ${
            dark ? "border-white/[0.06] text-[#9e9e9e]" : "border-slate-200 text-slate-500"
          }`}
        >
          Select date range, class, section, or status to view matching teacher details.
        </div>
      )}
    </div>
  );
}
