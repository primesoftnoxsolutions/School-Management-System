import { useEffect, useState } from "react";
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
                            <button type="button" className="ref-btn-danger text-xs" onClick={() => onDelete(item._id)}>
                              Delete
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
