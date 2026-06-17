import { useEffect, useState } from "react";
import api from "../services/api/client";
import StatCard from "../components/dashboard/StatCard";
import {
  IconClasses,
  IconClock,
  IconPresent,
  IconTasks,
} from "../components/icons/DashboardIcons";

export default function TeacherPanelPage({ onNavigate }) {
  const [panel, setPanel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/teachers/my-panel");
      setPanel(response.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your teacher panel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <p className="text-sm text-slate-500">Loading your panel...</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  const summary = panel?.summary || {};
  const activities = panel?.recentActivities || [];

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Teacher Panel</h2>
        <p className="text-sm text-slate-500">
          Welcome {panel?.teacher?.fullName}. This is your dedicated teacher workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Assigned Classes"
          value={summary.assignedClasses ?? 0}
          tone="blue"
          icon={IconClasses}
        />
        <StatCard
          title="Today's Activities"
          value={summary.todaysActivities ?? 0}
          tone="green"
          icon={IconClock}
        />
        <StatCard
          title="Recent Activities"
          value={summary.totalActivities ?? 0}
          tone="purple"
          icon={IconTasks}
        />
        <StatCard
          title="Account Status"
          value={summary.status || "Active"}
          tone="sky"
          icon={IconPresent}
        />
      </div>

      <div className="ref-card p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-800">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { label: "Mark Attendance", target: "Mark Attendance" },
            { label: "View Assigned Classes", target: "My Classes" },
            { label: "Update Academic Records", target: "Academic Records" },
            { label: "Download Report", target: "Reports" },
          ].map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => onNavigate?.(action.target)}
              className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <span className="text-blue-600">{action.label}</span>
              <span className="text-slate-400">›</span>
            </button>
          ))}
        </div>
      </div>

      <div className="ref-card overflow-hidden p-0">
        <h3 className="border-b border-slate-100 px-5 py-4 text-base font-semibold text-slate-800">
          My Recent Activities
        </h3>
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Action</th>
              <th className="px-5 py-3 font-medium">Module</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Performed At</th>
            </tr>
          </thead>
          <tbody>
            {activities.length ? (
              activities.map((item) => (
                <tr key={item._id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{item.action}</td>
                  <td className="px-5 py-3 text-slate-700">{item.module}</td>
                  <td className="px-5 py-3 text-slate-700">{item.status}</td>
                  <td className="px-5 py-3 text-slate-700">
                    {new Date(item.performedAt).toLocaleString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-slate-500">
                  No activities yet. Your actions will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
