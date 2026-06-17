import { useEffect, useState } from "react";
import api from "../../services/api/client";
import { FeeBellButton } from "./FeeNotificationPopup";

export default function TopHeader({ user }) {
  const [pendingFeeCount, setPendingFeeCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/dashboard/super-admin");
        setPendingFeeCount(response.data?.data?.pendingFeeCount || 0);
      } catch {
        setPendingFeeCount(0);
      }
    };
    if (user?.role === "SUPER_ADMIN" || user?.role === "ACCOUNTANT") {
      load();
    }
  }, [user?.role]);

  return (
    <header className="ref-header mb-6 flex items-center gap-4">
      <div className="relative min-w-0 flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
        <input
          type="search"
          placeholder="Search students, teachers, classes..."
          className="ref-search w-full pl-9"
        />
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <FeeBellButton count={pendingFeeCount} />
        <button type="button" className="ref-icon-btn" aria-label="Settings">
          <span className="text-xs font-bold">S</span>
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
            {(user?.fullName || "A").charAt(0)}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.fullName || "Admin"}</p>
            <p className="text-xs text-slate-500">
              {user?.role === "SUPER_ADMIN" ? "Super Admin" : user?.role || "User"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
