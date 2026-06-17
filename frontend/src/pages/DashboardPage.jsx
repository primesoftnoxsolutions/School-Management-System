import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../components/layout/Sidebar";
import AdmissionsPage from "./AdmissionsPage";
import { logout } from "../store/authSlice";
import RoleDashboard from "./RoleDashboard";
import ModuleDataPage from "./ModuleDataPage";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [selected, setSelected] = useState("Dashboard");

  const renderContent = () => {
    if (selected === "Dashboard") return <RoleDashboard role={user?.role} />;
    if (selected === "Admissions") return <AdmissionsPage role={user?.role} />;
    return <ModuleDataPage title={selected} />;
  };

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar
        selected={selected}
        onSelect={setSelected}
        onLogout={() => dispatch(logout())}
      />
      <main className="h-screen overflow-y-auto p-6 lg:ml-72 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
}
