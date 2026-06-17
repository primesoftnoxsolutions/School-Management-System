import { useEffect, useState } from "react";
import api from "../../services/api/client";

const emptyForm = {
  studentId: "",
  className: "",
  section: "A",
  date: new Date().toISOString().slice(0, 10),
  status: "PRESENT",
  remarks: "",
};

export default function TeacherAttendancePage() {
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
      const { data } = await api.get("/teacher-panel/attendance", {
        params: { page: nextPage, limit: 10, search: nextSearch },
      });
      setItems(data.data.items || []);
      setPagination({ totalPages: data.data.totalPages || 1, total: data.data.total || 0 });
      setPage(data.data.page || nextPage);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attendance");
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
    setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 10) });
    setEditId(null);
  };

  const onClassSelect = (value) => {
    const selected = classOptions.find((c) => c._id === value);
    if (selected) {
      setForm({
        ...form,
        className: selected.className,
        section: selected.section || "A",
        studentId: "",
      });
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editId) {
        await api.put(`/teacher-panel/attendance/${editId}`, {
          status: form.status,
          remarks: form.remarks,
          date: form.date,
        });
      } else {
        await api.post("/teacher-panel/attendance", form);
      }
      resetForm();
      await load(1, search);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save attendance");
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
      date: item.date ? new Date(item.date).toISOString().slice(0, 10) : "",
      status: item.status,
      remarks: item.remarks || "",
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this attendance record?")) return;
    try {
      await api.delete(`/teacher-panel/attendance/${id}`);
      if (editId === id) resetForm();
      await load(page, search);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete attendance");
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Mark Attendance</h2>
        <p className="text-sm text-slate-500">Record and manage daily student attendance.</p>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {!classOptions.length ? (
        <div className="ref-card p-5 text-sm text-slate-600">
          Please add a class in <strong>My Classes</strong> first, then mark attendance here.
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="ref-card grid grid-cols-1 gap-3 p-5 md:grid-cols-3">
        <select
          className="ref-input"
          value={classOptions.find((c) => c.className === form.className && c.section === form.section)?._id || ""}
          onChange={(e) => onClassSelect(e.target.value)}
          required={!editId}
          disabled={!!editId}
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
          disabled={!!editId || !form.className}
        >
          <option value="">Select student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.firstName} {s.lastName} ({s.admissionNo})
            </option>
          ))}
        </select>
        <input
          type="date"
          className="ref-input"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <select
          className="ref-input"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="LATE">Late</option>
          <option value="LEAVE">Leave</option>
        </select>
        <input
          className="ref-input md:col-span-2"
          placeholder="Remarks (optional)"
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
        />
        <div className="flex gap-2 md:col-span-3">
          <button type="submit" className="ref-btn-primary" disabled={saving || !classOptions.length}>
            {saving ? "Saving..." : editId ? "Update Attendance" : "Mark Attendance"}
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
          <h3 className="text-base font-semibold text-slate-800">Attendance Records ({pagination.total})</h3>
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
              <th className="px-5 py-3 font-medium">Class</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Status</th>
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
                  <td className="px-5 py-3 text-slate-700">
                    {item.className} - {item.section}
                  </td>
                  <td className="px-5 py-3 text-slate-700">
                    {item.date ? new Date(item.date).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-5 py-3 text-slate-700">{item.status}</td>
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
                  No attendance records yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
