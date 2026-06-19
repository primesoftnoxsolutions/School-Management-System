import { useEffect, useState } from "react";
import api from "../services/api/client";
import FormModal from "../components/ui/FormModal";
import { CLASS_OPTIONS, SECTION_OPTIONS, SUBJECT_OPTIONS, getClassSectionOptions } from "../constants/classes";

const emptyAssignment = { className: "", section: "A", subject: "" };

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  assignments: [{ ...emptyAssignment }],
};

const initialEditForm = {
  teacherId: "",
  fullName: "",
  email: "",
  password: "",
  isActive: true,
  assignments: [{ ...emptyAssignment }],
};

function IconUsers() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m8-4a4 4 0 11-8 0 4 4 0 018 0zm-4 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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

function IconDownload() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
    </svg>
  );
}

function IconActivity() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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

function StatusPill({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ClassBadge({ assignedClasses = [] }) {
  if (!assignedClasses.length) {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        Not assigned
      </span>
    );
  }
  return (
    <div className="flex flex-wrap gap-1">
      {assignedClasses.map((item) => (
        <span
          key={`${item.className}-${item.section}-${item.subject}`}
          className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
        >
          {item.className} {item.section || "A"} · {item.subject || "Class Teacher"}
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

function AssignmentFields({ assignments, onChange, classOptions }) {
  const updateRow = (index, patch) => {
    const next = assignments.map((row, i) => (i === index ? { ...row, ...patch } : row));
    onChange(next);
  };

  const addRow = () => onChange([...assignments, { ...emptyAssignment }]);
  const removeRow = (index) => {
    if (assignments.length === 1) return;
    onChange(assignments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">Class assignments *</p>
      {assignments.map((row, index) => (
        <div key={index} className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-4">
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            value={row.className}
            onChange={(e) => updateRow(index, { className: e.target.value })}
            required
          >
            <option value="">Class *</option>
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            value={row.section}
            onChange={(e) => updateRow(index, { section: e.target.value })}
            required
          >
            {SECTION_OPTIONS.map((sec) => (
              <option key={sec} value={sec}>Section {sec}</option>
            ))}
          </select>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm sm:col-span-2"
            value={row.subject}
            onChange={(e) => updateRow(index, { subject: e.target.value })}
            required
          >
            <option value="">Subject *</option>
            {SUBJECT_OPTIONS.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
          {assignments.length > 1 ? (
            <button type="button" className="text-xs text-rose-600 sm:col-span-4" onClick={() => removeRow(index)}>
              Remove assignment
            </button>
          ) : null}
        </div>
      ))}
      <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-700" onClick={addRow}>
        + Add another class
      </button>
    </div>
  );
}

function InputWithIcon({ icon: Icon, className = "", ...props }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon />
      </span>
      <input
        {...props}
        className={`w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${className}`}
      />
    </div>
  );
}

function exportTeachersCsv(teachers) {
  const header = ["Name", "Email", "Assigned Class", "Status", "Created"];
  const rows = teachers.map((t) => [
    t.fullName,
    t.email,
    t.assignedClasses?.length
      ? t.assignedClasses.map((c) => `${c.className} ${c.section || "A"} (${c.subject || "Class Teacher"})`).join("; ")
      : "Not assigned",
    t.isActive ? "Active" : "Inactive",
    new Date(t.createdAt).toLocaleDateString(),
  ]);
  const csv = [header, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "teachers.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function TeachersManagementPage() {
  const [form, setForm] = useState(initialForm);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [teachers, setTeachers] = useState([]);
  const [classTeachers, setClassTeachers] = useState([]);
  const [classOptions] = useState(CLASS_OPTIONS);
  const [activityClassFilter, setActivityClassFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingClassTeachers, setLoadingClassTeachers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const activityFilterParts = activityClassFilter ? activityClassFilter.split("|") : [];
  const activityClassName = activityFilterParts[0] || "";
  const activitySection = activityFilterParts[1] || "";

  const loadClassTeachers = async (classSectionValue) => {
    if (!classSectionValue) {
      setClassTeachers([]);
      return;
    }
    const [className, section] = classSectionValue.split("|");
    setLoadingClassTeachers(true);
    try {
      const res = await api.get("/teachers/by-class", { params: { className, section } });
      setClassTeachers(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load teachers for class");
      setClassTeachers([]);
    } finally {
      setLoadingClassTeachers(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const teachersRes = await api.get("/teachers", { params: { search, page: 1, limit: 20 } });
      setTeachers(teachersRes.data?.data?.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load teachers data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onCreateTeacher = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/teachers", form);
      setForm({ ...initialForm, assignments: [{ ...emptyAssignment }] });
      setSuccess("Teacher created successfully with assigned classes.");
      setShowCreateModal(false);
      await loadData();
      if (activityClassFilter) await loadClassTeachers(activityClassFilter);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create teacher");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (teacher) => {
    const assignments = teacher.assignedClasses?.length
      ? teacher.assignedClasses.map((row) => ({
          className: row.className || "",
          section: row.section || "A",
          subject: row.subject || "",
        }))
      : [{ ...emptyAssignment }];
    setEditForm({
      teacherId: teacher._id,
      fullName: teacher.fullName || "",
      email: teacher.email || "",
      password: "",
      isActive: teacher.isActive !== false,
      assignments,
    });
    setShowEditModal(true);
  };

  const onUpdateTeacher = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        fullName: editForm.fullName,
        email: editForm.email,
        isActive: editForm.isActive,
        assignments: editForm.assignments,
      };
      if (editForm.password.trim()) payload.password = editForm.password;
      await api.put(`/teachers/${editForm.teacherId}`, payload);
      setEditForm(initialEditForm);
      setSuccess("Teacher updated successfully.");
      setShowEditModal(false);
      await loadData();
      if (activityClassFilter) await loadClassTeachers(activityClassFilter);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update teacher");
    } finally {
      setSaving(false);
    }
  };

  const onActivityClassFilterChange = async (value) => {
    setActivityClassFilter(value);
    await loadClassTeachers(value);
  };

  const getTeacherSubject = (assignedClasses = []) => {
    if (!assignedClasses.length) return "Not assigned";
    if (assignedClasses.length === 1) return assignedClasses[0].subject || "Class Teacher";
    return `${assignedClasses.length} assignments`;
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
            <IconUsers />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Teachers Management</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Create teacher accounts, assign classes and monitor teacher activities.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowCreateModal(true)} className="ref-btn-primary whitespace-nowrap">
            + Create Teacher
          </button>
          <TeacherIllustration />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}

      {/* Search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <IconSearch />
          </span>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            placeholder="Search teacher by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadData()}
          />
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <IconFilter />
          Filter
        </button>
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:from-indigo-600 hover:to-violet-700"
        >
          Search
        </button>
      </div>

      {/* Teacher accounts table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <IconUsers />
            </span>
            <h3 className="text-base font-semibold text-slate-800">Teacher Accounts</h3>
          </div>
          <button
            type="button"
            onClick={() => exportTeachersCsv(teachers)}
            disabled={!teachers.length}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <IconDownload />
            Export
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">Teacher Name</th>
                <th className="px-5 py-3">Email Address</th>
                <th className="px-5 py-3">Assigned Class</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created On</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    Loading teachers...
                  </td>
                </tr>
              ) : teachers.length ? (
                teachers.map((teacher) => (
                  <tr key={teacher._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <TeacherAvatar name={teacher.fullName} />
                        <div>
                          <p className="font-semibold text-slate-800">{teacher.fullName}</p>
                          <p className="text-xs text-slate-500">
                            {getTeacherSubject(teacher.assignedClasses)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{teacher.email}</td>
                    <td className="px-5 py-4">
                      <ClassBadge assignedClasses={teacher.assignedClasses} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill active={teacher.isActive} />
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(teacher.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openEditModal(teacher)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    No teachers found. Create a teacher to enable their panel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Activity monitor */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <IconActivity />
            </span>
            <h3 className="text-base font-semibold text-slate-800">Teacher Activity Monitor</h3>
          </div>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 sm:min-w-[200px]"
            value={activityClassFilter}
            onChange={(e) => onActivityClassFilterChange(e.target.value)}
          >
            <option value="">Select class to view teachers</option>
            {getClassSectionOptions().map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        {activityClassFilter ? (
          <div className="overflow-x-auto">
            <div className="px-5 py-3 text-sm font-medium text-slate-700">
              Teachers handling {activityClassName} {activitySection}
            </div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">Teacher</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingClassTeachers ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                      Loading teachers...
                    </td>
                  </tr>
                ) : classTeachers.length ? (
                  classTeachers.map((item) => (
                    <tr key={`${item.teacherId}-${item.subject}`} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <TeacherAvatar name={item.fullName} />
                          <span className="font-medium text-slate-800">{item.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{item.email}</td>
                      <td className="px-5 py-4 text-slate-600">{item.subject}</td>
                      <td className="px-5 py-4">
                        <StatusPill active={item.isActive} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                      No teachers assigned to this class yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            Select a class from the top right to view teachers handling that class.
          </div>
        )}
      </div>

      <FormModal open={showCreateModal} title="Create Teacher" onClose={() => setShowCreateModal(false)} wide>
        <form onSubmit={onCreateTeacher} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputWithIcon icon={() => (<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>)} placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
            <InputWithIcon icon={IconMail} type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <InputWithIcon icon={IconLock} type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required className="sm:col-span-2" />
          </div>
          <AssignmentFields
            assignments={form.assignments}
            onChange={(assignments) => setForm({ ...form, assignments })}
            classOptions={classOptions}
          />
          <button type="submit" disabled={saving} className="ref-btn-primary w-full">
            {saving ? "Creating..." : "Create Teacher"}
          </button>
        </form>
      </FormModal>

      <FormModal open={showEditModal} title="Edit Teacher" onClose={() => setShowEditModal(false)} wide>
        <form onSubmit={onUpdateTeacher} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InputWithIcon icon={() => (<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>)} placeholder="Full name" value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} required />
            <InputWithIcon icon={IconMail} type="email" placeholder="Email address" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
            <InputWithIcon icon={IconLock} type="password" placeholder="New password (optional)" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} className="sm:col-span-2" />
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm sm:col-span-2"
              value={editForm.isActive ? "ACTIVE" : "INACTIVE"}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === "ACTIVE" })}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <AssignmentFields
            assignments={editForm.assignments}
            onChange={(assignments) => setEditForm({ ...editForm, assignments })}
            classOptions={classOptions}
          />
          <button type="submit" disabled={saving} className="ref-btn-primary w-full">
            {saving ? "Saving..." : "Update Teacher"}
          </button>
        </form>
      </FormModal>
    </section>
  );
}
