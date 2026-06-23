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



const darkCard = "rounded-xl border border-white/[0.06] bg-[#161722]";

const lightCard = "rounded-xl border border-white/80 bg-white/90 shadow-[0_16px_38px_rgba(79,70,229,0.1)]";



function AttendanceChart({ percentage, trend = [], dark = false }) {

  const points = trend.length

    ? trend.map((item) => Number(item.value || 0))

    : percentage

      ? Array(10).fill(Number(percentage))

      : [];



  if (!points.length) {

    return (

      <div className={`relative min-h-[280px] overflow-hidden p-5 ${dark ? darkCard : lightCard}`}>

        <div className="mb-4 flex items-center gap-2.5">

          <span

            className={`flex h-9 w-9 items-center justify-center rounded-lg ${

              dark ? "bg-[#7c4dff]/15 text-[#7c4dff]" : "bg-indigo-50 text-indigo-600"

            }`}

          >

            <IconClock />

          </span>

          <h3 className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>Student Attendance</h3>

        </div>

        <div className="flex h-52 flex-col items-center justify-center text-center">

          <div

            className={`mb-4 flex h-24 w-24 items-center justify-center rounded-full ${

              dark ? "bg-[#7c4dff]/12 text-[#7c4dff]" : "bg-indigo-50 text-indigo-500 shadow-sm"

            }`}

          >

            <IconClock className="h-12 w-12" />

          </div>

          <p className={`text-sm font-normal ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>

            No attendance records available yet.

          </p>

        </div>

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

    <div className={`p-5 ${dark ? darkCard : lightCard}`}>

      <div className="mb-4 flex items-center justify-between">

        <h3 className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>Student Attendance</h3>

        <select className={`ref-select text-sm ${dark ? "bg-[#1a1b26] text-[#9e9e9e]" : ""}`}>

          <option>This Month</option>

        </select>

      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full">

        <defs>

          <linearGradient id="attendanceFill" x1="0" x2="0" y1="0" y2="1">

            <stop offset="0%" stopColor={dark ? "#7c4dff" : "#3b82f6"} stopOpacity="0.25" />

            <stop offset="100%" stopColor={dark ? "#7c4dff" : "#3b82f6"} stopOpacity="0.02" />

          </linearGradient>

        </defs>

        {[0, 25, 50, 75, 100].map((tick) => {

          const y = height - padding - ((tick - min) / (max - min)) * (height - padding * 2);

          return (

            <g key={tick}>

              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke={dark ? "rgba(255,255,255,0.06)" : "#e2e8f0"} strokeWidth="1" />

              <text x="8" y={y + 4} fontSize="10" fill={dark ? "#9e9e9e" : "#94a3b8"}>

                {tick}%

              </text>

            </g>

          );

        })}

        <polygon points={area} fill="url(#attendanceFill)" />

        <polyline points={line} fill="none" stroke={dark ? "#7c4dff" : "#3b82f6"} strokeWidth="3" strokeLinecap="round" />

        {coords.map((point) => {

          const [x, y] = point.split(",");

          return <circle key={point} cx={x} cy={y} r="4" fill={dark ? "#7c4dff" : "#3b82f6"} />;

        })}

      </svg>

    </div>

  );

}



function FeeDonut({ collected, pending, overdue, dark = false }) {

  const total = collected + pending + overdue || 1;

  const segments = dark

    ? [

        { label: "Collected", value: collected, color: "#ff9800" },

        { label: "Pending", value: pending, color: "#ffc107" },

        { label: "Overdue", value: overdue, color: "#e91e63" },

      ]

    : [

        { label: "Collected", value: collected, color: "#4f46e5" },

        { label: "Pending", value: pending, color: "#0f766e" },

        { label: "Overdue", value: overdue, color: "#f59e0b" },

      ];



  let offset = 0;

  const radius = 54;

  const circumference = 2 * Math.PI * radius;



  return (

    <div className={`p-5 ${dark ? darkCard : lightCard}`}>

      <h3 className={`mb-4 text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>Fee Collections Status</h3>

      <div className="flex items-center gap-6">

        <svg width="140" height="140" viewBox="0 0 140 140">

          <circle cx="70" cy="70" r={radius} fill="none" stroke={dark ? "rgba(255,255,255,0.06)" : "#e2e8f0"} strokeWidth="16" />

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

        <div className="space-y-2.5 text-sm">

          {segments.map((segment) => (

            <div key={segment.label} className="flex items-center gap-2.5">

              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />

              <span className={dark ? "font-normal text-[#9e9e9e]" : "text-slate-600"}>

                {segment.label}: Rs. {segment.value.toLocaleString()}

              </span>

            </div>

          ))}

        </div>

      </div>

    </div>

  );

}



const quickActions = [

  { label: "Add Student", color: "#4caf50", target: "Admissions" },

  { label: "Add Teacher", color: "#ff9800", target: "Teachers" },

  { label: "Create Class", color: "#7c4dff", target: "Admissions" },

  { label: "Generate Report", color: "#e91e63", target: "Reports" },

];



export default function RoleDashboard({ role, onNavigate, dark = false }) {

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



  if (loading) return <p className={`text-sm ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Loading dashboard...</p>;

  if (error) return <p className="text-sm text-rose-500">{error}</p>;



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

    { label: "Total Teachers", value: cards.totalTeachers ?? 0, tone: "purple", icon: IconTeachers },

    { label: "Present Teachers", value: cards.presentTeachers ?? 0, tone: "green", icon: IconPresent },

    { label: "Absent Teachers", value: cards.absentTeachers ?? 0, tone: "rose", icon: IconAbsent },

  ];



  const studentStats = [

    { label: "Total Students", value: cards.totalStudents ?? 0, tone: "green", icon: IconStudents },

    { label: "Present Students", value: cards.presentStudents ?? 0, tone: "green", icon: IconPresent },

    { label: "Absent Students", value: cards.absentStudents ?? 0, tone: "rose", icon: IconAbsent },

  ];



  const otherStats = [

    { label: "Pending Fees", value: `Rs. ${(cards.pendingFees ?? 0).toLocaleString()}`, tone: "orange", icon: IconFee },

    { label: "Attendance %", value: `${cards.attendancePercentage ?? 0}%`, tone: "purple", icon: IconAttendance },

    { label: "Total On Leave", value: cards.totalOnLeave ?? 0, tone: "orange", icon: IconLeave },

  ];



  return (

    <section className="space-y-5">

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        <StatsColumnBoard title="Teacher Stats" items={teacherStats} dark={dark} />

        <StatsColumnBoard title="Student Stats" items={studentStats} dark={dark} />

        <StatsColumnBoard title="Other Stats" items={otherStats} dark={dark} />

      </div>



      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        <div className="xl:col-span-2">

          <AttendanceChart

            percentage={cards.attendancePercentage ?? 0}

            trend={data.charts?.attendanceTrend || []}

            dark={dark}

          />

        </div>

        <div className={`p-5 ${dark ? darkCard : lightCard}`}>

          <h3 className={`mb-4 text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>Quick Actions</h3>

          <div className="space-y-2.5">

            {quickActions.map((action) => (

              <button

                key={action.label}

                type="button"

                onClick={() => onNavigate?.(action.target)}

                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition hover:-translate-y-0.5 ${

                  dark

                    ? "border-white/[0.06] bg-[#1a1b26] hover:border-white/[0.1]"

                    : "border-slate-100 bg-white text-slate-700 shadow-sm hover:shadow-md"

                }`}

              >

                <span style={{ color: action.color }}>{action.label}</span>

                <span className={dark ? "text-[#9e9e9e]" : "text-slate-400"}>›</span>

              </button>

            ))}

          </div>

        </div>

      </div>



      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        <FeeDonut collected={feeStatus.collected} pending={feeStatus.pending} overdue={feeStatus.overdue} dark={dark} />



        <div className={`overflow-hidden ${dark ? darkCard : lightCard}`}>

          <h3 className={`border-b px-5 py-4 text-sm font-semibold ${dark ? "border-white/[0.06] text-white" : "border-slate-100 text-slate-800"}`}>

            Recent Admissions

          </h3>

          <table className="min-w-full text-sm">

            <thead className={dark ? "bg-[#1a1b26] text-left text-[#9e9e9e]" : "bg-blue-50 text-left text-blue-900/70"}>

              <tr>

                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider">Name</th>

                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider">Class</th>

                <th className="px-5 py-3 text-xs font-medium uppercase tracking-wider">Date</th>

              </tr>

            </thead>

            <tbody>

              {recentAdmissions.length ? (

                recentAdmissions.map((item) => (

                  <tr key={item.id} className={dark ? "border-t border-white/[0.06]" : "border-t border-slate-100"}>

                    <td className={`px-5 py-3 font-normal ${dark ? "text-white" : "text-slate-700"}`}>{item.name}</td>

                    <td className={`px-5 py-3 font-normal ${dark ? "text-[#9e9e9e]" : "text-slate-700"}`}>{item.className}</td>

                    <td className={`px-5 py-3 font-normal ${dark ? "text-[#9e9e9e]" : "text-slate-700"}`}>

                      {item.date ? new Date(item.date).toLocaleDateString() : "-"}

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td colSpan={3} className={`px-5 py-8 text-center font-normal ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>

                    No admissions found yet.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>



        <div className={`p-5 ${dark ? darkCard : lightCard}`}>

          <h3 className={`mb-4 text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>Upcoming Events</h3>

          <div className="flex min-h-28 items-center justify-center text-center">

            <p className={`text-sm font-normal ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>No events scheduled yet.</p>

          </div>

          <button

            type="button"

            className={`mt-5 w-full rounded-xl border px-4 py-2.5 text-sm font-medium transition ${

              dark

                ? "border-white/[0.06] bg-[#1a1b26] text-[#7c4dff] hover:bg-white/[0.04]"

                : "border-indigo-100 bg-white text-indigo-600"

            }`}

            disabled

          >

            View All

          </button>

        </div>

      </div>

    </section>

  );

}

