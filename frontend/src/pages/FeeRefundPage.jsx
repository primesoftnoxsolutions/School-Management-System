import { useEffect, useState } from "react";
import api from "../services/api/client";
import FormModal from "../components/ui/FormModal";
import PageHeader from "../components/ui/PageHeader";
import { CLASS_OPTIONS, SECTION_OPTIONS } from "../constants/classes";
import { PAYMENT_METHODS, REFUND_STATUS, REFUND_TYPES } from "../constants/finance";

const emptyForm = {
  className: "",
  section: "",
  studentId: "",
  refundType: "FEES",
  amount: "",
  reason: "",
  refundMethod: "CASH",
  remarks: "",
};

export default function FeeRefundPage({ role }) {
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const filteredStudents = students.filter((s) => {
    const matchesClass = form.className ? s.className === form.className : true;
    const matchesSection = form.section ? (s.section || "A") === form.section : true;
    return matchesClass && matchesSection;
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/fee-refunds", { params: { page: 1, limit: 50 } });
      setItems(data.data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const boot = async () => {
      try {
        const { data } = await api.get("/students", { params: { page: 1, limit: 200 } });
        setStudents(data.data.items || []);
      } catch {
        setStudents([]);
      }
      await load();
    };
    boot();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { className: _className, section: _section, ...refundPayload } = form;
      await api.post("/fee-refunds", refundPayload);
      setForm(emptyForm);
      setShowModal(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create refund");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/fee-refunds/${id}/status`, { status });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const refundTypeLabel = (value) => REFUND_TYPES.find((r) => r.value === value)?.label || value;

  return (
    <section className="space-y-6">
      <PageHeader
        title="Fee Refund"
        subtitle="Request, approve and process student fee refunds."
        actionLabel="Create Refund"
        onAction={() => setShowModal(true)}
      />

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="ref-card overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Refund No</th>
              <th className="px-5 py-3 font-medium">Student</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Reason</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-6">Loading...</td></tr>
            ) : items.length ? (
              items.map((item) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-5 py-3">{item.refundNo}</td>
                  <td className="px-5 py-3">
                    {item.studentId ? `${item.studentId.firstName} ${item.studentId.lastName}` : "-"}
                  </td>
                  <td className="px-5 py-3">{refundTypeLabel(item.refundType)}</td>
                  <td className="px-5 py-3">Rs. {item.amount?.toLocaleString()}</td>
                  <td className="px-5 py-3">{item.reason}</td>
                  <td className="px-5 py-3">{item.status}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {REFUND_STATUS.filter((s) => s !== item.status).map((s) => (
                        <button
                          key={s}
                          type="button"
                          className="ref-btn-outline text-xs"
                          onClick={() => updateStatus(item._id, s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="px-5 py-6 text-slate-500">No refund records.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModal open={showModal} title="Create Refund" onClose={() => setShowModal(false)} wide>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4">
            <p className="text-sm font-bold text-slate-900">Refund Details</p>
            <p className="mt-1 text-xs text-slate-500">Select class and section to narrow the student list.</p>
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
          <select
            className="ref-input md:col-span-2"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            required
          >
            <option value="">Select student *</option>
            {filteredStudents.map((s) => (
              <option key={s._id} value={s._id}>{s.firstName} {s.lastName} - {s.className} {s.section || "A"}</option>
            ))}
          </select>
          <select
            className="ref-input"
            value={form.refundType}
            onChange={(e) => setForm({ ...form, refundType: e.target.value })}
            required
          >
            {REFUND_TYPES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <input
            type="number"
            className="ref-input"
            placeholder="Refund amount *"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
            min="0"
          />
          <input
            className="ref-input md:col-span-2"
            placeholder="Reason *"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            required
          />
          <select
            className="ref-input"
            value={form.refundMethod}
            onChange={(e) => setForm({ ...form, refundMethod: e.target.value })}
          >
            {PAYMENT_METHODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <input
            className="ref-input"
            placeholder="Remarks (optional)"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          />
          </div>
          <button type="submit" className="ref-btn-primary w-full" disabled={saving}>
            {saving ? "Saving..." : "Submit Refund Request"}
          </button>
        </form>
      </FormModal>
    </section>
  );
}
