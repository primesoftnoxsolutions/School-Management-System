import { useEffect, useState } from "react";
import api from "../services/api/client";
import StatCard from "../components/dashboard/StatCard";
import { StatsColumnBoard } from "../components/dashboard/StatsColumnBoard";
import {
  IconAbsent,
  IconAttendance,
  IconClasses,
  IconClock,
  IconFee,
  IconLeave,
  IconPresent,
  IconStudents,
  IconTasks,
  IconTeachers,
} from "../components/icons/DashboardIcons";

function AttendanceChart({ percentage, trend = [] }) {
  const points = trend.length
    ? trend.map((item) => Number(item.value || 0))
    : percentage
      ? Array(10).fill(Number(percentage))
      : [];

  if (!points.length) {
    return (
      <div className="ref-card p-5">
        <h3 className="text-base font-semibold text-slate-800">Student Attendance</h3>
        <p className="mt-8 text-center text-sm text-slate-500">No attendance records available yet.</p>
      </div>
    );
  }

  const width = 560;
  const height = 180;
  const padding = 24;
  const max = 100;
  const min = 0;
  const step = (width - padding * 2) / (points.length - 1);

  const coords = points.map((value, index) => {
    const x = padding + index * step;
    const y = height - padding - ((value - min) / (max - min)) * (height - padding * 2);
    return `${x},${y}`;
  });

  const area = `${padding},${height - padding} ${coords.join(" ")} ${width - padding},${height - padding}`;
  const line = coords.join(" ");

  return (
    <div className="ref-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">Student Attendance</h3>
        <select className="ref-select text-sm">
          <option>This Month</option>
        </select>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full">
        <defs>
          <linearGradient id="attendanceFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = height - padding - ((tick - min) / (max - min)) * (height - padding * 2);
          return (
            <g key={tick}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text x="8" y={y + 4} fontSize="10" fill="#94a3b8">
                {tick}%
              </text>
            </g>
          );
        })}
        <polygon points={area} fill="url(#attendanceFill)" />
        <polyline points={line} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
        {coords.map((point, index) => {
          const [x, y] = point.split(",");
          return <circle key={point} cx={x} cy={y} r="4" fill="#3b82f6" />;
        })}
      </svg>
    </div>
  );
}

function FeeDonut({ collected, pending, overdue }) {
  const total = collected + pending + overdue || 1;
  const segments = [
    { label: "Collected", value: collected, color: "#3b82f6" },
    { label: "Pending", value: pending, color: "#f59e0b" },
    { label: "Overdue", value: overdue, color: "#ef4444" },
  ];

  let offset = 0;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="ref-card p-5">
      <h3 className="mb-4 text-base font-semibold text-slate-800">Fee Collections Status</h3>
      <div className="flex items-center gap-6">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="16" />
          {segments.map((segment) => {
            const dash = (segment.value / total) * circumference;
            const circle = (
              <circle
                key={segment.label}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth="16"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                transform="rotate(-90 70 70)"
              />
            );
            offset += dash;
            return circle;
          })}
        </svg>
        <div className="space-y-2 text-sm">
          {segments.map((segment) => (
            <div key={segment.label} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="text-slate-600">
                {segment.label}: Rs. {segment.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RoleDashboard({ role, onNavigate }) {
  const isSuperAdmin = role === "SUPER_ADMIN";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint = isSuperAdmin ? "/dashboard/super-admin" : "/dashboard/teacher";
        const response = await api.get(endpoint);
        setData(response.data?.data || {});
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isSuperAdmin]);

  if (loading) return <p className="text-sm text-slate-500">Loading dashboard...</p>;
  if (error) return <p className="text-sm text-rose-600">{error}</p>;

  if (!isSuperAdmin) {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Teacher Dashboard</h2>
          <p className="text-sm text-slate-500">Your classroom overview.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Assigned Classes" value={data.cards?.assignedClasses ?? 0} tone="blue" icon={IconClasses} />
          <StatCard title="Today's Attendance" value={data.cards?.todaysAttendance ?? 0} tone="green" icon={IconClock} />
          <StatCard title="Total Students" value={data.cards?.totalStudents ?? 0} tone="purple" icon={IconStudents} />
          <StatCard title="Pending Tasks" value={data.cards?.pendingTasks ?? 0} tone="orange" icon={IconTasks} />
        </div>
      </section>
    );
  }

  const cards = data.cards || {};
  const feeStatus = data.feeStatus || { collected: 0, pending: 0, overdue: 0 };
  const recentAdmissions = data.recentAdmissions || [];

  const teacherStats = [
    { label: "Total Teachers", value: cards.totalTeachers ?? 0, tone: "blue", icon: IconTeachers },
    { label: "Present Teachers", value: cards.presentTeachers ?? 0, tone: "green", icon: IconPresent },
    { label: "Absent Teachers", value: cards.absentTeachers ?? 0, tone: "rose", icon: IconAbsent },
  ];

  const studentStats = [
    { label: "Total Students", value: cards.totalStudents ?? 0, tone: "purple", icon: IconStudents },
    { label: "Present Students", value: cards.presentStudents ?? 0, tone: "green", icon: IconPresent },
    { label: "Absent Students", value: cards.absentStudents ?? 0, tone: "rose", icon: IconAbsent },
  ];

  const otherStats = [
    { label: "Pending Fees", value: `Rs. ${(cards.pendingFees ?? 0).toLocaleString()}`, tone: "orange", icon: IconFee },
    { label: "Attendance %", value: `${cards.attendancePercentage ?? 0}%`, tone: "sky", icon: IconAttendance },
    { label: "Total On Leave", value: cards.totalOnLeave ?? 0, tone: "amber", icon: IconLeave },
  ];

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <StatsColumnBoard
          title="Teacher Stats"
          subtitle="Attendance and presence overview"
          items={teacherStats}
        />
        <StatsColumnBoard
          title="Student Stats"
          subtitle="Enrollment and daily attendance snapshot"
          items={studentStats}
        />
        <StatsColumnBoard
          title="Other Stats"
          subtitle="Fee, leave and operational indicators"
          items={otherStats}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <AttendanceChart
            percentage={cards.attendancePercentage ?? 0}
            trend={data.charts?.attendanceTrend || []}
          />
        </div>
        <div className="ref-card p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-800">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: "Add Student", tone: "text-emerald-600", target: "Admissions" },
              { label: "Add Teacher", tone: "text-orange-600", target: "Teachers" },
              { label: "Create Class", tone: "text-emerald-600", target: "Admissions" },
              { label: "Generate Report", tone: "text-violet-600", target: "Reports" },
            ].map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => onNavigate?.(action.target)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className={action.tone}>{action.label}</span>
                <span className="text-slate-400">›</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <FeeDonut
          collected={feeStatus.collected}
          pending={feeStatus.pending}
          overdue={feeStatus.overdue}
        />

        <div className="ref-card overflow-hidden p-0">
          <h3 className="border-b border-slate-100 px-5 py-4 text-base font-semibold text-slate-800">
            Recent Admissions
          </h3>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Class</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentAdmissions.length ? (
                recentAdmissions.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-5 py-3 text-slate-700">{item.name}</td>
                    <td className="px-5 py-3 text-slate-700">{item.className}</td>
                    <td className="px-5 py-3 text-slate-700">
                      {item.date ? new Date(item.date).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-5 py-6 text-slate-500">
                    No admissions found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ref-card p-5">
          <h3 className="mb-4 text-base font-semibold text-slate-800">Upcoming Events</h3>
          <p className="text-sm text-slate-500">No events scheduled yet.</p>
          <button type="button" className="ref-btn-outline mt-5 w-full" disabled>
            View All
          </button>
        </div>
      </div>
    </section>
  );
}
