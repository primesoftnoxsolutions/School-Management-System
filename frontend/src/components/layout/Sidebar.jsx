import { useState } from "react";
import { IconLogout, navIconMap } from "../icons/NavIcons";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function Sidebar({ selected, onSelect, onLogout, role, dark = true, entering = false }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const adminNavItems = [
    "Dashboard",
    "Teachers",
    "Students",
    "Admissions",
    "Fee Management",
    "Fee Refund",
    "Fine Management",
    "Students Portfolios",
    "School Leaving",
    "Time & Attendance",
    "Payroll",
    "Reports",
  ];

  const navItems =
    role === "ACCOUNTANT" ? adminNavItems.filter((item) => item !== "Teachers") : adminNavItems;

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 hidden w-72 flex-col overflow-hidden text-white lg:flex [font-family:'Inter','Segoe_UI',Arial,sans-serif] ${
          dark
            ? "border-r border-white/[0.06] bg-[#0b0c15]"
            : "bg-gradient-to-b from-[#171052] via-[#17114c] to-[#10133a] shadow-[18px_0_50px_rgba(30,27,75,0.2)]"
        } ${entering ? "app-sidebar-enter" : ""}`}
      >
        {!dark ? (
          <div className="pointer-events-none absolute -bottom-8 right-0 h-44 w-44 bg-[radial-gradient(circle,rgba(255,255,255,0.16)_1.5px,transparent_1.5px)] [background-size:14px_14px] opacity-50" />
        ) : null}

        <div className={`border-b px-5 py-6 ${dark ? "border-white/[0.06]" : "border-white/10"}`}>
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                dark ? "bg-[#161722]" : "bg-white shadow-xl"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-semibold text-white ${
                  dark ? "bg-[#7c4dff]" : "bg-[#211867]"
                }`}
              >
                NI
              </div>
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-[0.16em] ${dark ? "text-[#9e9e9e]" : "text-white/75"}`}>
                Naseer Ideal
              </p>
              <h2 className="mt-1 text-xl font-semibold leading-tight text-white">Public School</h2>
              <p className={`mt-1 text-[11px] ${dark ? "text-[#9e9e9e]" : "text-white/55"}`}>School Management System</p>
            </div>
          </div>
        </div>

        <nav className="scrollbar-sidebar relative z-10 flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
          {navItems.map((item) => {
            const active = selected === item;
            const Icon = navIconMap[item];
            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelect(item)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                  active
                    ? dark
                      ? "bg-[#7c4dff] text-white"
                      : "bg-gradient-to-r from-[#6f58ff] to-[#4b36d2] text-white shadow-[0_14px_28px_rgba(91,70,220,0.42)]"
                    : dark
                      ? "text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                      : "text-white/78 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    active ? "bg-white/15" : dark ? "" : "bg-white/8"
                  }`}
                >
                  {Icon ? <Icon className="h-5 w-5" /> : null}
                </span>
                <span>{item}</span>
              </button>
            );
          })}
        </nav>

        <div className="relative z-10 p-4">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
              dark
                ? "text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                : "bg-white/10 text-white/85 hover:bg-white/15 hover:text-white"
            }`}
          >
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${dark ? "" : "bg-white/10"}`}>
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
