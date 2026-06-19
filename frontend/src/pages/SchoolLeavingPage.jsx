import { useEffect, useState } from "react";
import api from "../services/api/client";
import FormModal from "../components/ui/FormModal";
import PageHeader from "../components/ui/PageHeader";
import LeavingCertificatePreview from "../components/certificates/LeavingCertificatePreview";

const emptyForm = {
  studentId: "",
  dateOfLeaving: new Date().toISOString().slice(0, 10),
  reasonForLeaving: "",
  conduct: "Good",
  remarks: "",
};

export default function SchoolLeavingPage({ role }) {
  const canCreate = role === "SUPER_ADMIN";
  const [form, setForm] = useState(emptyForm);
  const [students, setStudents] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [preview, setPreview] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [certRes, studentRes] = await Promise.all([
        api.get("/school-leaving", { params: { page: 1, limit: 50 } }),
        api.get("/students", { params: { page: 1, limit: 300, status: "ACTIVE" } }),
      ]);
      setItems(certRes.data.data.items || []);
      setStudents(studentRes.data.data.items || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const { data } = await api.post("/school-leaving", form);
      setForm(emptyForm);
      setShowModal(false);
      setPreview(data.data);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create certificate");
    } finally {
      setSaving(false);
    }
  };

  const viewCert = async (id) => {
    try {
      const { data } = await api.get(`/school-leaving/${id}`);
      setPreview(data.data);
    } catch {
      setError("Failed to load certificate");
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="School Leaving"
        subtitle="Issue and manage school leaving certificates for departing students."
        actionLabel={canCreate ? "Create Leaving Certificate" : null}
        onAction={canCreate ? () => setShowModal(true) : null}
      />

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="ref-card overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Certificate No</th>
              <th className="px-5 py-3 font-medium">Student</th>
              <th className="px-5 py-3 font-medium">Class</th>
              <th className="px-5 py-3 font-medium">Leaving Date</th>
              <th className="px-5 py-3 font-medium">Reason</th>
              <th className="px-5 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-8 text-slate-500">Loading...</td></tr>
            ) : items.length ? (
              items.map((item) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-medium">{item.certificateNo}</td>
                  <td className="px-5 py-3">{item.studentName}</td>
                  <td className="px-5 py-3">{item.className} - {item.section}</td>
                  <td className="px-5 py-3">{new Date(item.dateOfLeaving).toLocaleDateString()}</td>
                  <td className="px-5 py-3">{item.reasonForLeaving}</td>
                  <td className="px-5 py-3">
                    <button type="button" className="ref-btn-outline text-xs" onClick={() => viewCert(item._id)}>
                      View Certificate
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-5 py-8 text-slate-500">No leaving certificates yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModal open={showModal} title="Create Leaving Certificate" onClose={() => setShowModal(false)} wide>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <select
            className="ref-input md:col-span-2"
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            required
          >
            <option value="">Select student *</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.firstName} {s.lastName} — {s.className} {s.section || "A"}
              </option>
            ))}
          </select>
          <input
            type="date"
            className="ref-input"
            value={form.dateOfLeaving}
            onChange={(e) => setForm({ ...form, dateOfLeaving: e.target.value })}
            required
          />
          <select
            className="ref-input"
            value={form.conduct}
            onChange={(e) => setForm({ ...form, conduct: e.target.value })}
          >
            <option value="Excellent">Excellent</option>
            <option value="Good">Good</option>
            <option value="Satisfactory">Satisfactory</option>
          </select>
          <input
            className="ref-input md:col-span-2"
            placeholder="Reason for leaving *"
            value={form.reasonForLeaving}
            onChange={(e) => setForm({ ...form, reasonForLeaving: e.target.value })}
            required
          />
          <textarea
            className="ref-input md:col-span-2"
            rows={3}
            placeholder="Remarks (optional)"
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          />
          <button type="submit" className="ref-btn-primary md:col-span-2" disabled={saving}>
            {saving ? "Creating..." : "Generate Certificate"}
          </button>
        </form>
      </FormModal>

      {preview ? <LeavingCertificatePreview cert={preview} onClose={() => setPreview(null)} /> : null}
    </section>
  );
}
