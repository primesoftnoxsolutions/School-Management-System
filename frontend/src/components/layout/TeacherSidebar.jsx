import { useState } from "react";
import { IconLogout, teacherNavIconMap } from "../icons/NavIcons";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function TeacherSidebar({ selected, onSelect, onLogout, dark = true, entering = false }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navItems = ["My Panel", "Mark Attendance", "My Classes", "Academic Records", "Reports"];

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 hidden w-72 flex-col overflow-hidden text-white lg:flex [font-family:'Inter','Segoe_UI',Arial,sans-serif] ${
          dark
            ? "border-r border-white/[0.06] bg-[#0b0c15]"
            : "border-r border-slate-200 bg-white shadow-[0_0_24px_rgba(15,23,42,0.04)]"
        } ${entering ? "app-sidebar-enter" : ""}`}
      >
        <div className={`border-b px-5 py-6 ${dark ? "border-white/[0.06]" : "border-slate-200"}`}>
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                dark ? "bg-[#161722]" : "bg-blue-50"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-semibold text-white ${
                  dark ? "bg-[#7c4dff]" : "bg-blue-600"
                }`}
              >
                NI
              </div>
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-[0.16em] ${dark ? "text-[#9e9e9e]" : "text-blue-500"}`}>
                Naseer Ideal
              </p>
              <h2 className={`mt-1 text-xl font-semibold leading-tight ${dark ? "text-white" : "text-slate-800"}`}>
                Public <span className={dark ? "text-[#7c4dff]" : "text-blue-600"}>School</span>
              </h2>
              <p className={`mt-1 text-[11px] ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Teacher Portal</p>
            </div>
          </div>
        </div>

        <nav className="scrollbar-sidebar flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
          {navItems.map((item) => {
            const active = selected === item;
            const Icon = teacherNavIconMap[item];
            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelect(item)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                  active
                    ? dark
                      ? "bg-[#7c4dff] text-white"
                      : "bg-blue-600 text-white shadow-md"
                    : dark
                      ? "text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    active ? "bg-white/15" : dark ? "" : "bg-slate-100"
                  }`}
                >
                  {Icon ? <Icon className="h-5 w-5" /> : null}
                </span>
                <span>{item}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
              dark
                ? "text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                : "text-rose-600 hover:bg-rose-50"
            }`}
          >
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${dark ? "" : "bg-rose-50"}`}>
              <IconLogout className="h-5 w-5" />
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
