import { useEffect, useState } from "react";
import api from "../../services/api/client";
import { IconBell } from "../icons/NavIcons";
import { MODAL_ANIM_MS, useAnimatedPresence } from "../../hooks/useAnimatedPresence";

export default function FeeNotificationPopup({ open, onClose, dark = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { render, exiting } = useAnimatedPresence(open, MODAL_ANIM_MS);

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

  if (!render) return null;

  const backdropClass = exiting ? "modal-backdrop-exit" : "modal-backdrop-enter";
  const panelClass = exiting ? "modal-panel-exit" : "modal-panel-enter-top";
  const bodyClass = exiting ? "modal-body-exit" : "modal-body-enter";

  return (
    <div
      className={`${backdropClass} fixed inset-0 z-50 flex items-start justify-center px-4 pt-24 ${
        dark ? "bg-[#0b0c15]/50" : "bg-slate-900/30"
      }`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !exiting) onClose();
      }}
    >
      <div
        className={`${panelClass} ref-card w-full max-w-lg p-0 ${dark ? "border-white/[0.06] bg-[#161722]" : ""}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={`flex items-center justify-between border-b px-5 py-4 ${dark ? "border-white/[0.06]" : "border-slate-100"}`}>
          <div>
            <h3 className={`text-base font-semibold ${dark ? "text-white" : "text-slate-800"}`}>Pending Fee Alerts</h3>
            <p className={`text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Students with unpaid or overdue fees</p>
          </div>
          <button type="button" onClick={onClose} disabled={exiting} className="ref-icon-btn">
            ×
          </button>
        </div>
        <div className={`${bodyClass} max-h-80 overflow-y-auto p-4`}>
          {loading ? (
            <p className={`text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Loading pending fees...</p>
          ) : items.length ? (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl border px-4 py-3 ${
                    dark ? "border-white/[0.06] bg-[#1a1b26]" : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>{item.studentName}</p>
                      <p className={`text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>
                        {item.className} • {item.admissionNo}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-orange-600">Rs. {item.pendingAmount?.toLocaleString()}</p>
                  </div>
                  <p className={`mt-1 text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Status: {item.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className={`text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>No pending fee records found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeeBellButton({ count = 0, dark = false }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`relative flex h-11 w-11 items-center justify-center rounded-xl border text-sm transition ${
          dark ? "border-white/[0.06] bg-[#161722] text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white" : "border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
        }`}
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
      <FeeNotificationPopup open={open} onClose={() => setOpen(false)} dark={dark} />
    </>
  );
}
