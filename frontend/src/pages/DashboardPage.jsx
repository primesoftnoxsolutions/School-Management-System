import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { useAppTheme } from "../hooks/useAppTheme";

import Sidebar from "../components/layout/Sidebar";

import TeacherSidebar from "../components/layout/TeacherSidebar";

import TopHeader from "../components/layout/TopHeader";

import TeacherTopHeader from "../components/layout/TeacherTopHeader";

import AdmissionsPage from "./AdmissionsPage";

import StudentsPage from "./StudentsPage";

import FeeManagementPage from "./FeeManagementPage";

import FeeRefundPage from "./FeeRefundPage";

import FineManagementPage from "./FineManagementPage";

import PayrollPage from "./PayrollPage";

import ReportsPage from "./ReportsPage";

import TimeAttendancePage from "./TimeAttendancePage";

import { logout } from "../store/authSlice";

import RoleDashboard from "./RoleDashboard";

import ModuleDataPage from "./ModuleDataPage";

import StudentPortfoliosPage from "./StudentPortfoliosPage";

import SchoolLeavingPage from "./SchoolLeavingPage";

import TeachersManagementPage from "./TeachersManagementPage";

import TeacherPanelPage from "./TeacherPanelPage";

import TeacherClassesPage from "./teacher/TeacherClassesPage";

import TeacherAttendancePage from "./teacher/TeacherAttendancePage";

import TeacherAcademicRecordsPage from "./teacher/TeacherAcademicRecordsPage";

import TeacherReportsPage from "./teacher/TeacherReportsPage";
import MonthlySyllabusPage from "./teacher/MonthlySyllabusPage";
import AssignedDutiesPage from "./teacher/AssignedDutiesPage";
import RollNoSlipsManagementPage from "./teacher/RollNoSlipsManagementPage";
import PaperResultCardManagementPage from "./teacher/PaperResultCardManagementPage";
import ClassTimeTablePage from "./teacher/ClassTimeTablePage";

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getTeacherDailyStatusKey = (user, dateKey = getLocalDateKey()) =>
  `teacher-daily-status:${user?._id || user?.id || user?.fullName || "teacher"}:${dateKey}`;

const attendanceOptions = [
  {
    value: "PRESENT",
    label: "Present",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    dot: "bg-emerald-500",
  },
  {
    value: "ABSENT",
    label: "Absent",
    className: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
    dot: "bg-rose-500",
  },
  {
    value: "LEAVE",
    label: "Leave",
    className: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    dot: "bg-amber-500",
  },
];

function TeacherDailyAttendancePopup({ user, dark = false }) {
  const [status, setStatus] = useState("");
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const syncDailyStatus = () => {
      const now = new Date();
      const dateKey = getLocalDateKey(now);
      const key = getTeacherDailyStatusKey(user, dateKey);
      const savedStatus = localStorage.getItem(key) || "";
      const hour = now.getHours();

      if (!savedStatus && hour >= 12) {
        localStorage.setItem(key, "ABSENT");
        setStatus("ABSENT");
        setShouldShow(false);
        return;
      }

      setStatus(savedStatus);
      setShouldShow(!savedStatus && hour >= 8 && hour < 12);
    };

    syncDailyStatus();
    const intervalId = window.setInterval(syncDailyStatus, 30000);
    return () => window.clearInterval(intervalId);
  }, [user]);

  const markStatus = (nextStatus) => {
    const key = getTeacherDailyStatusKey(user);
    localStorage.setItem(key, nextStatus);
    setStatus(nextStatus);
    setShouldShow(false);
  };

  if (!shouldShow || status) return null;

  return (
    <div className="pointer-events-none fixed right-5 top-24 z-[70] w-[min(92vw,410px)] lg:right-8">
      <div
        className={`pointer-events-auto overflow-hidden rounded-3xl border shadow-2xl ${
          dark
            ? "border-white/10 bg-[#161722] text-white shadow-black/40"
            : "border-blue-100 bg-white text-slate-900 shadow-blue-950/15"
        }`}
      >
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-100">Daily Attendance</p>
              <h3 className="mt-1 text-lg font-black">Good Morning, {user?.fullName || "Teacher"}</h3>
            </div>
            <div className="rounded-2xl bg-white/15 px-3 py-2 text-center backdrop-blur">
              <p className="text-[10px] font-bold uppercase text-blue-100">Until</p>
              <p className="text-sm font-black">12:00 PM</p>
            </div>
          </div>
        </div>

        <div className={`p-5 ${dark ? "bg-[#161722]" : "bg-white"}`}>
          <div className="grid gap-2 sm:grid-cols-3">
            {attendanceOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => markStatus(option.value)}
                className={`rounded-2xl border px-3 py-5 text-center transition ${option.className}`}
              >
                <span className="flex items-center justify-center gap-2 text-sm font-black">
                  <span className={`h-2.5 w-2.5 rounded-full ${option.dot}`} />
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



export default function DashboardPage({ entering = false }) {

  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  const isTeacher = user?.role === "TEACHER";

  const [selected, setSelected] = useState(isTeacher ? "My Panel" : "Dashboard");
  const [teacherAcademicIntent, setTeacherAcademicIntent] = useState(null);

  const { isDark: isAppDark, toggleTheme } = useAppTheme();

  const handleTeacherNavigate = (target) => {
    if (typeof target === "object" && target?.page) {
      setTeacherAcademicIntent(target.intent ? { ...target.intent, stamp: Date.now() } : null);
      setSelected(target.page);
      return;
    }

    setTeacherAcademicIntent(null);
    setSelected(target);
  };



  const renderTeacherContent = () => {

    switch (selected) {

      case "My Panel":

        return <TeacherPanelPage onNavigate={handleTeacherNavigate} dark={isAppDark} />;

      case "Mark Attendance":

        return <TeacherAttendancePage />;

      case "My Classes":

        return <TeacherClassesPage />;

      case "Academic Records":

        return <TeacherAcademicRecordsPage />;

      case "Monthly Syllabus":
        return <MonthlySyllabusPage dark={isAppDark} />;

      case "Assigned Duties":
        return <AssignedDutiesPage dark={isAppDark} />;

      case "Roll No Slips Management":
        return <RollNoSlipsManagementPage dark={isAppDark} />;

      case "Paper, Date Sheet & Result":
        return <PaperResultCardManagementPage dark={isAppDark} navigationIntent={teacherAcademicIntent} />;

      case "Class Time Table":
        return <ClassTimeTablePage dark={isAppDark} />;

      case "Reports":

        return <TeacherReportsPage />;

      default:

        return <TeacherPanelPage onNavigate={handleTeacherNavigate} dark={isAppDark} />;

    }

  };



  const renderAdminContent = () => {

    if (selected === "Dashboard") {

      return <RoleDashboard role={user?.role} onNavigate={setSelected} dark={isAppDark} />;

    }

    if (selected === "Teachers") {
      return (
        <TeachersManagementPage
          dark={isAppDark}
          onToggleTheme={toggleTheme}
        />
      );
    }

    if (selected === "Admissions") return <AdmissionsPage role={user?.role} />;

    if (selected === "Students") {
      return <StudentsPage role={user?.role} dark={isAppDark} onToggleTheme={toggleTheme} />;
    }

    if (selected === "Fee Management") return <FeeManagementPage role={user?.role} />;

    if (selected === "Fee Refund") return <FeeRefundPage role={user?.role} />;

    if (selected === "Fine Management") return <FineManagementPage role={user?.role} />;

    if (selected === "Payroll") return <PayrollPage role={user?.role} />;

    if (selected === "Reports") return <ReportsPage />;

    if (selected === "Time & Attendance") return <TimeAttendancePage />;

    if (selected === "Students Portfolios") return <StudentPortfoliosPage />;

    if (selected === "School Leaving") return <SchoolLeavingPage role={user?.role} />;

    return <ModuleDataPage title={selected} />;

  };



  return (

    <div

      className={`dashboard-shell h-screen overflow-hidden ${

        isAppDark ? "dashboard-dark bg-[#0b0c15]" : "bg-[#f1efff] [font-family:'Inter','Segoe_UI',Arial,sans-serif]"

      }`}

    >

      {isTeacher ? (

        <TeacherSidebar

          selected={selected}

          onSelect={setSelected}

          onLogout={() => dispatch(logout())}

          user={user}

          dark={isAppDark}

          entering={entering}

        />

      ) : (

        <Sidebar

          role={user?.role}

          selected={selected}

          onSelect={setSelected}

          onLogout={() => dispatch(logout())}

          dark={isAppDark}

          entering={entering}

        />

      )}

      <main

        className={`dashboard-shell scrollbar-app h-screen overflow-y-auto lg:ml-72 ${

          isAppDark
            ? "dashboard-dark bg-[#0b0c15]"
            : "bg-[radial-gradient(circle_at_30%_5%,#ffffff_0,#f7f4ff_36%,#eeeaff_100%)]"

        } ${entering ? "app-main-enter" : ""}`}

      >

        <div className={entering ? "app-header-enter" : ""}>

        {isTeacher ? (

          <TeacherTopHeader

            user={user}

            dark={isAppDark}

            onToggleTheme={toggleTheme}

          />

        ) : (

          <TopHeader

            user={user}

            dark={isAppDark}
            onToggleTheme={toggleTheme}

          />

        )}

        </div>

        <div className={`px-5 pb-8 lg:px-6 ${entering ? "app-content-enter" : ""}`}>

          {isTeacher ? renderTeacherContent() : renderAdminContent()}

        </div>

        {isTeacher ? <TeacherDailyAttendancePopup user={user} dark={isAppDark} /> : null}

      </main>

    </div>

  );

}

