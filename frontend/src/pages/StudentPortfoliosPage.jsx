import { useEffect, useState } from "react";
import api from "../services/api/client";
import PageHeader from "../components/ui/PageHeader";
import TablePagination from "../components/ui/TablePagination";
import { CLASS_OPTIONS, SECTION_OPTIONS } from "../constants/classes";
import { labelFeeType } from "../constants/finance";

function StudentAvatar({ student }) {
  const initials = `${student?.firstName?.[0] || ""}${student?.lastName?.[0] || ""}`.toUpperCase();
  if (student?.studentPhotoUrl) {
    return (
      <img
        src={student.studentPhotoUrl}
        alt={initials}
        className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
      />
    );
  }
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
      {initials || "?"}
    </div>
  );
}

function FeeStatusBadge({ status }) {
  const paid = status === "PAID";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${paid ? "bg-emerald-50 text-emerald-700" : "bg-orange-50 text-orange-700"}`}>
      {paid ? "Paid" : status === "PARTIAL" ? "Partial" : "Pending"}
    </span>
  );
}

export default function StudentPortfoliosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 10 });
  const [selected, setSelected] = useState(null);
  const [feePortfolio, setFeePortfolio] = useState(null);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);

  const load = async (nextPage = page) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/students", {
        params: {
          page: nextPage,
          limit: pagination.limit,
          search,
          className: classFilter,
          section: sectionFilter,
          status: "ACTIVE",
        },
      });
      setItems(data.data.items || []);
      setPagination({
        total: data.data.total || 0,
        totalPages: data.data.totalPages || 1,
        limit: data.data.limit || 10,
      });
      setPage(data.data.page || nextPage);
    } catch (err) {
      setItems([]);
      setError(err.response?.data?.message || "Failed to load student portfolios");
    } finally {
      setLoading(false);
    }
  };

  const openStudent = async (student) => {
    setSelected(student);
    setFeePortfolio(null);
    setLoadingPortfolio(true);
    try {
      const { data } = await api.get(`/students/${student._id}/fee-portfolio`);
      setFeePortfolio(data.data);
    } catch {
      setFeePortfolio(null);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classFilter, sectionFilter]);

  const streamLabel = (student) => {
    if (!student?.academicStream) return "-";
    if (student.streamDetail) return `${student.academicStream} (${student.streamDetail})`;
    return student.academicStream;
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Students Portfolios"
        subtitle="Student profiles with fee status — monthly paid and pending fees."
        extra={
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="ref-select min-w-[140px]"
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All classes</option>
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
            <select
              className="ref-select w-24"
              value={sectionFilter}
              onChange={(e) => {
                setSectionFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Section</option>
              {SECTION_OPTIONS.map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>
        }
      />

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="ref-card overflow-hidden p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-800">Portfolios ({pagination.total})</h3>
          <input
            className="ref-input ml-auto w-full max-w-sm"
            placeholder="Search student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(1)}
          />
          <button type="button" className="ref-btn-outline" onClick={() => load(1)}>
            Search
          </button>
        </div>

        {loading ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">Loading portfolios...</p>
        ) : items.length ? (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((student) => (
              <button
                key={student._id}
                type="button"
                onClick={() => openStudent(student)}
                className="ref-card flex items-start gap-4 p-4 text-left transition hover:border-blue-200 hover:shadow-md"
              >
                <StudentAvatar student={student} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{student.admissionNo}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {student.className} - {student.section || "A"}
                  </p>
                  {student.monthlyFee ? (
                    <p className="mt-1 text-xs font-medium text-blue-600">
                      Monthly: Rs. {Number(student.monthlyFee).toLocaleString()}
                    </p>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-slate-500">No students found for this class.</p>
        )}

        <TablePagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          onPrev={() => load(Math.max(page - 1, 1))}
          onNext={() => load(Math.min(page + 1, pagination.totalPages))}
        />
      </div>

      {selected ? (
        <div className="modal-backdrop-enter fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[2px]">
          <div className="modal-panel-enter ref-card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-0">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex items-center gap-4">
                <StudentAvatar student={selected} />
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {selected.firstName} {selected.lastName}
                  </h3>
                  <p className="text-sm text-slate-500">{selected.admissionNo}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 px-6 py-5 text-sm">
              {[
                ["Father", selected.fatherName || selected.guardianName],
                ["Mobile", selected.guardianPhone],
                ["CNIC", selected.cnicBForm || "-"],
                ["Class", `${selected.className} - ${selected.section || "A"}`],
                ["Stream", streamLabel(selected)],
                ["Address", selected.address || "-"],
              ].map(([label, value]) => (
                <div key={label} className={label === "Address" ? "col-span-2" : ""}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-medium text-slate-800">{value || "-"}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 px-6 py-5">
              <h4 className="text-sm font-semibold text-slate-800">Fee Summary</h4>
              {loadingPortfolio ? (
                <p className="mt-3 text-sm text-slate-500">Loading fee records...</p>
              ) : feePortfolio ? (
                <>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Monthly Fee</p>
                      <p className="font-bold text-slate-800">Rs. {feePortfolio.summary.monthlyFee?.toLocaleString() || 0}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Admission Fee</p>
                      <p className="font-bold text-slate-800">Rs. {feePortfolio.summary.admissionFee?.toLocaleString() || 0}</p>
                    </div>
                    <div className="rounded-lg bg-orange-50 p-3">
                      <p className="text-xs text-orange-600">Total Pending</p>
                      <p className="font-bold text-orange-700">Rs. {feePortfolio.summary.totalPending?.toLocaleString() || 0}</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-3">
                      <p className="text-xs text-emerald-600">Total Paid</p>
                      <p className="font-bold text-emerald-700">Rs. {feePortfolio.summary.totalPaid?.toLocaleString() || 0}</p>
                    </div>
                  </div>

                  <div className="mt-4 overflow-x-auto rounded-xl border border-slate-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-left text-slate-500">
                        <tr>
                          <th className="px-4 py-2 font-medium">Month / Fee</th>
                          <th className="px-4 py-2 font-medium">Type</th>
                          <th className="px-4 py-2 font-medium">Amount</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feePortfolio.feeRecords.length ? (
                          feePortfolio.feeRecords.map((row) => (
                            <tr key={row.id} className="border-t border-slate-100">
                              <td className="px-4 py-2">{row.month || row.title}</td>
                              <td className="px-4 py-2">{labelFeeType(row.feeType)}</td>
                              <td className="px-4 py-2">Rs. {row.amount?.toLocaleString()}</td>
                              <td className="px-4 py-2">
                                <FeeStatusBadge status={row.status} />
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-4 py-4 text-slate-500">No fee records yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Fee data not available.</p>
              )}
            </div>

            <div className="flex justify-end border-t border-slate-100 px-6 py-4">
              <button type="button" className="ref-btn-primary" onClick={() => { setSelected(null); setFeePortfolio(null); }}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
