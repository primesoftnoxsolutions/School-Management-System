import { useEffect, useState } from "react";
import api from "../services/api/client";
import FormModal from "../components/ui/FormModal";
import PageHeader from "../components/ui/PageHeader";
import TablePagination from "../components/ui/TablePagination";
import { CLASS_OPTIONS, SECTION_OPTIONS, getClassSectionOptions, getNextClass } from "../constants/classes";

const emptyForm = {
  firstName: "",
  lastName: "",
  rollNumber: "",
  fatherName: "",
  cnicBForm: "",
  guardianPhone: "",
  gender: "MALE",
  className: "",
  section: "A",
  address: "",
  admissionNo: "",
  studentPhotoUrl: "",
};

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

function StudentAvatar({ student, size = "md" }) {
  const dim = size === "lg" ? "h-20 w-20 text-xl" : "h-10 w-10 text-sm";
  const initials = `${student?.firstName?.[0] || ""}${student?.lastName?.[0] || ""}`.toUpperCase();

  if (student?.studentPhotoUrl) {
    return (
      <img
        src={student.studentPhotoUrl}
        alt={initials}
        className={`${dim} shrink-0 rounded-full object-cover ring-2 ring-white`}
      />
    );
  }

  return (
    <div className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700`}>
      {initials || "?"}
    </div>
  );
}

export default function StudentsPage({ role }) {
  const canManage = role === "SUPER_ADMIN";
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [items, setItems] = useState([]);
  const classSectionOptions = getClassSectionOptions();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [classSectionFilter, setClassSectionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0, limit: 10 });
  const [profileStudent, setProfileStudent] = useState(null);
  const [promoteStudent, setPromoteStudent] = useState(null);
  const [promoteTarget, setPromoteTarget] = useState("");
  const [bulkPromote, setBulkPromote] = useState({ fromClass: "", toClass: "", section: "" });
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showBulkPromoteModal, setShowBulkPromoteModal] = useState(false);

  const parseClassSection = (value) => {
    if (!value) return { className: "", section: "" };
    const [className, section] = value.split("|");
    return { className: className || "", section: section || "" };
  };

  useEffect(() => {
    loadStudents(1, "", "", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStudents = async (
    nextPage = page,
    nextSearch = search,
    nextClassSection = classSectionFilter,
    nextStatus = statusFilter
  ) => {
    setLoading(true);
    setError("");
    const { className, section } = parseClassSection(nextClassSection);
    try {
      const { data } = await api.get("/students", {
        params: {
          page: nextPage,
          limit: pagination.limit,
          search: nextSearch,
          className,
          section,
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

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setShowStudentModal(false);
  };

  const onPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Profile picture must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, studentPhotoUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!canManage) return;

    setSaving(true);
    setError("");
    try {
      const payload = { ...form, status: "ACTIVE" };
      if (!payload.admissionNo) delete payload.admissionNo;
      if (!payload.studentPhotoUrl) delete payload.studentPhotoUrl;

      if (editId) {
        await api.put(`/students/${editId}`, payload);
      } else {
        await api.post("/students", payload);
      }

      resetForm();
      await loadStudents(1, search, classSectionFilter, statusFilter);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save student");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item) => {
    setEditId(item._id);
    setForm({
      firstName: item.firstName || "",
      lastName: item.lastName || "",
      rollNumber: item.rollNumber || "",
      fatherName: item.fatherName || item.guardianName || "",
      cnicBForm: item.cnicBForm || "",
      guardianPhone: item.guardianPhone || "",
      gender: item.gender || "MALE",
      className: item.className || "",
      section: item.section || "A",
      address: item.address || "",
      admissionNo: item.admissionNo || "",
      studentPhotoUrl: item.studentPhotoUrl || "",
    });
    setShowStudentModal(true);
  };

  const onDelete = async (id) => {
    if (!canManage || !window.confirm("Are you sure you want to delete this student?")) return;
    setError("");
    try {
      await api.delete(`/students/${id}`);
      if (editId === id) resetForm();
      if (profileStudent?._id === id) setProfileStudent(null);
      await loadStudents(page, search, classSectionFilter, statusFilter);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete student");
    }
  };

  const confirmPromote = async () => {
    if (!promoteStudent) return;
    setSaving(true);
    setError("");
    try {
      await api.post(`/students/${promoteStudent._id}/promote`, {
        className: promoteTarget || undefined,
      });
      setPromoteStudent(null);
      setPromoteTarget("");
      await loadStudents(page, search, classSectionFilter, statusFilter);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to promote student");
    } finally {
      setSaving(false);
    }
  };

  const onBulkPromote = async (e) => {
    e.preventDefault();
    if (!bulkPromote.fromClass) return;
    if (!window.confirm(`Promote all active students from ${bulkPromote.fromClass} to next class?`)) return;
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post("/students/promote-class", bulkPromote);
      alert(`${data.data.promoted} students promoted to ${data.data.toClass}`);
      setBulkPromote({ fromClass: "", toClass: "", section: "" });
      setShowBulkPromoteModal(false);
      await loadStudents(page, search, classSectionFilter, statusFilter);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to promote class");
    } finally {
      setSaving(false);
    }
  };

  const getNextClassHint = (cls) => getNextClass(cls) || "Next class";

  const studentFormFields = (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
        <StudentAvatar student={form} size="lg" />
        <div>
          <p className="text-sm text-slate-500">Profile picture</p>
          <label className="mt-1 inline-block cursor-pointer text-xs font-medium text-blue-600 hover:underline">
            Upload photo
            <input type="file" accept="image/*" className="hidden" onChange={onPhotoChange} />
          </label>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input className="ref-input sm:col-span-2" placeholder="Student ID (auto if empty)" value={form.admissionNo} onChange={(e) => setForm({ ...form, admissionNo: e.target.value })} />
        <input className="ref-input" placeholder="First name *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
        <input className="ref-input" placeholder="Last name *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
        <input className="ref-input sm:col-span-2" placeholder="Father name *" value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} required />
        <input className="ref-input" placeholder="CNIC / B-Form" value={form.cnicBForm} onChange={(e) => setForm({ ...form, cnicBForm: e.target.value })} />
        <input className="ref-input" placeholder="Mobile number *" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} required />
        <input className="ref-input sm:col-span-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <input className="ref-input" placeholder="Roll number" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} />
        <select className="ref-input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>
        <select className="ref-input" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} required>
          <option value="">Select class *</option>
          {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="ref-input" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} required>
          {SECTION_OPTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="ref-btn-outline" onClick={resetForm}>Cancel</button>
        <button type="submit" className="ref-btn-primary" disabled={saving}>
          {saving ? "Saving..." : editId ? "Update Student" : "Add Student"}
        </button>
      </div>
    </form>
  );

  return (
    <section className="space-y-6">
      <PageHeader
        title="Student Management"
        subtitle="Complete student profiles — add, edit, search, promote and manage status."
        actionLabel={canManage ? "Add Student" : null}
        onAction={canManage ? () => { resetForm(); setShowStudentModal(true); } : null}
        extra={
          <div className="flex flex-wrap items-center gap-2">
            {canManage ? (
              <button type="button" className="ref-btn-outline text-sm" onClick={() => setShowBulkPromoteModal(true)}>
                Promote Class
              </button>
            ) : null}
            <select
              className="ref-select min-w-[160px]"
              value={classSectionFilter}
              onChange={(e) => {
                setClassSectionFilter(e.target.value);
                loadStudents(1, search, e.target.value, statusFilter);
              }}
            >
              <option value="">All classes</option>
              {classSectionOptions.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>
        }
      />

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

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
              loadStudents(1, search, classSectionFilter, e.target.value);
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
            onKeyDown={(e) => e.key === "Enter" && loadStudents(1, search, classSectionFilter, statusFilter)}
          />
          <button type="button" className="ref-btn-outline" onClick={() => loadStudents(1, search, classSectionFilter, statusFilter)}>
            Search
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Profile</th>
                <th className="px-5 py-3 font-medium">Student ID</th>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Father</th>
                <th className="px-5 py-3 font-medium">Class</th>
                <th className="px-5 py-3 font-medium">Mobile</th>
                <th className="px-5 py-3 font-medium">Status</th>
                {canManage ? <th className="px-5 py-3 font-medium">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="px-5 py-8 text-center text-slate-500">
                    Loading students...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((item) => (
                  <tr key={item._id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <button type="button" onClick={() => setProfileStudent(item)}>
                        <StudentAvatar student={item} />
                      </button>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{item.admissionNo}</td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        className="font-medium text-slate-800 hover:text-blue-600"
                        onClick={() => setProfileStudent(item)}
                      >
                        {item.firstName} {item.lastName}
                      </button>
                      {item.rollNumber ? (
                        <p className="text-xs text-slate-400">Roll: {item.rollNumber}</p>
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
                    {canManage ? (
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button type="button" className="ref-btn-outline text-xs" onClick={() => onEdit(item)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="ref-btn-outline text-xs"
                            onClick={() => {
                              setPromoteStudent(item);
                              setPromoteTarget(getNextClassHint(item.className));
                            }}
                          >
                            Promote
                          </button>
                          <button type="button" className="ref-btn-danger text-xs" onClick={() => onDelete(item._id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="px-5 py-8 text-center text-slate-500">
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
          onPrev={() => loadStudents(page - 1, search, classSectionFilter, statusFilter)}
          onNext={() => loadStudents(page + 1, search, classSectionFilter, statusFilter)}
        />
      </div>

      <FormModal
        open={showStudentModal}
        title={editId ? "Edit Student" : "Add Student"}
        onClose={resetForm}
        wide
      >
        {studentFormFields}
      </FormModal>

      <FormModal
        open={showBulkPromoteModal}
        title="Promote Class to Next Level"
        onClose={() => setShowBulkPromoteModal(false)}
      >
        <form onSubmit={onBulkPromote} className="space-y-4">
          <p className="text-sm text-slate-500">Bulk promote all active students from one class to the next.</p>
          <select className="ref-input w-full" value={bulkPromote.fromClass} onChange={(e) => setBulkPromote({ ...bulkPromote, fromClass: e.target.value })} required>
            <option value="">From class *</option>
            {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="ref-input w-full" value={bulkPromote.section} onChange={(e) => setBulkPromote({ ...bulkPromote, section: e.target.value })}>
            <option value="">All sections</option>
            {SECTION_OPTIONS.map((s) => <option key={s} value={s}>Section {s}</option>)}
          </select>
          <select className="ref-input w-full" value={bulkPromote.toClass} onChange={(e) => setBulkPromote({ ...bulkPromote, toClass: e.target.value })}>
            <option value="">To class (auto: {bulkPromote.fromClass ? getNextClassHint(bulkPromote.fromClass) : "—"})</option>
            {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="ref-btn-primary w-full" disabled={saving}>Promote Class</button>
        </form>
      </FormModal>

      {profileStudent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[2px]">
          <div className="ref-card w-full max-w-lg p-0">
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
            </div>
            <div className="grid grid-cols-2 gap-3 px-6 py-5 text-sm">
              {[
                ["Father Name", profileStudent.fatherName || profileStudent.guardianName],
                ["CNIC / B-Form", profileStudent.cnicBForm || "-"],
                ["Mobile", profileStudent.guardianPhone],
                ["Class", `${profileStudent.className} - ${profileStudent.section || "A"}`],
                ["Roll No", profileStudent.rollNumber || "-"],
                ["Gender", profileStudent.gender],
                ["Date of Birth", profileStudent.dateOfBirth ? new Date(profileStudent.dateOfBirth).toLocaleDateString() : "-"],
                ["Admission Date", profileStudent.admissionDate ? new Date(profileStudent.admissionDate).toLocaleDateString() : "-"],
                ["Address", profileStudent.address || "-"],
              ].map(([label, value]) => (
                <div key={label} className={label === "Address" ? "col-span-2" : ""}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-medium text-slate-800">{value}</p>
                </div>
              ))}
            </div>
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

      {promoteStudent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="ref-card w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900">Promote Student</h3>
            <p className="mt-2 text-sm text-slate-600">
              Promote <strong>{promoteStudent.firstName} {promoteStudent.lastName}</strong> from{" "}
              <strong>{promoteStudent.className}</strong> to:
            </p>
            <select className="ref-input mt-4 w-full" value={promoteTarget} onChange={(e) => setPromoteTarget(e.target.value)}>
              <option value="">Select next class</option>
              {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" className="ref-btn-outline" onClick={() => setPromoteStudent(null)}>
                Cancel
              </button>
              <button type="button" className="ref-btn-primary" disabled={saving} onClick={confirmPromote}>
                Confirm Promote
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
