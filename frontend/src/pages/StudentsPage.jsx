import { useEffect, useRef, useState } from "react";
import api from "../services/api/client";
import FormModal from "../components/ui/FormModal";
import PageHeader from "../components/ui/PageHeader";
import TablePagination from "../components/ui/TablePagination";
import CreateStudentWizard, {
  buildAssignmentUpdatePayload,
  buildStudentPayload,
  createRegistrationNumber,
  initialCreateStudentForm,
  mapStudentToAssignmentForm,
} from "../components/students/CreateStudentWizard";
import StudentRemoveModal from "../components/students/StudentRemoveModal";
import StudentProfilesModal from "../components/students/StudentProfilesModal";
import StudentProfileDetails, { StudentProfileHeaderMeta } from "../components/students/StudentProfileDetails";
import StudentActivityMonitor from "../components/students/StudentActivityMonitor";
import { resolveStudentPhotoUrl } from "../utils/mediaUrl";
import { formatStudentCreatedDate } from "../utils/studentFormat";

function mergeStudentInList(items, updated) {
  if (!updated?._id) return items;
  return items.map((item) =>
    item._id === updated._id
      ? {
          ...item,
          className: updated.className,
          section: updated.section,
          rollNumber: updated.rollNumber,
          subjects: updated.subjects,
          firstName: updated.firstName,
          lastName: updated.lastName,
        }
      : item
  );
}

function StatusBadge({ status }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
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

function IconKey() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 8a3.5 3.5 0 11-6.999.001A3.5 3.5 0 0115.5 8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.5l-7 7h-2v-2l7-7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5L18 6l2 2-1.5 1.5" />
    </svg>
  );
}

function StudentAvatar({ student, size = "md" }) {
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
    <div className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700`}>
      {initials}
    </div>
  );
}

function generateStudentLoginPassword(student) {
  const lettersPool =
    `${student?.firstName || ""}${student?.lastName || ""}`.replace(/[^a-z]/gi, "").toUpperCase() || "STUDENT";
  const dobValue = student?.dateOfBirth ? new Date(student.dateOfBirth) : null;
  const dobDigits =
    dobValue && !Number.isNaN(dobValue.getTime())
      ? `${dobValue.getFullYear()}${String(dobValue.getMonth() + 1).padStart(2, "0")}${String(dobValue.getDate()).padStart(2, "0")}`
      : "";
  const digitsPool =
    `${student?.admissionNo || ""}${student?.rollNumber || ""}${student?.cnicBForm || ""}${dobDigits}`
      .replace(/\D/g, "") || `${Date.now()}`;
  const byPool = "BY";
  const glPool = "GL";
  const seed = `${lettersPool}|${digitsPool}|${student?.admissionNo || ""}|BY|GL`;

  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
  }

  const pick = (pool, offset = 0) => pool[(hash + offset) % pool.length];
  return [
    pick(lettersPool, 0),
    pick(lettersPool, 3),
    pick(digitsPool, 1),
    pick(digitsPool, 5),
    pick(lettersPool, 7),
    pick(lettersPool, 11),
    pick(digitsPool, 13),
    pick(digitsPool, 17),
    pick(byPool, hash % byPool.length),
    pick(glPool, (hash + 1) % glPool.length),
  ]
    .join("")
    .slice(0, 10);
}

function generateStudentLoginId(student) {
  const fullName = `${student?.firstName || ""}${student?.lastName || ""}`.replace(/[^a-z]/gi, "").toLowerCase();
  if (!fullName) return "student@gmail.com";
  return `${fullName}@gmail.com`;
}

export default function StudentsPage({ role, dark = false, onToggleTheme }) {
  const canManage = role === "SUPER_ADMIN";
  const [editId, setEditId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
  const [profileStudent, setProfileStudent] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showProfilesModal, setShowProfilesModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [success, setSuccess] = useState("");
  const [createForm, setCreateForm] = useState({ ...initialCreateStudentForm });
  const [createWizardKey, setCreateWizardKey] = useState(0);
  const [editWizardKey, setEditWizardKey] = useState(0);
  const [modalStudentName, setModalStudentName] = useState("");
  const [activityRefreshKey, setActivityRefreshKey] = useState(0);
  const [importing, setImporting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStudent, setLoginStudent] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const studentImportInputRef = useRef(null);

  useEffect(() => {
    loadStudents(1, "", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudents = async (
    nextPage = page,
    nextSearch = search,
    nextStatus = statusFilter
  ) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/students", {
        params: {
          page: nextPage,
          limit: pagination.limit,
          search: nextSearch,
          status: nextStatus,
        },
      });
      setItems(data.data.items || []);
      setPagination({
        total: data.data.total || 0,
        totalPages: data.data.totalPages || 1,
        limit: data.data.limit || 10,
      });
      setPage(data.data.page || nextPage);
    } catch (err) {
      setItems([]);
      setError(err.response?.data?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditId(null);
    setError("");
    setCreateForm({ ...initialCreateStudentForm, registrationNo: createRegistrationNumber() });
    setCreateWizardKey((key) => key + 1);
    setModalStudentName("");
    setShowStudentModal(true);
  };

  const resetForm = () => {
    setEditId(null);
    setShowStudentModal(false);
    setModalStudentName("");
    setError("");
    setCreateForm({ ...initialCreateStudentForm, registrationNo: createRegistrationNumber() });
  };

  const openProfile = async (item) => {
    try {
      const { data } = await api.get(`/students/${item._id}`);
      setProfileStudent(data.data || item);
    } catch {
      setProfileStudent(item);
    }
  };

  const openLoginDetails = async (item) => {
    setShowLoginModal(true);
    setLoginLoading(true);
    setLoginStudent(null);
    try {
      const { data } = await api.get(`/students/${item._id}`);
      setLoginStudent(data.data || item);
    } catch {
      setLoginStudent(item);
    } finally {
      setLoginLoading(false);
    }
  };

  const closeLoginModal = () => {
    setShowLoginModal(false);
    setLoginStudent(null);
    setLoginLoading(false);
  };

  const onCreateStudent = async (wizardForm) => {
    if (!canManage) return;

    setSaving(true);
    setError("");
    try {
      const payload = buildStudentPayload(wizardForm);
      await api.post("/students", payload);
      resetForm();
      await loadStudents(1, search, statusFilter);
      refreshActivityMonitor();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save student");
    } finally {
      setSaving(false);
    }
  };

  const onUpdateStudentAssignment = async (wizardForm) => {
    if (!canManage || !editId) return;

    setSaving(true);
    setError("");
    try {
      const payload = buildAssignmentUpdatePayload(wizardForm);
      const { data } = await api.put(`/students/${editId}`, payload);
      const updated = data.data;

      setItems((prev) => mergeStudentInList(prev, updated));
      if (profileStudent?._id === editId) {
        setProfileStudent((prev) => (prev ? { ...prev, ...updated } : prev));
      }

      const studentName = `${updated?.firstName || ""} ${updated?.lastName || ""}`.trim();
      resetForm();
      refreshActivityMonitor();
      setSuccess(studentName ? `${studentName} updated successfully.` : "Student updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update student");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = async (item) => {
    if (!canManage) return;

    setError("");
    setSuccess("");
    setEditId(item._id);

    try {
      const { data } = await api.get(`/students/${item._id}`);
      const student = data.data || item;
      setCreateForm(mapStudentToAssignmentForm(student));
      setModalStudentName(`${student.firstName || ""} ${student.lastName || ""}`.trim());
    } catch {
      setCreateForm(mapStudentToAssignmentForm(item));
      setModalStudentName(`${item.firstName || ""} ${item.lastName || ""}`.trim());
    }

    setEditWizardKey((key) => key + 1);
    setShowStudentModal(true);
  };

  const onDelete = async (id) => {
    if (!canManage || !window.confirm("Are you sure you want to delete this student?")) return;
    setError("");
    try {
      await api.delete(`/students/${id}`);
      if (editId === id) resetForm();
      if (profileStudent?._id === id) setProfileStudent(null);
      await loadStudents(page, search, statusFilter);
      refreshActivityMonitor();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete student");
    }
  };

  const refreshActivityMonitor = () => setActivityRefreshKey((key) => key + 1);

  const parseKeyValueText = (text) => {
    const result = {};
    const lines = String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    lines.forEach((line) => {
      if (line.startsWith("#")) return;
      const separatorIndex = line.indexOf(":") >= 0 ? line.indexOf(":") : line.indexOf("=");
      if (separatorIndex === -1) return;
      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      if (!key) return;
      result[key] = value;
    });

    return result;
  };

  const normalizeImportedStudentForm = (raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new Error("Each student entry must be a JSON object.");
    }

    const previousResults = Array.isArray(raw.previousResults)
      ? raw.previousResults.map((row) => ({
          previousClass: row?.previousClass || "",
          resultGrade: row?.resultGrade || "",
          percentage: row?.percentage || "",
          documentUrl: row?.documentUrl || "",
        }))
      : [];
    const subjects = Array.isArray(raw.subjects)
      ? raw.subjects
      : typeof raw.subjects === "string"
        ? raw.subjects.split(",").map((item) => item.trim()).filter(Boolean)
        : [];

    return {
      ...initialCreateStudentForm,
      registrationNo: raw.registrationNo || raw.admissionNo || raw.studentId || createRegistrationNumber(),
      fullName: raw.fullName || raw.name || "",
      cnicBForm: raw.cnicBForm || raw.cnic || "",
      address: raw.address || "",
      phoneNumber: raw.phoneNumber || raw.mobile || "",
      gender: raw.gender || "MALE",
      dateOfBirth: raw.dateOfBirth || "",
      fatherName: raw.fatherName || raw.guardianName || "",
      fatherCnic: raw.fatherCnic || "",
      guardianPhone: raw.guardianPhone || raw.phoneNumber || "",
      alternativePhone: raw.alternativePhone || "",
      fatherOccupation: raw.fatherOccupation || "",
      previousResults: previousResults.length ? previousResults : initialCreateStudentForm.previousResults,
      schoolLeavingCertificate: raw.schoolLeavingCertificate || "",
      characterCertificate: raw.characterCertificate || "",
      className: raw.className || "",
      section: raw.section || "A",
      rollNumber: raw.rollNumber || "",
      subjects,
      subjectPool: Array.isArray(raw.subjectPool) && raw.subjectPool.length ? raw.subjectPool : [...new Set(subjects)],
      admissionFee: raw.admissionFee ?? "",
      annualFee: raw.annualFee ?? "",
      useInstallments: Boolean(raw.useInstallments),
      installmentCount: raw.installmentCount ? String(raw.installmentCount) : "1",
    };
  };

  const importStudentsFromFile = async (file) => {
    if (!file) return;

    setImporting(true);
    setError("");
    setSuccess("");

    try {
      const text = await file.text();
      const trimmed = String(text || "").trim();
      const parsed = trimmed.startsWith("{") || trimmed.startsWith("[") ? JSON.parse(trimmed) : parseKeyValueText(trimmed);
      const entries = Array.isArray(parsed) ? parsed : Array.isArray(parsed.students) ? parsed.students : [parsed];

      if (!entries.length) {
        throw new Error("Import file is empty.");
      }

      let imported = 0;
      for (const entry of entries) {
        const form = normalizeImportedStudentForm(entry);
        const payload = buildStudentPayload(form);
        // eslint-disable-next-line no-await-in-loop
        await api.post("/students", payload);
        imported += 1;
      }

      setSuccess(imported === 1 ? "Student imported successfully." : `${imported} students imported successfully.`);
      await loadStudents(1, search, statusFilter);
      refreshActivityMonitor();
    } catch (err) {
      setError(err.message || err.response?.data?.message || "Failed to import students");
    } finally {
      setImporting(false);
      if (studentImportInputRef.current) studentImportInputRef.current.value = "";
    }
  };

  const cardClass = dark
    ? "overflow-hidden rounded-2xl border border-white/[0.06] bg-[#161722]"
    : "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm";

  return (
    <section className="space-y-6">
      <PageHeader
        title="Student Management"
        subtitle="Complete student profiles — add, edit, search and manage status."
        actionLabel={canManage ? "Add Student" : null}
        onAction={canManage ? openCreateModal : null}
        afterAction={
          canManage ? (
            <>
              <button
                type="button"
                onClick={() => studentImportInputRef.current?.click()}
                disabled={importing}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 19h16" />
                </svg>
                {importing ? "Importing..." : "Import Students"}
              </button>
              <button
                type="button"
                onClick={() => setShowRemoveModal(true)}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
              >
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 11h-6" />
                </svg>
                Student Remove at School
              </button>
            </>
          ) : null
        }
        extra={
          <button
            type="button"
            className="ref-btn-outline text-sm"
            onClick={() => setShowProfilesModal(true)}
          >
            View Students Profiles
          </button>
        }
      />

      <input
        ref={studentImportInputRef}
        type="file"
        accept=".txt,.json,text/plain,application/json"
        className="hidden"
        onChange={(event) => importStudentsFromFile(event.target.files?.[0])}
      />

      {error && !showStudentModal && !showRemoveModal ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <div className="ref-card overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">
            Students ({pagination.total})
          </h3>
          <select
            className="ref-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              loadStudents(1, search, e.target.value);
            }}
          >
            <option value="">All status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <input
            className="ref-input ml-auto w-full max-w-sm"
            placeholder="Search name, ID, CNIC, mobile, father..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadStudents(1, search, statusFilter)}
          />
          <button type="button" className="ref-btn-outline" onClick={() => loadStudents(1, search, statusFilter)}>
            Search
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Profile</th>
                <th className="px-5 py-3 font-medium">Roll Number</th>
                <th className="px-5 py-3 font-medium">Student ID</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Father</th>
                <th className="px-5 py-3 font-medium">Class</th>
                <th className="px-5 py-3 font-medium">Mobile</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-slate-500">
                    Loading students...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((item) => {
                  const createdDate = formatStudentCreatedDate(item);
                  return (
                  <tr key={item._id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <StudentAvatar student={item} />
                    </td>
                    <td className="px-5 py-3 font-mono text-base text-slate-700">{item.rollNumber || "—"}</td>
                    <td className="px-5 py-3 font-mono text-base text-slate-700">{item.admissionNo}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">
                        {item.firstName} {item.lastName}
                      </p>
                      {createdDate ? (
                        <p className="text-xs text-slate-500">Created {createdDate}</p>
                      ) : null}
                    </td>
                    <td className="px-5 py-3 text-slate-700">{item.fatherName || item.guardianName || "-"}</td>
                    <td className="px-5 py-3 text-slate-700">
                      {item.className} - {item.section || "A"}
                    </td>
                    <td className="px-5 py-3 text-slate-700">{item.guardianPhone}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={item.status || "ACTIVE"} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          title="View student profile"
                          onClick={() => openProfile(item)}
                          className="inline-flex items-center rounded-lg border border-slate-200 p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <IconEye />
                        </button>
                        {canManage ? (
                          <>
                            <button type="button" className="ref-btn-outline text-xs" onClick={() => onEdit(item)}>
                              Edit
                            </button>
                            <button
                              type="button"
                              title="View student login details"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                              onClick={() => openLoginDetails(item)}
                            >
                              <IconKey />
                              Login Details
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-slate-500">
                    No students found.
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
          onPrev={() => loadStudents(page - 1, search, statusFilter)}
          onNext={() => loadStudents(page + 1, search, statusFilter)}
        />
      </div>

      <div className={cardClass}>
        <StudentActivityMonitor
          dark={dark}
          onToggleTheme={onToggleTheme}
          refreshKey={activityRefreshKey}
        />
      </div>

      <FormModal
        open={showStudentModal}
        title={editId ? "Edit Student" : "Add Student"}
        subtitle={modalStudentName}
        onClose={resetForm}
        wide
        scrollBody={false}
        dark={dark}
        onToggleTheme={onToggleTheme}
      >
        {showStudentModal ? (
          <CreateStudentWizard
            key={editId ? `edit-${editId}-${editWizardKey}` : `create-${createWizardKey}`}
            mode={editId ? "assignment-edit" : "create"}
            form={createForm}
            setForm={setCreateForm}
            onSubmit={editId ? onUpdateStudentAssignment : onCreateStudent}
            saving={saving}
            onCancel={resetForm}
            onTitleChange={setModalStudentName}
            submitError={error}
            onDismissError={() => setError("")}
            dark={dark}
          />
        ) : null}
      </FormModal>

      <FormModal
        open={showProfilesModal}
        title="View Students Profiles"
        onClose={() => setShowProfilesModal(false)}
        extraWide
        dark={dark}
        onToggleTheme={onToggleTheme}
      >
        {showProfilesModal ? (
          <StudentProfilesModal dark={dark} />
        ) : null}
      </FormModal>

      <FormModal
        open={showRemoveModal}
        title="Student Remove at School"
        onClose={() => setShowRemoveModal(false)}
        extraWide
        dark={dark}
        onToggleTheme={onToggleTheme}
      >
        {showRemoveModal ? (
          <StudentRemoveModal
            dark={dark}
            onRemoved={(name) => {
              setSuccess(`${name} removed from school successfully.`);
              loadStudents(page, search, statusFilter);
              refreshActivityMonitor();
            }}
          />
        ) : null}
      </FormModal>

      <FormModal
        open={showLoginModal}
        title="Student Login Details"
        subtitle={loginStudent ? `${loginStudent.firstName || ""} ${loginStudent.lastName || ""}`.trim() : ""}
        onClose={closeLoginModal}
        wide
        dark={dark}
        onToggleTheme={onToggleTheme}
      >
        {loginLoading ? (
          <div className={`rounded-2xl border px-4 py-6 text-sm ${dark ? "border-white/[0.06] text-[#9e9e9e]" : "border-slate-200 text-slate-500"}`}>
            Loading login details...
          </div>
        ) : loginStudent ? (
          <div className="space-y-4">
            <div className={`rounded-2xl border p-4 ${dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-200 bg-slate-50"}`}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Student Name</p>
                  <p className={`mt-1 text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
                    {loginStudent.firstName || ""} {loginStudent.lastName || ""}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Class</p>
                  <p className={`mt-1 text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
                    {loginStudent.className || "-"}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Section</p>
                  <p className={`mt-1 text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
                    {loginStudent.section || "-"}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Roll Number</p>
                  <p className={`mt-1 text-sm font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
                    {loginStudent.rollNumber || "-"}
                  </p>
                </div>
              </div>
            </div>
            <div className={`rounded-2xl border p-4 ${dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-200 bg-slate-50"}`}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Login ID</p>
                  <p className={`mt-1 text-lg font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
                    {loginStudent.loginId || generateStudentLoginId(loginStudent)}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Password</p>
                  <p className={`mt-1 text-lg font-semibold ${dark ? "text-white" : "text-slate-900"}`}>
                    {loginStudent.loginPassword || generateStudentLoginPassword(loginStudent)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </FormModal>

      {profileStudent ? (
        <div className="modal-backdrop-enter fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[2px]">
          <div className="modal-panel-enter ref-card w-full max-w-lg p-0">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
              <div className="flex items-center gap-4">
                <StudentAvatar student={profileStudent} size="lg" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {profileStudent.firstName} {profileStudent.lastName}
                  </h3>
                  <p className="text-sm text-slate-500">{profileStudent.admissionNo}</p>
                  <div className="mt-1">
                    <StatusBadge status={profileStudent.status || "ACTIVE"} />
                  </div>
                </div>
              </div>
              <StudentProfileHeaderMeta student={profileStudent} />
            </div>
            <StudentProfileDetails student={profileStudent} />
            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              {canManage ? (
                <button type="button" className="ref-btn-outline" onClick={() => { onEdit(profileStudent); setProfileStudent(null); }}>
                  Edit
                </button>
              ) : null}
              <button type="button" className="ref-btn-primary" onClick={() => setProfileStudent(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
