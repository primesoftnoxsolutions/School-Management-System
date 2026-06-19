import { useEffect, useState } from "react";
import api from "../services/api/client";
import FormModal from "../components/ui/FormModal";
import PageHeader from "../components/ui/PageHeader";
import { MONTHS, PAYMENT_METHODS } from "../constants/finance";

const emptyForm = {
  staffId: "",
  month: MONTHS[new Date().getMonth()],
  year: new Date().getFullYear(),
  basicSalary: "",
  allowances: "0",
  deductions: "0",
  bonus: "0",
  paymentMethod: "BANK",
  remarks: "",
};

export default function PayrollPage({ role }) {
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/payroll", { params: { page: 1, limit: 50 } });
      setItems(data.data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get("/payroll/staff").then((r) => setStaff(r.data.data || [])).catch(() => setStaff([]));
    load();
  }, []);

  const netPreview =
    Math.max(
      Number(form.basicSalary || 0) +
        Number(form.allowances || 0) +
        Number(form.bonus || 0) -
        Number(form.deductions || 0),
      0
    );

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/payroll", form);
      setForm(emptyForm);
      setShowModal(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create payroll");
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (id) => {
    try {
      await api.post(`/payroll/${id}/pay`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to mark paid");
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Payroll"
        subtitle="Manage staff salaries, allowances, deductions and payments."
        actionLabel="Create Payroll"
        onAction={() => setShowModal(true)}
      />
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="ref-card overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3">Staff</th>
              <th className="px-5 py-3">Period</th>
              <th className="px-5 py-3">Basic</th>
              <th className="px-5 py-3">Net Salary</th>
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
                  <td className="px-5 py-3">{item.staffName} <span className="text-slate-400">({item.staffRole})</span></td>
                  <td className="px-5 py-3">{item.month} {item.year}</td>
                  <td className="px-5 py-3">Rs. {item.basicSalary?.toLocaleString()}</td>
                  <td className="px-5 py-3 font-medium">Rs. {item.netSalary?.toLocaleString()}</td>
                  <td className="px-5 py-3">{item.status}</td>
                  <td className="px-5 py-3">
                    {item.status === "PENDING" ? (
                      <button type="button" className="ref-btn-outline" onClick={() => markPaid(item._id)}>
                        Mark Paid
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {item.paidAt ? new Date(item.paidAt).toLocaleDateString() : "-"}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-5 py-6 text-slate-500">No payroll records.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModal open={showModal} title="Create Payroll" onClose={() => setShowModal(false)} wide>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select className="ref-input sm:col-span-2" value={form.staffId} onChange={(e) => setForm({ ...form, staffId: e.target.value })} required>
            <option value="">Select staff *</option>
            {staff.map((s) => <option key={s._id} value={s._id}>{s.fullName} ({s.role})</option>)}
          </select>
          <select className="ref-input" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}>
            {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <input type="number" className="ref-input" placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} required />
          <input type="number" className="ref-input" placeholder="Basic salary *" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} required min="0" />
          <input type="number" className="ref-input" placeholder="Allowances" value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} min="0" />
          <input type="number" className="ref-input" placeholder="Deductions" value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} min="0" />
          <input type="number" className="ref-input" placeholder="Bonus" value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })} min="0" />
          <select className="ref-input" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
            {PAYMENT_METHODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <div className="flex items-center rounded-xl bg-slate-50 px-4 text-sm font-semibold text-slate-700 sm:col-span-2">
            Net Salary: Rs. {netPreview.toLocaleString()}
          </div>
          <input className="ref-input sm:col-span-2" placeholder="Remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          <button type="submit" className="ref-btn-primary sm:col-span-2" disabled={saving}>{saving ? "Saving..." : "Create Payroll"}</button>
        </form>
      </FormModal>
    </section>
  );
}
