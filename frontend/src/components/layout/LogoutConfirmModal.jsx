import { IconLogout } from "../icons/NavIcons";
import { MODAL_ANIM_MS, useAnimatedPresence } from "../../hooks/useAnimatedPresence";

export default function LogoutConfirmModal({
  open,
  onCancel,
  onConfirm,
  contextLabel = "Naseer Ideal Public School",
  message = "Are you sure you want to end this session? Unsaved work should be saved before leaving.",
  note = "You can sign back in anytime with your account.",
}) {
  const { render, exiting } = useAnimatedPresence(open, MODAL_ANIM_MS);

  if (!render) return null;

  const backdropClass = exiting ? "modal-backdrop-exit" : "modal-backdrop-enter";
  const panelClass = exiting ? "modal-panel-exit" : "modal-panel-enter";
  const bodyClass = exiting ? "modal-body-exit" : "modal-body-enter";

  return (
    <div
      className={`${backdropClass} fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm`}
      onClick={exiting ? undefined : onCancel}
      role="presentation"
    >
      <div
        className={`${panelClass} w-full max-w-lg overflow-hidden rounded-[1.35rem] border border-white/80 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)]`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
      >
        <div className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-blue-50 via-white to-violet-50 px-6 py-6">
          <div className="absolute right-5 top-5 h-20 w-20 rounded-full bg-blue-200/30 blur-2xl" aria-hidden="true" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-[0_16px_32px_rgba(244,63,94,0.16)] ring-1 ring-rose-100">
              <IconLogout className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-700">{contextLabel}</p>
              <h3 id="logout-title" className="mt-1 text-xl font-black tracking-tight text-slate-950">
                Confirm Logout
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
            </div>
          </div>
        </div>

        <div className={`${bodyClass} bg-white px-6 py-5`}>
          <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-xs font-semibold text-blue-900">
            {note}
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={exiting}
            className="rounded-xl border border-blue-100 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:opacity-50"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={exiting}
            className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-[0_14px_28px_rgba(15,23,42,0.24)] transition hover:bg-blue-950 disabled:opacity-50"
            onClick={onConfirm}
          >
            Yes, Log Out
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
