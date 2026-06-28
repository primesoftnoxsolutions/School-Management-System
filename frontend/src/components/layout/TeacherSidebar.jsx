import { useEffect, useState } from "react";
import { IconLogout, teacherNavIconMap } from "../icons/NavIcons";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function TeacherSidebar({ selected, onSelect, onLogout, dark = true, entering = false }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [academicOpen, setAcademicOpen] = useState(false);
  const [myClassesOpen, setMyClassesOpen] = useState(false);
  const AcademicIcon = teacherNavIconMap["Academic Records"];
  const MyClassesIcon = teacherNavIconMap["My Classes"];
  const academicItems = [
    "Academic Records",
    "Roll No Slips Management",
    "Paper, Date Sheet & Result",
  ];
  const myClassesItems = ["My Classes", "Class Time Table", "Monthly Syllabus", "Assigned Duties"];
  const navItems = ["My Panel", "Mark Attendance", "Reports"];

  useEffect(() => {
    if (academicItems.includes(selected)) {
      setAcademicOpen(true);
    }
    if (myClassesItems.includes(selected)) {
      setMyClassesOpen(true);
    }
  }, [selected]);

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

          <div className="space-y-1.5">
            <div className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => onSelect("My Classes")}
                className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                  myClassesItems.includes(selected)
                    ? dark
                      ? "bg-[#7c4dff] text-white"
                      : "bg-gradient-to-r from-[#6f58ff] to-[#4b36d2] text-white shadow-[0_14px_28px_rgba(91,70,220,0.42)]"
                    : dark
                      ? "text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    myClassesItems.includes(selected) ? "bg-white/15" : dark ? "" : "bg-slate-100"
                  }`}
                >
                  {MyClassesIcon ? <MyClassesIcon className="h-5 w-5" /> : null}
                </span>
                <span className="min-w-0 flex-1 truncate">My Classes</span>
              </button>
              <button
                type="button"
                onClick={() => setMyClassesOpen((value) => !value)}
                className={`flex h-auto items-center justify-center rounded-xl px-3 transition ${
                  myClassesItems.includes(selected)
                    ? dark
                      ? "bg-[#7c4dff] text-white"
                      : "bg-gradient-to-r from-[#6f58ff] to-[#4b36d2] text-white"
                    : dark
                      ? "text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                aria-label="Toggle My Classes menu"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 transition-transform ${myClassesOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {myClassesOpen ? (
              <div className="ml-3 space-y-1 border-l border-white/10 pl-3">
                {["Class Time Table", "Monthly Syllabus", "Assigned Duties"].map((item) => {
                  const active = selected === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onSelect(item)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                        active
                          ? dark
                            ? "bg-white/[0.08] text-white"
                            : "bg-blue-50 text-blue-700"
                          : dark
                            ? "text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-current" : "bg-current opacity-50"}`} />
                      <span className="truncate">{item}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => onSelect("Academic Records")}
                className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                  academicItems.includes(selected)
                    ? dark
                      ? "bg-[#7c4dff] text-white"
                      : "bg-gradient-to-r from-[#6f58ff] to-[#4b36d2] text-white shadow-[0_14px_28px_rgba(91,70,220,0.42)]"
                    : dark
                      ? "text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    academicItems.includes(selected) ? "bg-white/15" : dark ? "" : "bg-slate-100"
                  }`}
                >
                  {AcademicIcon ? <AcademicIcon className="h-5 w-5" /> : null}
                </span>
                <span className="min-w-0 flex-1 truncate">Academic Records</span>
              </button>
              <button
                type="button"
                onClick={() => setAcademicOpen((value) => !value)}
                className={`flex h-auto items-center justify-center rounded-xl px-3 transition ${
                  academicItems.includes(selected)
                    ? dark
                      ? "bg-[#7c4dff] text-white"
                      : "bg-gradient-to-r from-[#6f58ff] to-[#4b36d2] text-white"
                    : dark
                      ? "text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                aria-label="Toggle Academic Records menu"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 transition-transform ${academicOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {academicOpen ? (
              <div className="ml-3 space-y-1 border-l border-white/10 pl-3">
                {[
                  "Roll No Slips Management",
                  "Paper, Date Sheet & Result",
                ].map((item) => {
                  const active = selected === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onSelect(item)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                        active
                          ? dark
                            ? "bg-white/[0.08] text-white"
                            : "bg-blue-50 text-blue-700"
                          : dark
                            ? "text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-current" : "bg-current opacity-50"}`} />
                      <span className="truncate">{item}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
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
