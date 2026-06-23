import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import api from "../../services/api/client";
import { getClassSectionOptions } from "../../constants/classes";
import { resolveStudentPhotoUrl } from "../../utils/mediaUrl";
import { formatStudentCreatedDate, matchesStudentClassSection, matchesStudentCreatedDateRange } from "../../utils/studentFormat";
import StudentProfileDetails, { StudentProfileHeaderMeta } from "./StudentProfileDetails";
import ModernDatePicker from "../ui/ModernDatePicker";
import ScrollableSelect from "../ui/ScrollableSelect";

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

function defaultFromDate() {
  return todayKey();
}

function todayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function filterStudents(items, from, to, className, section) {
  return items.filter(
    (student) =>
      matchesStudentCreatedDateRange(student, from, to) &&
      matchesStudentClassSection(student, className, section)
  );
}

function formatDisplayDate(value) {
  const parsed = parseLocalDateInput(value);
  if (!parsed) return value;
  return parsed.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" });
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

function parseClassSection(value) {
  if (!value) return { className: "", section: "" };
  const [className, section] = value.split("|");
  return { className: className || "", section: section || "" };
}

function StatusBadge({ status, dark = false }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active
          ? dark
            ? "bg-[#4caf50]/15 text-[#4caf50]"
            : "bg-emerald-50 text-emerald-700"
          : dark
            ? "bg-white/[0.06] text-[#9e9e9e]"
            : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
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

function StudentAvatar({ student, dark = false, size = "md" }) {
  const dim = size === "lg" ? "h-20 w-20 text-xl" : "h-10 w-10 text-sm";
  const initials = `${student?.firstName || ""}${student?.lastName || ""}`
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";
  const photo = resolveStudentPhotoUrl(student?.studentPhotoUrl);

  if (photo) {
    return (
      <img
        src={photo}
        alt={`${student?.firstName || ""} ${student?.lastName || ""}`.trim() || initials}
        className={`${dim} shrink-0 rounded-full object-cover ring-2 ring-white`}
      />
    );
  }

  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full font-semibold ${
        dark ? "bg-[#7c4dff]/20 text-[#b794ff]" : "bg-blue-100 text-blue-700"
      }`}
    >
      {initials}
    </div>
  );
}

function StudentProfileOverlay({ student, dark, loading, onClose }) {
  if (!student && !loading) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[110] flex items-center justify-center px-4 ${
        dark ? "bg-[#0b0c15]/70 backdrop-blur-sm" : "bg-slate-900/45 backdrop-blur-[2px]"
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`modal-panel-enter w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl ${
          dark
            ? "border-white/[0.06] bg-[#161722]"
            : "border-slate-200 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.18)]"
        }`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {loading ? (
          <div className={`px-6 py-12 text-center text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
            Loading profile...
          </div>
        ) : (
          <>
            <div
              className={`border-b px-6 py-5 ${
                dark
                  ? "border-white/[0.06] bg-[#1a1b26]"
                  : "border-slate-100 bg-gradient-to-r from-slate-50 to-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <StudentAvatar student={student} size="lg" dark={dark} />
                <div>
                  <h3 className={`text-lg font-bold ${dark ? "text-white" : "text-slate-900"}`}>
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className={`text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>{student.admissionNo}</p>
                  <div className="mt-1">
                    <StatusBadge status={student.status || "ACTIVE"} dark={dark} />
                  </div>
                </div>
              </div>
              <StudentProfileHeaderMeta student={student} dark={dark} />
            </div>
            <StudentProfileDetails student={student} dark={dark} />
            <div
              className={`flex justify-end border-t px-6 py-4 ${
                dark ? "border-white/[0.06]" : "border-slate-100"
              }`}
            >
              <button
                type="button"
                onClick={onClose}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium text-white ${
                  dark ? "bg-[#7c4dff] hover:bg-[#6a3df0]" : "ref-btn-primary"
                }`}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export default function StudentProfilesModal({ dark = false }) {
  const today = todayKey();
  const [fromDate, setFromDate] = useState(defaultFromDate);
  const [toDate, setToDate] = useState(today);
  const [classSection, setClassSection] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [appliedClassSection, setAppliedClassSection] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterError, setFilterError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [profileStudent, setProfileStudent] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const classSectionOptions = useMemo(
    () => [
      { value: "", label: "All classes" },
      ...getClassSectionOptions().map((item) => ({ value: item.value, label: item.label })),
    ],
    []
  );

  const appliedClassLabel =
    classSectionOptions.find((item) => item.value === appliedClassSection)?.label || "All classes";

  const filterSummary =
    appliedFrom && appliedTo
      ? `${appliedClassLabel} · ${
          appliedFrom === appliedTo
            ? formatDisplayDate(appliedFrom)
            : `${formatDisplayDate(appliedFrom)} to ${formatDisplayDate(appliedTo)}`
        }`
      : "";

  const handleApplyFilter = async () => {
    const message = validateFilters(fromDate, toDate);
    if (message) {
      setFilterError(message);
      return;
    }

    setFilterError("");
    setLoadError("");
    setLoading(true);

    const { className, section } = parseClassSection(classSection);

    try {
      const { data } = await api.get("/students", {
        params: {
          page: 1,
          limit: 500,
          className: className || undefined,
          section: section || undefined,
        },
      });

      const filtered = filterStudents(data.data?.items || [], fromDate, toDate, className, section);
      setStudents(filtered);
      setAppliedFrom(fromDate);
      setAppliedTo(toDate);
      setAppliedClassSection(classSection);
    } catch (err) {
      setLoadError(err.response?.data?.message || "Failed to load student profiles");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (student) => {
    setProfileLoading(true);
    setProfileStudent(student);
    try {
      const { data } = await api.get(`/students/${student._id}`);
      setProfileStudent(data.data || student);
    } catch {
      setProfileStudent(student);
    } finally {
      setProfileLoading(false);
    }
  };

  const thClass = dark
    ? "bg-[#1a1b26] px-4 py-3 font-medium text-[#9e9e9e]"
    : "bg-slate-50 px-4 py-3 font-medium text-slate-500";
  const tdClass = dark ? "px-4 py-3 text-[#e0e0e0]" : "px-4 py-3 text-slate-700";
  const rowHover = dark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50/50";
  const borderClass = dark ? "border-white/[0.06]" : "border-slate-100";

  return (
    <>
      <div className="space-y-5">
      <div
        className={`rounded-2xl border p-4 ${
          dark ? "border-white/[0.06] bg-[#1a1b26]/60" : "border-slate-200 bg-slate-50/70"
        }`}
      >
        <p className={`mb-3 text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>
          Filter student profiles
        </p>
        <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
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
            label="Class & Section"
            placeholder="All classes"
            value={classSection}
            options={classSectionOptions}
            onChange={(value) => {
              setClassSection(value);
              setFilterError("");
            }}
            menuMaxHeight={320}
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
            Showing profiles for {filterSummary}
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
          Select date range and class/section, then click Apply Filter to view student profiles.
        </div>
      ) : (
        <div className={`overflow-hidden rounded-2xl border ${dark ? "border-white/[0.06]" : "border-slate-200"}`}>
          <div
            className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 text-sm ${
              dark ? "border-white/[0.06] bg-[#1a1b26] text-[#9e9e9e]" : "border-slate-100 bg-slate-50 text-slate-600"
            }`}
          >
            <span>
              {students.length} student{students.length === 1 ? "" : "s"} found
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className={`text-left ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                <tr>
                  <th className={thClass}>Profile</th>
                  <th className={thClass}>Roll Number</th>
                  <th className={thClass}>Student ID</th>
                  <th className={thClass}>Name</th>
                  <th className={thClass}>Class</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>View</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className={`px-4 py-8 text-center ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                      Loading student profiles...
                    </td>
                  </tr>
                ) : students.length ? (
                  students.map((student) => {
                    const createdDate = formatStudentCreatedDate(student);
                    return (
                    <tr key={student._id} className={`border-t ${borderClass} ${rowHover}`}>
                      <td className={tdClass}>
                        <StudentAvatar student={student} dark={dark} />
                      </td>
                      <td className={`${tdClass} font-mono text-xs`}>{student.rollNumber || "—"}</td>
                      <td className={`${tdClass} font-mono text-xs`}>{student.admissionNo || "—"}</td>
                      <td className={`${tdClass} font-medium ${dark ? "text-white" : "text-slate-800"}`}>
                        <p>
                          {student.firstName} {student.lastName}
                        </p>
                        {createdDate ? (
                          <p className={`text-xs font-normal ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                            Created {createdDate}
                          </p>
                        ) : null}
                      </td>
                      <td className={tdClass}>
                        {student.className ? `${student.className} - ${student.section || "A"}` : "—"}
                      </td>
                      <td className={tdClass}>
                        <StatusBadge status={student.status || "ACTIVE"} dark={dark} />
                      </td>
                      <td className={tdClass}>
                        <button
                          type="button"
                          title="View student profile"
                          onClick={() => handleViewProfile(student)}
                          className={`inline-flex items-center rounded-lg border p-1.5 transition ${
                            dark
                              ? "border-white/[0.06] text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                              : "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          }`}
                        >
                          <IconEye />
                        </button>
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className={`px-4 py-8 text-center ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                      No student profiles found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </div>

      <StudentProfileOverlay
        student={profileStudent}
        dark={dark}
        loading={profileLoading}
        onClose={() => {
          setProfileStudent(null);
          setProfileLoading(false);
        }}
      />
    </>
  );
}
