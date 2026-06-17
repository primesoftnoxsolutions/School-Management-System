import { useEffect, useState } from "react";
import api from "../../services/api/client";
import { IconBell } from "../icons/NavIcons";

export default function FeeNotificationPopup({ open, onClose }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const response = await api.get("/dashboard/pending-fees");
        setItems(response.data?.data || []);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/30 px-4 pt-24">
      <div className="ref-card w-full max-w-lg p-0">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Pending Fee Alerts</h3>
            <p className="text-xs text-slate-500">Students with unpaid or overdue fees</p>
          </div>
          <button type="button" onClick={onClose} className="ref-icon-btn">
            ×
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-4">
          {loading ? (
            <p className="text-sm text-slate-500">Loading pending fees...</p>
          ) : items.length ? (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.studentName}</p>
                      <p className="text-xs text-slate-500">
                        {item.className} • {item.admissionNo}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-orange-600">Rs. {item.pendingAmount?.toLocaleString()}</p>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Status: {item.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No pending fee records found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeeBellButton({ count = 0 }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="ref-icon-btn relative"
        aria-label="Pending fee notifications"
        onClick={() => setOpen(true)}
      >
        <IconBell className="h-4 w-4" />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] text-white">
            {count}
          </span>
        ) : null}
      </button>
      <FeeNotificationPopup open={open} onClose={() => setOpen(false)} />
    </>
  );
}
