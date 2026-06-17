import { useEffect, useState } from "react";
import api from "../../services/api/client";

const emptyForm = { className: "", section: "A", subject: "", roomNo: "", schedule: "" };

export default function TeacherClassesPage() {
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  const load = async (nextPage = page, nextSearch = search) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/teacher-panel/classes", {
        params: { page: nextPage, limit: 10, search: nextSearch },
      });
      setItems(data.data.items || []);
      setPagination({ totalPages: data.data.totalPages || 1, total: data.data.total || 0 });
      setPage(data.data.page || nextPage);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load classes");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, "");
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editId) {
        await api.put(`/teacher-panel/classes/${editId}`, form);
      } else {
        await api.post("/teacher-panel/classes", form);
      }
      resetForm();
      await load(1, search);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save class");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (item) => {
    setEditId(item._id);
    setForm({
      className: item.className,
      section: item.section || "A",
      subject: item.subject,
      roomNo: item.roomNo || "",
      schedule: item.schedule || "",
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    setError("");
    try {
      await api.delete(`/teacher-panel/classes/${id}`);
      if (editId === id) resetForm();
      await load(page, search);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete class");
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Classes</h2>
        <p className="text-sm text-slate-500">Add, edit and manage your assigned classes.</p>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <form onSubmit={onSubmit} className="ref-card grid grid-cols-1 gap-3 p-5 md:grid-cols-3">
        <input
          className="ref-input"
          placeholder="Class name (e.g. Grade 5)"
          value={form.className}
          onChange={(e) => setForm({ ...form, className: e.target.value })}
          required
        />
        <input
          className="ref-input"
          placeholder="Section"
          value={form.section}
          onChange={(e) => setForm({ ...form, section: e.target.value })}
        />
        <input
          className="ref-input"
          placeholder="Subject"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          required
        />
        <input
          className="ref-input"
          placeholder="Room no"
          value={form.roomNo}
          onChange={(e) => setForm({ ...form, roomNo: e.target.value })}
        />
        <input
          className="ref-input md:col-span-2"
          placeholder="Schedule (e.g. Mon-Wed 9:00 AM)"
          value={form.schedule}
          onChange={(e) => setForm({ ...form, schedule: e.target.value })}
        />
        <div className="flex gap-2 md:col-span-3">
          <button type="submit" className="ref-btn-primary" disabled={saving}>
            {saving ? "Saving..." : editId ? "Update Class" : "Add Class"}
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
          <h3 className="text-base font-semibold text-slate-800">Class List ({pagination.total})</h3>
          <input
            className="ref-input ml-auto w-full max-w-xs"
            placeholder="Search classes..."
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
              <th className="px-5 py-3 font-medium">Class</th>
              <th className="px-5 py-3 font-medium">Section</th>
              <th className="px-5 py-3 font-medium">Subject</th>
              <th className="px-5 py-3 font-medium">Room</th>
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
                  <td className="px-5 py-3 text-slate-700">{item.className}</td>
                  <td className="px-5 py-3 text-slate-700">{item.section}</td>
                  <td className="px-5 py-3 text-slate-700">{item.subject}</td>
                  <td className="px-5 py-3 text-slate-700">{item.roomNo || "-"}</td>
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
                  No classes yet. Add your first class above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {pagination.totalPages > 1 ? (
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
            <button
              type="button"
              className="ref-btn-outline"
              disabled={page <= 1}
              onClick={() => load(page - 1, search)}
            >
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              className="ref-btn-outline"
              disabled={page >= pagination.totalPages}
              onClick={() => load(page + 1, search)}
            >
              Next
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
