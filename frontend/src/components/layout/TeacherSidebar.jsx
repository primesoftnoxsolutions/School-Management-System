import { useState } from "react";
import { IconLogout, teacherNavIconMap } from "../icons/NavIcons";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function TeacherSidebar({ selected, onSelect, onLogout }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navItems = ["My Panel", "Mark Attendance", "My Classes", "Academic Records", "Reports"];

  return (
    <>
      <aside className="ref-sidebar fixed inset-y-0 left-0 hidden w-64 flex-col lg:flex">
        <div className="border-b border-slate-200 px-4 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-500">
            Naseer Ideal
          </p>
          <h2 className="mt-1 text-lg font-bold leading-tight text-slate-800">
            Public <span className="text-blue-600">School</span>
          </h2>
          <p className="mt-1 text-[11px] text-slate-500">Teacher Portal</p>
        </div>

        <nav className="scrollbar-sidebar flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const active = selected === item;
            const Icon = teacherNavIconMap[item];
            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelect(item)}
                className={`ref-nav-item ${active ? "ref-nav-item-active" : ""}`}
              >
                <span className="ref-nav-icon">{Icon ? <Icon /> : null}</span>
                <span>{item}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="ref-nav-item w-full text-rose-600"
          >
            <span className="ref-nav-icon">
              <IconLogout />
            </span>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      <LogoutConfirmModal
        open={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          onLogout();
        }}
      />
    </>
  );
}
