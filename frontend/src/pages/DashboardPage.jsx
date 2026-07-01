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
import FinanceManagerDashboardPage from "./FinanceManagerDashboardPage";
import PurchaseManagementPage from "./PurchaseManagementPage";

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
import StudentPortalPage from "./StudentPortalPage";
import StudentAttendancePage from "./StudentAttendancePage";
import StudentSubpagePlaceholder from "./StudentSubpagePlaceholder";

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



export default function DashboardPage({ entering = false, branchSection = "Boys", onBranchChange }) {

  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  const isStudent = user?.role === "STUDENT";
  const isTeacher = user?.role === "TEACHER";
  const isAccountant = user?.role === "ACCOUNTANT";

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

  if (isStudent) {
    return (
      <div className={`dashboard-shell min-h-screen ${isAppDark ? "dashboard-dark bg-[#0b0c15]" : "bg-[#f1efff] [font-family:'Inter','Segoe_UI',Arial,sans-serif]"}`}>
        <div className="mx-auto max-w-7xl p-4 sm:p-6">
          <StudentPortalPage user={user} dark={isAppDark} />
        </div>
      </div>
    );
  }



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



  const renderAdminContent = (currentBranch = branchSection) => {
    if (user?.role === "ACCOUNTANT") {
      if (selected === "Dashboard") return <FinanceManagerDashboardPage onNavigate={setSelected} />;
      if (selected === "Purchase Management") return <PurchaseManagementPage />;
      if (selected === "Fees Management" || selected === "Finance Management" || selected === "Fee Management") {
        return (
          <FeeManagementPage
            role={user?.role}
            title="Fees Management"
            subtitle="Receive fees and review fee collection activity."
          />
        );
      }
      if (selected === "Fine Management") return <FineManagementPage role={user?.role} />;
      if (selected === "Refund Management" || selected === "Fee Refund") return <FeeRefundPage role={user?.role} />;
      if (selected === "Reports") return <ReportsPage financeOnly />;
      return <FinanceManagerDashboardPage onNavigate={setSelected} />;
    }

    if (selected === "Dashboard") {

      return <RoleDashboard role={user?.role} onNavigate={setSelected} dark={isAppDark} branchSection={currentBranch} />;

    }

    if (selected === "Teachers") {
      return (
        <TeachersManagementPage
          dark={isAppDark}
          onToggleTheme={toggleTheme}
          branchSection={currentBranch}
        />
      );
    }

    if (selected === "Admissions" || selected === "Student Admissions") return <AdmissionsPage role={user?.role} />;

    if (selected === "Students") {
      return <StudentsPage role={user?.role} dark={isAppDark} onToggleTheme={toggleTheme} />;
    }

    if (selected === "Student Attendance") return <StudentAttendancePage dark={isAppDark} onToggleTheme={toggleTheme} />;

    if (selected === "Student Time Table")
      return (
        <StudentSubpagePlaceholder
          title="Time Table"
          subtitle="Class schedules and daily subject periods for students."
          dark={isAppDark}
          points={["View today's timetable", "Class-wise subject periods", "Quick schedule reference"]}
        />
      );

    if (selected === "Student Roll Slips")
      return (
        <StudentSubpagePlaceholder
          title="Roll Slips"
          subtitle="Download and manage roll slip details for exams."
          dark={isAppDark}
          points={["Exam roll slip format", "Student identity details", "Printable access"]}
        />
      );

    if (selected === "Student Date Sheet")
      return (
        <StudentSubpagePlaceholder
          title="Date Sheet"
          subtitle="Upcoming examination dates and paper schedule."
          dark={isAppDark}
          points={["Subject-wise exam dates", "Session schedule", "Printable date sheet"]}
        />
      );

    if (selected === "Student Result Cards")
      return (
        <StudentSubpagePlaceholder
          title="Result Cards"
          subtitle="Academic results and report card access for students."
          dark={isAppDark}
          points={["Term result cards", "Marks summary", "Downloadable reports"]}
        />
      );

    if (selected === "Fee Management") return <FeeManagementPage role={user?.role} />;

    if (selected === "Finance Management")
      return (
        <FeeManagementPage
          role={user?.role}
          title="Finance Management"
          subtitle="Finance operations and fee collection overview."
        />
      );

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
            branchSection={branchSection}
            onBranchChange={onBranchChange}
            onToggleTheme={toggleTheme}

          />

        )}

        </div>

        <div className={`px-5 pb-8 lg:px-6 ${entering ? "app-content-enter" : ""}`}>

          {isTeacher ? renderTeacherContent() : renderAdminContent(branchSection)}

        </div>

        {isTeacher ? <TeacherDailyAttendancePopup user={user} dark={isAppDark} /> : null}

      </main>

    </div>

  );

}

