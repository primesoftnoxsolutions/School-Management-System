import { useEffect, useState } from "react";
import api from "../../services/api/client";

const emptyForm = {
  studentId: "",
  className: "",
  section: "A",
  subject: "",
  examType: "",
  marks: "",
  maxMarks: "100",
  grade: "",
  remarks: "",
};

export default function TeacherAcademicRecordsPage() {
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [items, setItems] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const loadClasses = async () => {
    try {
      const { data } = await api.get("/teacher-panel/class-options");
      setClassOptions(data.data || []);
    } catch {
      setClassOptions([]);
    }
  };

  const loadStudents = async (className, section) => {
    if (!className) {
      setStudents([]);
      return;
    }
    try {
      const { data } = await api.get("/teacher-panel/students", {
        params: { className, section: section || "A" },
      });
      setStudents(data.data || []);
    } catch {
      setStudents([]);
    }
  };

  const load = async (nextPage = page, nextSearch = search) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/teacher-panel/academic-records", {
        params: { page: nextPage, limit: 10, search: nextSearch },
      });
      setItems(data.data.items || []);
      setPagination({ totalPages: data.data.totalPages || 1, total: data.data.total || 0 });
      setPage(data.data.page || nextPage);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load academic records");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
    load(1, "");
  }, []);

  useEffect(() => {
    loadStudents(form.className, form.section);
  }, [form.className, form.section]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const onClassSelect = (value) => {
    const selected = classOptions.find((c) => c._id === value);
    if (selected) {
      setForm({
        ...form,
        className: selected.className,
        section: selected.section || "A",
        subject: selected.subject,
        studentId: "",
      });
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, marks: Number(form.marks), maxMarks: Number(form.maxMarks) };
      if (editId) {
        await api.put(`/teacher-panel/academic-records/${editId}`, payload);
      } else {
        await api.post("/teacher-panel/academic-records", payload);
      }
      resetForm();
      await load(1, search);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save academic record");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item) => {
    setEditId(item._id);
    setForm({
      studentId: item.studentId?._id || item.studentId,
      className: item.className,
      section: item.section || "A",
      subject: item.subject,
      examType: item.examType,
      marks: String(item.marks),
      maxMarks: String(item.maxMarks),
      grade: item.grade || "",
      remarks: item.remarks || "",
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this academic record?")) return;
    try {
      await api.delete(`/teacher-panel/academic-records/${id}`);
      if (editId === id) resetForm();
      await load(page, search);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete record");
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Academic Records</h2>
        <p className="text-sm text-slate-500">Add, edit and manage student marks and grades.</p>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <form onSubmit={onSubmit} className="ref-card grid grid-cols-1 gap-3 p-5 md:grid-cols-3">
        <select
          className="ref-input"
          value={classOptions.find((c) => c.className === form.className && c.section === form.section)?._id || ""}
          onChange={(e) => onClassSelect(e.target.value)}
          required={!editId}
        >
          <option value="">Select class</option>
          {classOptions.map((c) => (
            <option key={c._id} value={c._id}>
              {c.className} - {c.section} ({c.subject})
            </option>
          ))}
        </select>
        <select
          className="ref-input"
          value={form.studentId}
          onChange={(e) => setForm({ ...form, studentId: e.target.value })}
          required={!editId}
          disabled={!form.className}
        >
          <option value="">Select student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.firstName} {s.lastName}
            </option>
          ))}
        </select>
        <input
          className="ref-input"
          placeholder="Exam type (Midterm, Final...)"
          value={form.examType}
          onChange={(e) => setForm({ ...form, examType: e.target.value })}
          required
        />
        <input
          className="ref-input"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          required
        />
        <input
          type="number"
          className="ref-input"
          placeholder="Marks"
          value={form.marks}
          onChange={(e) => setForm({ ...form, marks: e.target.value })}
          required
          min="0"
        />
        <input
          type="number"
          className="ref-input"
          placeholder="Max marks"
          value={form.maxMarks}
          onChange={(e) => setForm({ ...form, maxMarks: e.target.value })}
          required
          min="1"
        />
        <input
          className="ref-input"
          placeholder="Grade (A, B, C...)"
          value={form.grade}
          onChange={(e) => setForm({ ...form, grade: e.target.value })}
        />
        <input
          className="ref-input md:col-span-2"
          placeholder="Remarks"
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
        />
        <div className="flex gap-2 md:col-span-3">
          <button type="submit" className="ref-btn-primary" disabled={saving}>
            {saving ? "Saving..." : editId ? "Update Record" : "Add Record"}
          </button>
          {editId ? (
            <button type="button" className="ref-btn-outline" onClick={resetForm}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="ref-card overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">Records ({pagination.total})</h3>
          <input
            className="ref-input ml-auto w-full max-w-xs"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(1, search)}
          />
          <button type="button" className="ref-btn-outline" onClick={() => load(1, search)}>
            Search
          </button>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Student</th>
              <th className="px-5 py-3 font-medium">Subject</th>
              <th className="px-5 py-3 font-medium">Exam</th>
              <th className="px-5 py-3 font-medium">Marks</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-slate-500">
                  Loading...
                </td>
              </tr>
            ) : items.length ? (
              items.map((item) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">
                    {item.studentId
                      ? `${item.studentId.firstName} ${item.studentId.lastName}`
                      : "-"}
                  </td>
                  <td className="px-5 py-3 text-slate-700">{item.subject}</td>
                  <td className="px-5 py-3 text-slate-700">{item.examType}</td>
                  <td className="px-5 py-3 text-slate-700">
                    {item.marks}/{item.maxMarks} {item.grade ? `(${item.grade})` : ""}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button type="button" className="ref-btn-outline" onClick={() => onEdit(item)}>
                        Edit
                      </button>
                      <button type="button" className="ref-btn-danger" onClick={() => onDelete(item._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-slate-500">
                  No academic records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
