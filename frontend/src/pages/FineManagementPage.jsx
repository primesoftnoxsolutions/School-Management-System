import { useEffect, useState } from "react";
import api from "../services/api/client";
import FormModal from "../components/ui/FormModal";
import PageHeader from "../components/ui/PageHeader";
import { CLASS_OPTIONS, SECTION_OPTIONS } from "../constants/classes";
import { FINE_TYPES, PAYMENT_METHODS } from "../constants/finance";

const emptyForm = {
  className: "",
  section: "",
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
  const filteredStudents = students.filter((s) => {
    const matchesClass = form.className ? s.className === form.className : true;
    const matchesSection = form.section ? (s.section || "A") === form.section : true;
    return matchesClass && matchesSection;
  });

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
      const { className: _className, section: _section, ...finePayload } = form;
      await api.post("/fines", finePayload);
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

      <FormModal open={showModal} title="Issue Fine" onClose={() => setShowModal(false)} wide>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
            <p className="text-sm font-bold text-slate-900">Fine Details</p>
            <p className="mt-1 text-xs text-slate-500">Filter by class and section before selecting the student.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <select className="ref-input" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value, studentId: "" })}>
            <option value="">Select class</option>
            {CLASS_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="ref-input" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value, studentId: "" })}>
            <option value="">Select section</option>
            {SECTION_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="ref-input md:col-span-2" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
            <option value="">Select student *</option>
            {filteredStudents.map((s) => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} - {s.className} {s.section || "A"}</option>)}
          </select>
          <select className="ref-input w-full" value={form.fineType} onChange={(e) => setForm({ ...form, fineType: e.target.value })}>
            {FINE_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <input type="number" className="ref-input w-full" placeholder="Fine amount *" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="0" />
          <input className="ref-input w-full" placeholder="Reason *" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
          <input type="date" className="ref-input w-full" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <button type="submit" className="ref-btn-primary w-full" disabled={saving}>{saving ? "Saving..." : "Issue Fine"}</button>
        </form>
      </FormModal>
    </section>
  );
}
