import { useEffect, useMemo, useState } from "react";
import api from "../services/api/client";
import {
  getStoredPurchases,
  summarizePurchases,
} from "../utils/purchaseStore";
import {
  IconChecklist,
  IconFee,
  IconFine,
  IconReports,
  IconStudents,
} from "../components/icons/NavIcons";

const currency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

function SummaryCard({ label, value, helper, tone, Icon }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
  };

  return (
    <div className="ref-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {helper ? <p className="mt-2 text-xs font-medium text-slate-400">{helper}</p> : null}
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${tones[tone]}`}>
          {Icon ? <Icon className="h-5 w-5" /> : null}
        </span>
      </div>
    </div>
  );
}

export default function FinanceManagerDashboardPage({ onNavigate }) {
  const [overview, setOverview] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setPurchases(getStoredPurchases());

    const loadOverview = async () => {
      try {
        const { data } = await api.get("/reports/overview");
        setOverview(data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load finance summary.");
      }
    };

    loadOverview();
  }, []);

  const purchaseSummary = useMemo(() => summarizePurchases(purchases), [purchases]);
  const totalFees = Number(overview?.feeCollected || 0) + Number(overview?.pendingFees || 0);

  return (
    <section className="space-y-6">
      {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Purchase Statistics</h3>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            Total spent {currency(purchaseSummary.totalAmount)}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Total Desks Purchased" value={purchaseSummary.desks} helper="Furniture inventory" tone="blue" Icon={IconChecklist} />
          <SummaryCard label="Total Benches & Chairs Purchased" value={purchaseSummary.benchesChairs} helper="Classroom seating" tone="indigo" Icon={IconStudents} />
          <SummaryCard label="Total Bulbs Purchased" value={purchaseSummary.bulbs} helper="Electrical supplies" tone="amber" Icon={IconFine} />
          <SummaryCard label="Total Fans Purchased" value={purchaseSummary.fans} helper="Room equipment" tone="cyan" Icon={IconReports} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-bold text-slate-900">Financial Summary</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard label="Total Fees" value={currency(totalFees)} helper="Received plus pending" tone="violet" Icon={IconFee} />
          <SummaryCard label="Total Fees Received" value={currency(overview?.feeCollected)} helper="Collected fee payments" tone="green" Icon={IconFee} />
          <SummaryCard label="Total Pending Fees" value={currency(overview?.pendingFees)} helper="Outstanding fee balance" tone="rose" Icon={IconFee} />
        </div>
      </div>
    </section>
  );
}
