import { useEffect, useMemo, useState } from "react";
import api from "../services/api/client";
import FormModal from "../components/ui/FormModal";
import PageHeader from "../components/ui/PageHeader";
import TablePagination from "../components/ui/TablePagination";
import { CLASS_OPTIONS, SECTION_OPTIONS } from "../constants/classes";
import { ICS_DETAIL_OPTIONS, getStreamConfig, isSeniorClass } from "../constants/academicStreams";

const initialForm = {
  firstName: "",
  lastName: "",
  gender: "MALE",
  cnicBForm: "",
  guardianName: "",
  guardianPhone: "",
  address: "",
  className: "",
  section: "A",
  academicStream: "",
  streamDetail: "",
  admissionFee: "",
  monthlyFee: "",
  admissionFeePaid: false,
};

export default function AdmissionsPage({ role }) {
  const canCreate = role === "SUPER_ADMIN";
  const [form, setForm] = useState(initialForm);
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });

  const streamConfig = useMemo(() => getStreamConfig(form.className), [form.className]);
  const showIcsDetail = isSeniorClass(form.className) && form.academicStream === "ICS";

  const resetStreamFields = (className) => ({
    academicStream: "",
    streamDetail: "",
  });

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
    loadAdmissions(1, "");
  }, []);

  const onCreate = async (event) => {
    event.preventDefault();
    if (streamConfig.tier !== "none" && !form.academicStream) {
      setError("Please select a subject / stream for this class.");
      return;
    }
    if (showIcsDetail && !form.streamDetail) {
      setError("Please select ICS specialization.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.post("/admissions", {
        ...form,
        admissionFee: Number(form.admissionFee || 0),
        monthlyFee: Number(form.monthlyFee || 0),
      });
      setForm(initialForm);
      setShowModal(false);
      await loadAdmissions(1, search);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create admission");
    } finally {
      setSaving(false);
    }
  };

  const streamLabel = (student) => {
    if (!student.academicStream) return "-";
    if (student.streamDetail) return `${student.academicStream} (${student.streamDetail})`;
    return student.academicStream;
  };

  return (
    <section className="space-y-4">
      <PageHeader
        title="Admissions"
        subtitle="Registration workflow, class assignment and searchable admissions register."
        actionLabel={canCreate ? "Create Admission" : null}
        onAction={canCreate ? () => setShowModal(true) : null}
      />

      <div className="ref-card flex flex-col gap-2 p-4 md:flex-row md:items-center md:justify-between">
        <input
          placeholder="Search by admission no or name"
          className="ref-input w-full md:max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadAdmissions(1, search)}
        />
        <button type="button" onClick={() => loadAdmissions(1, search)} className="ref-btn-outline">
          Search
        </button>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="ref-card overflow-hidden p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Admission No</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Stream</th>
              <th className="px-4 py-3 font-medium">Monthly Fee</th>
              <th className="px-4 py-3 font-medium">Guardian</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-slate-500" colSpan={7}>
                  Loading admissions...
                </td>
              </tr>
            ) : items.length ? (
              items.map((item) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{item.admissionNo}</td>
                  <td className="px-4 py-3">
                    {item.firstName} {item.lastName}
                  </td>
                  <td className="px-4 py-3">
                    {item.className} - {item.section}
                  </td>
                  <td className="px-4 py-3">{streamLabel(item)}</td>
                  <td className="px-4 py-3">
                    {item.monthlyFee ? `Rs. ${Number(item.monthlyFee).toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3">{item.guardianName}</td>
                  <td className="px-4 py-3">{new Date(item.admissionDate).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-8 text-slate-500" colSpan={7}>
                  No admissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <TablePagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPrev={() => loadAdmissions(Math.max(page - 1, 1), search)}
          onNext={() => loadAdmissions(Math.min(page + 1, pagination.totalPages), search)}
        />
      </div>

      <FormModal open={showModal} title="Create Admission" onClose={() => setShowModal(false)} wide>
        <form onSubmit={onCreate} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <input className="ref-input" placeholder="First name *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            <input className="ref-input" placeholder="Last name *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            <select className="ref-input" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
            <input className="ref-input" placeholder="CNIC / B-Form" value={form.cnicBForm} onChange={(e) => setForm({ ...form, cnicBForm: e.target.value })} />
            <input className="ref-input" placeholder="Mobile number *" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} required />
            <input className="ref-input" placeholder="Father / Guardian name *" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} required />
            <input className="ref-input md:col-span-3" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <select
              className="ref-input"
              value={form.className}
              onChange={(e) => setForm({ ...form, className: e.target.value, ...resetStreamFields(e.target.value) })}
              required
            >
              <option value="">Select class *</option>
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <select className="ref-input" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} required>
              {SECTION_OPTIONS.map((sec) => (
                <option key={sec} value={sec}>Section {sec}</option>
              ))}
            </select>
            {streamConfig.tier !== "none" ? (
              <select
                className="ref-input"
                value={form.academicStream}
                onChange={(e) => setForm({ ...form, academicStream: e.target.value, streamDetail: "" })}
                required
              >
                <option value="">{streamConfig.tier === "senior" ? "Select stream *" : "Select subject *"}</option>
                {streamConfig.options.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <div />
            )}
            {showIcsDetail ? (
              <select
                className="ref-input md:col-span-2"
                value={form.streamDetail}
                onChange={(e) => setForm({ ...form, streamDetail: e.target.value })}
                required
              >
                <option value="">Select ICS specialization *</option>
                {ICS_DETAIL_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : null}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Fee details</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <input type="number" min="0" className="ref-input" placeholder="Admission fee (Rs.)" value={form.admissionFee} onChange={(e) => setForm({ ...form, admissionFee: e.target.value })} />
              <input type="number" min="0" className="ref-input" placeholder="Monthly fee (Rs.) *" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} required />
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.admissionFeePaid}
                  onChange={(e) => setForm({ ...form, admissionFeePaid: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                Admission fee paid
              </label>
            </div>
          </div>

          <button type="submit" disabled={saving} className="ref-btn-primary w-full">
            {saving ? "Saving..." : "Create Admission"}
          </button>
        </form>
      </FormModal>
    </section>
  );
}
