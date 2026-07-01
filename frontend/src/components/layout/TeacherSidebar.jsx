import { useEffect, useState } from "react";
import { IconChevronDown, IconLogout, teacherNavIconMap } from "../icons/NavIcons";
import { isTeacherSubpage, TEACHER_PORTAL_SUBPAGES } from "../../constants/teacherNav";
import TeacherNavSubmenu from "./TeacherNavSubmenu";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function TeacherSidebar({ selected, onSelect, onLogout, dark = true, entering = false }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [teacherMenuOpen, setTeacherMenuOpen] = useState(false);
  const isTeacherChildActive = isTeacherSubpage(selected);

  useEffect(() => {
    if (isTeacherChildActive) setTeacherMenuOpen(true);
    else setTeacherMenuOpen(false);
  }, [isTeacherChildActive]);

  const headerIdleClass = dark
    ? "bg-[#131526] text-[#d7d2ff] hover:bg-[#1a1c33] hover:text-white"
    : "bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900";

  const headerActiveClass = dark
    ? "bg-[#7c4dff] text-white shadow-[0_12px_24px_rgba(124,77,255,0.28)]"
    : "bg-gradient-to-r from-[#6f58ff] to-[#4b36d2] text-white shadow-[0_14px_28px_rgba(91,70,220,0.42)]";

  const chevronIdleClass = dark
    ? "bg-[#131526] text-[#d7d2ff] hover:bg-[#1a1c33] hover:text-white"
    : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900";

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

        <nav className="scrollbar-sidebar scrollbar-hide flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
          <div className="rounded-2xl border border-transparent transition">
            <div className="p-1">
              <div className="flex items-stretch overflow-hidden rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    onSelect("Teacher Page");
                  }}
                  className={`flex flex-1 items-center gap-3 px-3.5 py-3 text-left text-sm font-medium transition ${
                    selected === "Teacher Page" ? headerActiveClass : headerIdleClass
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      selected === "Teacher Page" ? "bg-white/15" : dark ? "bg-white/5" : "bg-slate-100"
                    }`}
                  >
                    {(() => {
                      const Icon = teacherNavIconMap["Teacher Page"];
                      return Icon ? <Icon className="h-5 w-5" /> : null;
                    })()}
                  </span>
                  <span>Teacher Page</span>
                </button>

                <button
                  type="button"
                  aria-label={teacherMenuOpen ? "Collapse teacher pages" : "Expand teacher pages"}
                  onClick={() => setTeacherMenuOpen((value) => !value)}
                  className={`flex w-12 items-center justify-center text-sm transition ${chevronIdleClass}`}
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
                  items={TEACHER_PORTAL_SUBPAGES}
                  selected={selected}
                  onSelect={onSelect}
                  dark={dark}
                  onDarkSidebar={dark}
                />
              </div>
            </div>
          </div>
        </nav>

        <div className="p-4">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
              dark ? "text-[#9e9e9e] hover:bg-white/[0.04] hover:text-white" : "text-rose-600 hover:bg-rose-50"
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
