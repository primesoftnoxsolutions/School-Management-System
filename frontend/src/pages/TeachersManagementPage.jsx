import { useEffect, useState } from "react";
import api from "../services/api/client";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
};

export default function TeachersManagementPage() {
  const [form, setForm] = useState(initialForm);
  const [teachers, setTeachers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [teachersRes, activitiesRes] = await Promise.all([
        api.get("/teachers", { params: { search, page: 1, limit: 20 } }),
        api.get("/teachers/activities", { params: { search, page: 1, limit: 20 } }),
      ]);
      setTeachers(teachersRes.data?.data?.items || []);
      setActivities(activitiesRes.data?.data?.activities || []);
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
      setForm(initialForm);
      setSuccess("Teacher account created. Teacher can now login to their own panel.");
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create teacher");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="premium-title text-2xl font-semibold">Teachers Management</h2>
        <p className="text-sm text-sky-800/70">
          Create teacher roles, assign panel access, and monitor teacher activities.
        </p>
      </header>

      <form onSubmit={onCreateTeacher} className="premium-card grid grid-cols-1 gap-3 md:grid-cols-4">
        <input
          className="premium-input"
          placeholder="Full name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          required
        />
        <input
          className="premium-input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="premium-input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit" disabled={saving} className="premium-btn">
          {saving ? "Creating..." : "Create Teacher Panel"}
        </button>
      </form>

      <div className="premium-card flex flex-wrap items-center gap-2">
        <input
          className="premium-input md:max-w-xs"
          placeholder="Search teacher"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="premium-btn-soft" onClick={loadData}>
          Search
        </button>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <div className="premium-card overflow-x-auto p-0">
        <h3 className="px-4 py-3 text-sm font-semibold text-slate-800">Teacher Accounts</h3>
        <table className="min-w-full text-sm">
          <thead className="bg-sky-100/60 text-left text-sky-900">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-slate-500">
                  Loading teachers...
                </td>
              </tr>
            ) : teachers.length ? (
              teachers.map((teacher) => (
                <tr key={teacher._id} className="border-t border-sky-100/80">
                  <td className="px-4 py-3">{teacher.fullName}</td>
                  <td className="px-4 py-3">{teacher.email}</td>
                  <td className="px-4 py-3">{teacher.isActive ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-3">{new Date(teacher.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-slate-500">
                  No teachers found. Create a teacher to enable their panel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="premium-card overflow-x-auto p-0">
        <h3 className="px-4 py-3 text-sm font-semibold text-slate-800">Teacher Activity Monitor</h3>
        <table className="min-w-full text-sm">
          <thead className="bg-sky-100/60 text-left text-sky-900">
            <tr>
              <th className="px-4 py-3">Teacher</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Performed At</th>
            </tr>
          </thead>
          <tbody>
            {activities.length ? (
              activities.map((item) => (
                <tr key={item._id} className="border-t border-sky-100/80">
                  <td className="px-4 py-3">{item.teacherId?.fullName || "-"}</td>
                  <td className="px-4 py-3">{item.action}</td>
                  <td className="px-4 py-3">{item.module}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">{new Date(item.performedAt).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-slate-500">
                  No teacher activities yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
