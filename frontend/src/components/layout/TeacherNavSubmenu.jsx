import { teacherNavIconMap } from "../icons/NavIcons";

export function getTeacherSubpageButtonClass({ active, dark, onDarkSidebar = true }) {
  if (onDarkSidebar) {
    return active
      ? "border-[#7c4dff]/40 bg-[#7c4dff] text-white shadow-[0_8px_18px_rgba(124,77,255,0.28)]"
      : "border-white/[0.1] bg-white/[0.06] text-white hover:border-white/[0.16] hover:bg-white/[0.1] hover:text-white";
  }

  return active
    ? "border-[#7c4dff]/30 bg-[#7c4dff] text-white shadow-[0_8px_18px_rgba(124,77,255,0.22)]"
    : dark
      ? "border-white/[0.08] bg-[#121528] text-white hover:border-white/[0.14] hover:bg-[#1a1d34] hover:text-white"
      : "border-slate-200 bg-slate-50/90 text-slate-700 hover:border-[#7c4dff]/25 hover:bg-[#f4f1ff] hover:text-[#4b36d2]";
}

export function getTeacherSubpageIconClass({ active, dark, onDarkSidebar = true }) {
  if (onDarkSidebar) {
    return active ? "bg-white/18 text-white" : "bg-white/12 text-white/90";
  }

  return active
    ? dark
      ? "bg-white/18 text-white"
      : "bg-white/20 text-white"
    : dark
      ? "bg-white/[0.06] text-[#c8c3ff]"
      : "bg-white text-[#7c4dff] shadow-sm";
}

export default function TeacherNavSubmenu({
  items,
  selected,
  onSelect,
  dark = true,
  onDarkSidebar = true,
  iconMap = teacherNavIconMap,
}) {
  return (
    <div className="space-y-1.5 px-1">
      {items.map((subpage) => {
        const subpageActive = selected === subpage;
        const SubIcon = iconMap[subpage];
        const isAssignedClassesPage = subpage === "Assigned Classes & Sections";

        return (
          <button
            key={subpage}
            type="button"
            onClick={() => onSelect(subpage)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[13px] font-medium transition-all duration-200 ${getTeacherSubpageButtonClass({
              active: subpageActive,
              dark,
              onDarkSidebar,
            })}`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${getTeacherSubpageIconClass({
                active: subpageActive,
                dark,
                onDarkSidebar,
              })}`}
            >
              {SubIcon ? <SubIcon className="h-4 w-4" /> : null}
            </span>
            {isAssignedClassesPage ? (
              <span className="leading-tight">
                <span className="block">Assigned Classes</span>
                <span className="block">&amp; Sections</span>
              </span>
            ) : (
              <span className="truncate">{subpage}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
