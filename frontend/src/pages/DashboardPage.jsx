import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { logoutUser } from "../store/authSlice";
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

export default function DashboardPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isTeacher = user?.role === "TEACHER";
  const [selected, setSelected] = useState(isTeacher ? "My Panel" : "Dashboard");

  const renderTeacherContent = () => {
    switch (selected) {
      case "My Panel":
        return <TeacherPanelPage onNavigate={setSelected} />;
      case "Mark Attendance":
        return <TeacherAttendancePage />;
      case "My Classes":
        return <TeacherClassesPage />;
      case "Academic Records":
        return <TeacherAcademicRecordsPage />;
      case "Reports":
        return <TeacherReportsPage />;
      default:
        return <TeacherPanelPage onNavigate={setSelected} />;
    }
  };

  const renderAdminContent = () => {
    if (selected === "Dashboard") {
      return <RoleDashboard role={user?.role} onNavigate={setSelected} />;
    }
    if (selected === "Teachers") return <TeachersManagementPage />;
    if (selected === "Admissions") return <AdmissionsPage role={user?.role} />;
    if (selected === "Students") return <StudentsPage role={user?.role} />;
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
    <div className="ref-app h-screen overflow-hidden">
      {isTeacher ? (
        <TeacherSidebar
          selected={selected}
          onSelect={setSelected}
          onLogout={() => dispatch(logoutUser())}
        />
      ) : (
        <Sidebar
          role={user?.role}
          selected={selected}
          onSelect={setSelected}
          onLogout={() => dispatch(logoutUser())}
        />
      )}
      <main className="ref-main scrollbar-hide h-screen overflow-y-auto lg:ml-64">
        {isTeacher ? <TeacherTopHeader user={user} /> : <TopHeader user={user} />}
        <div className="px-6 pb-8 lg:px-8">
          {isTeacher ? renderTeacherContent() : renderAdminContent()}
        </div>
      </main>
    </div>
  );
}
