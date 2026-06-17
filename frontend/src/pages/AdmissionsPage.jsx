import { useEffect, useState } from "react";
import api from "../services/api/client";

const initialForm = {
  firstName: "",
  lastName: "",
  gender: "MALE",
  dateOfBirth: "",
  guardianName: "",
  guardianPhone: "",
  className: "",
  section: "A",
};

export default function AdmissionsPage({ role }) {
  const [form, setForm] = useState(initialForm);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });

  const loadAdmissions = async (nextPage = page, nextSearch = search) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admissions", {
        params: { page: nextPage, limit: pagination.limit, search: nextSearch },
      });
      setItems(data.data.items || []);
      setPagination({
        total: data.data.total || 0,
        totalPages: data.data.totalPages || 1,
        limit: data.data.limit,
      });
      setPage(data.data.page);
    } catch (err) {
      setItems([]);
      setPagination({ total: 0, totalPages: 1, limit: 10 });
      setError(err.response?.data?.message || "Failed to load admissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      await loadAdmissions(1, "");
    };
    boot();
  }, []);

  const onCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/admissions", form);
      setForm(initialForm);
      await loadAdmissions(1, "");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create admission");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="premium-title text-xl font-semibold">Admissions</h2>
        <p className="text-sm text-sky-800/70">
          Registration workflow, class assignment and searchable admissions register.
        </p>
      </header>

      {role === "SUPER_ADMIN" ? (
        <form
          onSubmit={onCreate}
          className="premium-card grid grid-cols-1 gap-3 md:grid-cols-3"
        >
          <input
            placeholder="First name"
            className="premium-input"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
          />
          <input
            placeholder="Last name"
            className="premium-input"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
          />
          <select
            className="premium-input"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            type="date"
            className="premium-input"
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            required
          />
          <input
            placeholder="Guardian name"
            className="premium-input"
            value={form.guardianName}
            onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
            required
          />
          <input
            placeholder="Guardian phone"
            className="premium-input"
            value={form.guardianPhone}
            onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })}
            required
          />
          <input
            placeholder="Class name"
            className="premium-input"
            value={form.className}
            onChange={(e) => setForm({ ...form, className: e.target.value })}
            required
          />
          <input
            placeholder="Section"
            className="premium-input"
            value={form.section}
            onChange={(e) => setForm({ ...form, section: e.target.value })}
          />
          <button
            type="submit"
            disabled={saving}
            className="premium-btn"
          >
            {saving ? "Saving..." : "Create Admission"}
          </button>
        </form>
      ) : null}

      <div className="premium-card flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <input
          placeholder="Search by admission no or name"
          className="premium-input w-full md:max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          onClick={() => loadAdmissions(1, search)}
          className="premium-btn-soft"
        >
          Search
        </button>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="premium-card overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-sky-100/60 text-left text-sky-900">
            <tr>
              <th className="px-4 py-3">Admission No</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Class</th>
              <th className="px-4 py-3">Guardian</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  Loading admissions...
                </td>
              </tr>
            ) : items.length ? (
              items.map((item) => (
                <tr key={item._id} className="border-t border-sky-100/80">
                  <td className="px-4 py-3">{item.admissionNo}</td>
                  <td className="px-4 py-3">
                    {item.firstName} {item.lastName}
                  </td>
                  <td className="px-4 py-3">
                    {item.className} - {item.section}
                  </td>
                  <td className="px-4 py-3">{item.guardianName}</td>
                  <td className="px-4 py-3">{new Date(item.admissionDate).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-4 text-slate-500" colSpan={5}>
                  No admissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="premium-card flex items-center justify-between text-sm text-slate-600">
        <p>
          Total: {pagination.total} | Page {page} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => loadAdmissions(Math.max(page - 1, 1), search)}
            disabled={page <= 1}
            className="premium-btn-soft px-3 py-1.5 disabled:opacity-50"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => loadAdmissions(Math.min(page + 1, pagination.totalPages), search)}
            disabled={page >= pagination.totalPages}
            className="premium-btn-soft px-3 py-1.5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
