import { useEffect, useState } from "react";
import { IconChevronDown, IconLogout, navIconMap, teacherNavIconMap } from "../icons/NavIcons";
import { isTeacherSubpage, TEACHER_SUBPAGES } from "../../constants/teacherNav";
import { isFeeSubpage, FEE_SUBPAGES } from "../../constants/feeNav";
import { isStudentSubpage, STUDENT_SUBPAGES } from "../../constants/studentNav";
import TeacherNavSubmenu from "./TeacherNavSubmenu";
import StudentNavSubmenu from "./StudentNavSubmenu";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function Sidebar({ selected, onSelect, onLogout, role, dark = true, entering = false }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [teacherMenuOpen, setTeacherMenuOpen] = useState(false);
  const [feeMenuOpen, setFeeMenuOpen] = useState(false);
  const [studentMenuOpen, setStudentMenuOpen] = useState(false);

  const adminNavItems = [
    "Dashboard",
    "Teachers",
    "Students",
    "Fee Management",
    "Finance Management",
    "Students Portfolios",
    "School Leaving",
    "Time & Attendance",
    "Payroll",
    "Reports",
  ];

  const navItems = role === "ACCOUNTANT" ? ["Dashboard", "Purchase Management", "Fees Management", "Reports"] : adminNavItems;
  const financeFeeSubpages = ["Fine Management", "Refund Management"];
  const isTeacherSubpageActive = isTeacherSubpage(selected);
  const isFeeSubpageActive = isFeeSubpage(selected) || selected === "Refund Management";
  const isStudentSubpageActive = isStudentSubpage(selected);

  useEffect(() => {
    if (isTeacherSubpageActive) setTeacherMenuOpen(true);
    else setTeacherMenuOpen(false);
  }, [isTeacherSubpageActive]);

  useEffect(() => {
    if (isFeeSubpageActive) setFeeMenuOpen(true);
    else setFeeMenuOpen(false);
  }, [isFeeSubpageActive]);

  useEffect(() => {
    if (isStudentSubpageActive) setStudentMenuOpen(true);
    else setStudentMenuOpen(false);
  }, [isStudentSubpageActive]);

  const primaryActiveClass = dark
    ? "bg-[#7c4dff] text-white shadow-[0_12px_24px_rgba(124,77,255,0.28)]"
    : "bg-gradient-to-r from-[#6f58ff] to-[#4b36d2] text-white shadow-[0_14px_28px_rgba(91,70,220,0.42)]";

  const primaryIdleClass = dark
    ? "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900";

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

        <nav className="scrollbar-sidebar scrollbar-hide relative z-10 flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
          {navItems.map((item) => {
            const active = selected === item;
            const Icon = navIconMap[item];

            if (item === "Teachers") {
              const TeacherPageIcon = teacherNavIconMap["Teacher Page"] || Icon;
              const teacherParentActive = active || isTeacherSubpageActive;

              return (
                <div key={item} className="rounded-2xl border border-transparent transition">
                  <div className="p-1">
                    <div className="group flex items-stretch overflow-hidden rounded-xl">
                      <button
                        type="button"
                        onClick={() => onSelect(item)}
                        className={`flex flex-1 items-center gap-3 rounded-l-xl rounded-r-none px-3.5 py-3 text-left text-sm font-medium transition ${
                          teacherParentActive ? primaryActiveClass : primaryIdleClass
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                            teacherParentActive ? "bg-white/15" : "bg-transparent"
                          }`}
                        >
                          {TeacherPageIcon ? <TeacherPageIcon className="h-5 w-5" /> : null}
                        </span>
                        <span>Teacher Page</span>
                      </button>

                      <button
                        type="button"
                        aria-label={teacherMenuOpen ? "Collapse teacher pages" : "Expand teacher pages"}
                        onClick={() => setTeacherMenuOpen((value) => !value)}
                        className={`flex w-10 items-center justify-center rounded-r-xl rounded-l-none border-l text-sm transition ${
                          dark
                            ? "border-white/[0.06] bg-transparent text-white hover:bg-white/[0.04] hover:text-white group-hover:bg-white/[0.04] group-hover:text-white"
                            : "border-white/10 bg-transparent text-white/78 hover:bg-white/10 hover:text-white group-hover:bg-white/10 group-hover:text-white"
                        }`}
                      >
                        <IconChevronDown className={`h-4 w-4 transition-transform duration-300 ${teacherMenuOpen ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>

                  <div
                    className={`grid overflow-hidden transition-all duration-300 ease-out ${
                      teacherMenuOpen ? "grid-rows-[1fr] pb-3 opacity-100" : "grid-rows-[0fr] pb-0 opacity-0"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <TeacherNavSubmenu
                        items={TEACHER_SUBPAGES}
                        selected={selected}
                        onSelect={onSelect}
                        dark={dark}
                        onDarkSidebar
                      />
                    </div>
                  </div>
                </div>
              );
            }

            if (item === "Assigned Classes & Sections") {
              const PageIcon = navIconMap[item] || Icon;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onSelect(item)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                    active ? primaryActiveClass : primaryIdleClass
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      active ? "bg-white/15" : dark ? "bg-white/[0.04]" : "bg-slate-100"
                    }`}
                  >
                    {PageIcon ? <PageIcon className="h-5 w-5" /> : null}
                  </span>
                  <span className="leading-tight">
                    <span className="block">Assigned Classes</span>
                    <span className="block">&amp; Sections</span>
                  </span>
                </button>
              );
            }

            if (item === "Fee Management" || item === "Fees Management") {
              const FeePageIcon = navIconMap[item] || navIconMap["Fee Management"] || Icon;
              const feeParentActive = active || isFeeSubpageActive;
              const feeSubpages = role === "ACCOUNTANT" ? financeFeeSubpages : FEE_SUBPAGES;

              return (
                <div key={item} className="rounded-2xl border border-transparent transition">
                  <div className="p-1">
                    <div className="group flex items-stretch overflow-hidden rounded-xl">
                      <button
                        type="button"
                        onClick={() => onSelect(item)}
                        className={`flex flex-1 items-center gap-3 rounded-l-xl rounded-r-none px-3.5 py-3 text-left text-sm font-medium transition ${
                          feeParentActive
                            ? primaryActiveClass
                            : dark
                              ? "bg-transparent text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white group-hover:bg-white/[0.04] group-hover:text-white"
                              : "bg-transparent text-white/78 hover:bg-white/10 hover:text-white group-hover:bg-white/10 group-hover:text-white"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                            feeParentActive
                              ? "bg-white/15"
                              : dark
                                ? "bg-white/[0.04] group-hover:bg-white/[0.08]"
                                : "bg-white/10 group-hover:bg-white/15"
                          }`}
                        >
                          {FeePageIcon ? <FeePageIcon className="h-5 w-5" /> : null}
                        </span>
                        <span>{item}</span>
                      </button>

                      <button
                        type="button"
                        aria-label={feeMenuOpen ? "Collapse fee pages" : "Expand fee pages"}
                        onClick={() => setFeeMenuOpen((value) => !value)}
                        className={`flex w-10 items-center justify-center rounded-r-xl rounded-l-none border-l text-sm transition ${
                          dark
                            ? "border-white/[0.06] bg-transparent text-white hover:bg-white/[0.04] hover:text-white group-hover:bg-white/[0.04] group-hover:text-white"
                            : "border-white/10 bg-transparent text-white/78 hover:bg-white/10 hover:text-white group-hover:bg-white/10 group-hover:text-white"
                        }`}
                      >
                        <IconChevronDown className={`h-4 w-4 transition-transform duration-300 ${feeMenuOpen ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>

                  <div
                    className={`grid overflow-hidden transition-all duration-300 ease-out ${
                      feeMenuOpen ? "grid-rows-[1fr] pb-3 opacity-100" : "grid-rows-[0fr] pb-0 opacity-0"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <TeacherNavSubmenu
                        items={feeSubpages}
                        selected={selected}
                        onSelect={onSelect}
                        dark={dark}
                        onDarkSidebar
                        iconMap={navIconMap}
                      />
                    </div>
                  </div>
                </div>
              );
            }

            if (item === "Finance Management") {
              const FinancePageIcon = navIconMap["Finance Management"] || navIconMap["Fee Management"] || Icon;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onSelect(item)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                    active
                      ? "bg-transparent text-white"
                      : dark
                        ? "text-white hover:bg-white/[0.04] hover:text-white"
                        : primaryIdleClass
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                      dark ? "bg-transparent" : "bg-slate-100"
                    }`}
                  >
                    {FinancePageIcon ? <FinancePageIcon className={`h-5 w-5 ${dark ? "text-white" : ""}`} /> : null}
                  </span>
                  <span>Finance Management</span>
                </button>
              );
            }

            if (item === "Students") {
              const StudentPageIcon = navIconMap["Students"] || Icon;
              const studentParentActive = active || isStudentSubpageActive;

              return (
                <div key={item} className="rounded-2xl border border-transparent transition">
                  <div className="p-1">
                    <div className="group flex items-stretch overflow-hidden rounded-xl">
                      <button
                        type="button"
                        onClick={() => onSelect(item)}
                        className={`flex flex-1 items-center gap-3 rounded-l-xl rounded-r-none px-3.5 py-3 text-left text-sm font-medium transition ${
                          studentParentActive ? primaryActiveClass : primaryIdleClass
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                            studentParentActive ? "bg-white/15" : "bg-transparent"
                          }`}
                        >
                          {StudentPageIcon ? <StudentPageIcon className="h-5 w-5" /> : null}
                        </span>
                        <span>Students</span>
                      </button>

                      <button
                        type="button"
                        aria-label={studentMenuOpen ? "Collapse student pages" : "Expand student pages"}
                        onClick={() => setStudentMenuOpen((value) => !value)}
                        className={`flex w-10 items-center justify-center rounded-r-xl rounded-l-none border-l text-sm transition ${
                          dark
                            ? "border-white/[0.06] bg-transparent text-white hover:bg-white/[0.04] hover:text-white group-hover:bg-white/[0.04] group-hover:text-white"
                            : "border-white/10 bg-transparent text-white/78 hover:bg-white/10 hover:text-white group-hover:bg-white/10 group-hover:text-white"
                        }`}
                      >
                        <IconChevronDown className={`h-4 w-4 transition-transform duration-300 ${studentMenuOpen ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>

                  <div
                    className={`grid overflow-hidden transition-all duration-300 ease-out ${
                      studentMenuOpen ? "grid-rows-[1fr] pb-3 opacity-100" : "grid-rows-[0fr] pb-0 opacity-0"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <StudentNavSubmenu
                        items={STUDENT_SUBPAGES}
                        selected={selected}
                        onSelect={onSelect}
                        dark={dark}
                        onDarkSidebar
                      />
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={item}
                type="button"
                onClick={() => onSelect(item)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium transition ${
                  active
                    ? primaryActiveClass
                    : dark
                      ? "text-white hover:bg-white/[0.04] hover:text-white"
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
              dark ? "text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white" : "bg-white/10 text-white/85 hover:bg-white/15 hover:text-white"
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
