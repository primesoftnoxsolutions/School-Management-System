import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";

import { useAppTheme } from "../hooks/useAppTheme";

import Sidebar from "../components/layout/Sidebar";
import TeacherSidebar from "../components/layout/TeacherSidebar";
import TopHeader from "../components/layout/TopHeader";
import TeacherTopHeader from "../components/layout/TeacherTopHeader";

import StudentsPage from "./StudentsPage";
import AdmissionsPage from "./AdmissionsPage";
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
import TeacherSyllabusPage from "./teacher/TeacherSyllabusPage";
import TeacherDutiesPage from "./teacher/TeacherDutiesPage";
import TeacherTimeTablePage from "./teacher/TeacherTimeTablePage";
import TeacherStatementsPage from "./teacher/TeacherStatementsPage";
import TeacherAcademicRecordsPage from "./teacher/TeacherAcademicRecordsPage";
import TeacherReportsPage from "./teacher/TeacherReportsPage";
import StudentPortalPage from "./StudentPortalPage";
import StudentAttendancePage from "./StudentAttendancePage";
import StudentSubpagePlaceholder from "./StudentSubpagePlaceholder";

export default function DashboardPage({ entering = false, branchSection = "Boys", onBranchChange }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isStudent = user?.role === "STUDENT";
  const isTeacher = user?.role === "TEACHER";
  const isAccountant = user?.role === "ACCOUNTANT";
  const [selected, setSelected] = useState(isTeacher ? "Teacher Page" : isAccountant ? "Finance Management" : "Dashboard");
  const [teacherAssignmentsRefreshKey, setTeacherAssignmentsRefreshKey] = useState(0);
  const { isDark: isAppDark, toggleTheme } = useAppTheme();
  const refreshTeacherAssignments = () => setTeacherAssignmentsRefreshKey((key) => key + 1);

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
      case "Teacher Page":
        return <TeacherPanelPage onNavigate={setSelected} dark={isAppDark} />;
      case "Assigned Classes & Sections":
        return <TeacherClassesPage refreshKey={teacherAssignmentsRefreshKey} />;
      case "Attendance":
      case "Mark Attendance":
        return <TeacherAttendancePage dark={isAppDark} />;
      case "Syllabus":
        return <TeacherSyllabusPage dark={isAppDark} />;
      case "Duties":
        return <TeacherDutiesPage dark={isAppDark} />;
      case "Time Table":
        return <TeacherTimeTablePage dark={isAppDark} />;
      case "Statements":
        return <TeacherStatementsPage dark={isAppDark} />;
      case "Academic":
      case "Academic Records":
        return <TeacherAcademicRecordsPage dark={isAppDark} />;
      case "Reports":
        return <TeacherReportsPage dark={isAppDark} />;
      default:
        return <TeacherPanelPage onNavigate={setSelected} dark={isAppDark} />;
    }
  };

  const renderAdminContent = (currentBranch = branchSection) => {
    if (user?.role === "ACCOUNTANT") {
      return (
        <FeeManagementPage
          role={user?.role}
          title="Finance Management"
          subtitle="Finance operations and fee collection overview."
        />
      );
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
          onAssignmentsUpdated={refreshTeacherAssignments}
        />
      );
    }

    if (selected === "Assigned Classes & Sections") {
      return <TeacherClassesPage dark={isAppDark} refreshKey={teacherAssignmentsRefreshKey} />;
    }

    if (selected === "Attendance" || selected === "Mark Attendance")
      return <TeacherAttendancePage dark={isAppDark} onToggleTheme={toggleTheme} branchSection={currentBranch} />;
    if (selected === "Syllabus") return <TeacherSyllabusPage dark={isAppDark} />;
    if (selected === "Duties") return <TeacherDutiesPage dark={isAppDark} />;
    if (selected === "Time Table") return <TeacherTimeTablePage dark={isAppDark} />;
    if (selected === "Statements") return <TeacherStatementsPage dark={isAppDark} />;
    if (selected === "Academic" || selected === "Academic Records") return <TeacherAcademicRecordsPage dark={isAppDark} />;

    if (selected === "Students") return <StudentsPage role={user?.role} dark={isAppDark} onToggleTheme={toggleTheme} />;
    if (selected === "Student Admissions") return <AdmissionsPage role={user?.role} />;
    if (selected === "Student Attendance") return <StudentAttendancePage dark={isAppDark} onToggleTheme={toggleTheme} />;
    if (selected === "Student Time Table")
      return (
        <StudentSubpagePlaceholder
          title="Time Table"
          subtitle="Class schedules and daily subject periods for students."
          dark={isAppDark}
          points={["View today’s timetable", "Class-wise subject periods", "Quick schedule reference"]}
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
            <TeacherTopHeader user={user} dark={isAppDark} onToggleTheme={toggleTheme} />
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
      </main>
    </div>
  );
}
