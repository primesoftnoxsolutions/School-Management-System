import { useEffect, useState } from "react";
import api from "../services/api/client";
import FormModal from "../components/ui/FormModal";
import PageHeader from "../components/ui/PageHeader";
import { FINE_TYPES, PAYMENT_METHODS } from "../constants/finance";

const emptyForm = {
  studentId: "",
  fineType: "LATE_FEE",
  amount: "",
  reason: "",
  dueDate: "",
};

export default function FineManagementPage({ role }) {
  const isAdmin = role === "SUPER_ADMIN";
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/fines", {
        params: { page: 1, limit: 50, status: statusFilter || undefined },
      });
      setItems(data.data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/students", { params: { page: 1, limit: 200 } })
      .then((r) => setStudents(r.data.data.items || []))
      .catch(() => setStudents([]));
    load();
  }, [statusFilter]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/fines", form);
      setForm(emptyForm);
      setShowModal(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to issue fine");
    } finally {
      setSaving(false);
    }
  };

  const payFine = async (id) => {
    try {
      await api.post(`/fines/${id}/pay`, { paymentMethod: "CASH" });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to collect fine");
    }
  };

  const waiveFine = async (id) => {
    const reason = window.prompt("Waive reason:");
    if (!reason) return;
    try {
      await api.post(`/fines/${id}/waive`, { waivedReason: reason });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to waive fine");
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader title="Fine Management" subtitle="Issue, collect and waive student fines." actionLabel="Issue Fine" onAction={() => setShowModal(true)} />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="ref-card overflow-hidden p-0">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <h3 className="font-semibold text-slate-800">Fine Records</h3>
          <select className="ref-select ml-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="WAIVED">Waived</option>
          </select>
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3">Student</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Reason</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-6">Loading...</td></tr>
            ) : items.length ? (
              items.map((item) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-5 py-3">
                    {item.studentId ? `${item.studentId.firstName} ${item.studentId.lastName}` : "-"}
                  </td>
                  <td className="px-5 py-3">{item.fineType}</td>
                  <td className="px-5 py-3">Rs. {item.amount?.toLocaleString()}</td>
                  <td className="px-5 py-3">{item.reason}</td>
                  <td className="px-5 py-3">{item.status}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      {item.status === "PENDING" ? (
                        <button type="button" className="ref-btn-outline" onClick={() => payFine(item._id)}>
                          Collect
                        </button>
                      ) : null}
                      {item.status === "PENDING" && isAdmin ? (
                        <button type="button" className="ref-btn-danger" onClick={() => waiveFine(item._id)}>
                          Waive
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-5 py-6 text-slate-500">No fines found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModal open={showModal} title="Issue Fine" onClose={() => setShowModal(false)}>
        <form onSubmit={onSubmit} className="space-y-3">
          <select className="ref-input w-full" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
            <option value="">Select student *</option>
            {students.map((s) => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}
          </select>
          <select className="ref-input w-full" value={form.fineType} onChange={(e) => setForm({ ...form, fineType: e.target.value })}>
            {FINE_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <input type="number" className="ref-input w-full" placeholder="Fine amount *" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="0" />
          <input className="ref-input w-full" placeholder="Reason *" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
          <input type="date" className="ref-input w-full" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <button type="submit" className="ref-btn-primary w-full" disabled={saving}>{saving ? "Saving..." : "Issue Fine"}</button>
        </form>
      </FormModal>
    </section>
  );
}
