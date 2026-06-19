import { useEffect, useState } from "react";
import api from "../services/api/client";

const REPORT_TYPES = [
  { id: "overview", label: "Overview", endpoint: "/reports/overview" },
  { id: "fee-collection", label: "Fee Collection", endpoint: "/reports/fee-collection" },
  { id: "pending-fees", label: "Pending Fees", endpoint: "/reports/pending-fees" },
  { id: "refunds", label: "Fee Refunds", endpoint: "/reports/refunds" },
  { id: "fines", label: "Fines", endpoint: "/reports/fines" },
  { id: "payroll", label: "Payroll", endpoint: "/reports/payroll" },
  { id: "students", label: "Students Summary", endpoint: "/reports/students" },
  { id: "admissions", label: "Admissions", endpoint: "/reports/admissions" },
  { id: "attendance", label: "Attendance", endpoint: "/reports/attendance" },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState("overview");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const loadReport = async () => {
    const report = REPORT_TYPES.find((r) => r.id === reportType);
    if (!report) return;

    setLoading(true);
    setError("");
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      const { data: res } = await api.get(report.endpoint, { params });
      setData(res.data);
    } catch (err) {
      setData(null);
      setError(err.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportType]);

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportType}-report.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderOverview = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ["Total Students", data?.totalStudents],
        ["Total Teachers", data?.totalTeachers],
        ["Fee Collected", `Rs. ${(data?.feeCollected || 0).toLocaleString()}`],
        ["Pending Fees", `Rs. ${(data?.pendingFees || 0).toLocaleString()}`],
        ["Refunds Processed", `Rs. ${(data?.refundsProcessed || 0).toLocaleString()}`],
        ["Fines Pending", `Rs. ${(data?.finesPending || 0).toLocaleString()}`],
        ["Fines Collected", `Rs. ${(data?.finesCollected || 0).toLocaleString()}`],
        ["Payroll Paid", `Rs. ${(data?.payrollPaid || 0).toLocaleString()}`],
      ].map(([label, value]) => (
        <div key={label} className="ref-card p-4">
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{value ?? 0}</p>
        </div>
      ))}
    </div>
  );

  const renderTable = (rows, columns) => (
    <div className="ref-card overflow-x-auto p-0">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-500">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-5 py-3 font-medium">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.length ? (
            rows.map((row, i) => (
              <tr key={row._id || i} className="border-t border-slate-100">
                {columns.map((c) => (
                  <td key={c.key} className="px-5 py-3 text-slate-700">
                    {c.render ? c.render(row) : row[c.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-5 py-6 text-slate-500">No data.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderReport = () => {
    if (!data) return null;

    switch (reportType) {
      case "overview":
        return renderOverview();
      case "fee-collection":
        return (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-700">
              Total Collected: Rs. {(data.totalCollected || 0).toLocaleString()}
            </p>
            {renderTable(data.payments, [
              { key: "receiptNo", label: "Receipt", render: (r) => r.receiptNo },
              {
                key: "student",
                label: "Student",
                render: (r) => (r.studentId ? `${r.studentId.firstName} ${r.studentId.lastName}` : "-"),
              },
              { key: "feeType", label: "Type" },
              { key: "netAmount", label: "Amount", render: (r) => `Rs. ${r.netAmount?.toLocaleString()}` },
            ])}
          </div>
        );
      case "pending-fees":
        return renderTable(data, [
          {
            key: "student",
            label: "Student",
            render: (r) => (r.student ? `${r.student.firstName} ${r.student.lastName}` : "-"),
          },
          { key: "title", label: "Fee" },
          { key: "pendingAmount", label: "Pending", render: (r) => `Rs. ${r.pendingAmount?.toLocaleString()}` },
          { key: "status", label: "Status" },
        ]);
      case "refunds":
        return renderTable(data.items, [
          { key: "refundNo", label: "Refund No" },
          {
            key: "student",
            label: "Student",
            render: (r) => (r.studentId ? `${r.studentId.firstName} ${r.studentId.lastName}` : "-"),
          },
          { key: "amount", label: "Amount", render: (r) => `Rs. ${r.amount?.toLocaleString()}` },
          { key: "status", label: "Status" },
        ]);
      case "fines":
        return renderTable(data.items, [
          {
            key: "student",
            label: "Student",
            render: (r) => (r.studentId ? `${r.studentId.firstName} ${r.studentId.lastName}` : "-"),
          },
          { key: "fineType", label: "Type" },
          { key: "amount", label: "Amount", render: (r) => `Rs. ${r.amount?.toLocaleString()}` },
          { key: "status", label: "Status" },
        ]);
      case "payroll":
        return (
          <div className="space-y-4">
            <p className="text-sm font-semibold">Total: Rs. {(data.total || 0).toLocaleString()}</p>
            {renderTable(data.items, [
              { key: "staffName", label: "Staff" },
              { key: "month", label: "Month", render: (r) => `${r.month} ${r.year}` },
              { key: "netSalary", label: "Net", render: (r) => `Rs. ${r.netSalary?.toLocaleString()}` },
              { key: "status", label: "Status" },
            ])}
          </div>
        );
      case "students":
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="ref-card p-4">
              <h4 className="mb-3 font-semibold">By Class</h4>
              {(data.byClass || []).map((r) => (
                <div key={r._id} className="flex justify-between border-b border-slate-50 py-2 text-sm">
                  <span>{r._id || "Unassigned"}</span>
                  <span className="font-medium">{r.count}</span>
                </div>
              ))}
            </div>
            <div className="ref-card p-4">
              <h4 className="mb-3 font-semibold">By Gender</h4>
              {(data.byGender || []).map((r) => (
                <div key={r._id} className="flex justify-between border-b border-slate-50 py-2 text-sm">
                  <span>{r._id}</span>
                  <span className="font-medium">{r.count}</span>
                </div>
              ))}
              <p className="mt-4 text-sm font-semibold">Total: {data.total}</p>
            </div>
          </div>
        );
      case "admissions":
        return renderTable(data.recent, [
          {
            key: "student",
            label: "Student",
            render: (r) => (r.studentId ? `${r.studentId.firstName} ${r.studentId.lastName}` : "-"),
          },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Date", render: (r) => new Date(r.createdAt).toLocaleDateString() },
        ]);
      case "attendance":
        return (
          <div className="ref-card p-4">
            <h4 className="mb-3 font-semibold">Attendance Summary</h4>
            {(data.summary || []).map((r) => (
              <div key={r._id} className="flex justify-between border-b border-slate-50 py-2 text-sm">
                <span>{r._id}</span>
                <span className="font-medium">{r.count}</span>
              </div>
            ))}
          </div>
        );
      default:
        return <pre className="ref-card overflow-auto p-4 text-xs">{JSON.stringify(data, null, 2)}</pre>;
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
        <p className="text-sm text-slate-500">Generate and download school management reports.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {REPORT_TYPES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setReportType(r.id)}
            className={`rounded-xl px-3 py-2 text-xs font-medium sm:text-sm ${
              reportType === r.id ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="ref-card flex flex-wrap items-end gap-3 p-4">
        <div>
          <label className="mb-1 block text-xs text-slate-500">From</label>
          <input type="date" className="ref-input" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">To</label>
          <input type="date" className="ref-input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <button type="button" className="ref-btn-primary" onClick={loadReport}>
          Apply Filter
        </button>
        <button type="button" className="ref-btn-outline" onClick={downloadReport} disabled={!data}>
          Download JSON
        </button>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {loading ? <p className="text-sm text-slate-500">Loading report...</p> : renderReport()}
    </section>
  );
}
