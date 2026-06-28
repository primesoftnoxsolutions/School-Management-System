import { useState } from "react";

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



export default function DashboardPage({ entering = false }) {

  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);

  const isTeacher = user?.role === "TEACHER";

  const [selected, setSelected] = useState(isTeacher ? "My Panel" : "Dashboard");

  const { isDark: isAppDark, toggleTheme } = useAppTheme();



  const renderTeacherContent = () => {

    switch (selected) {

      case "My Panel":

        return <TeacherPanelPage onNavigate={setSelected} dark={isAppDark} />;

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
        return <PaperResultCardManagementPage dark={isAppDark} />;

      case "Class Time Table":
        return <ClassTimeTablePage dark={isAppDark} />;

      case "Reports":

        return <TeacherReportsPage />;

      default:

        return <TeacherPanelPage onNavigate={setSelected} dark={isAppDark} />;

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

      </main>

    </div>

  );

}

