import { studentNavIconMap } from "../icons/NavIcons";

export function getStudentSubpageButtonClass({ active, dark, onDarkSidebar = true }) {
  if (onDarkSidebar) {
    return active
      ? "border-[#0b63d8]/40 bg-[#0b63d8] text-white shadow-[0_8px_18px_rgba(11,99,216,0.26)]"
      : "border-white/[0.1] bg-white/[0.06] text-white hover:border-white/[0.16] hover:bg-white/[0.1] hover:text-white";
  }

  return active
    ? "border-[#0b63d8]/30 bg-[#0b63d8] text-white shadow-[0_8px_18px_rgba(11,99,216,0.22)]"
    : dark
      ? "border-white/[0.08] bg-[#121528] text-white hover:border-white/[0.14] hover:bg-[#1a1d34] hover:text-white"
      : "border-slate-200 bg-slate-50/90 text-slate-700 hover:border-[#0b63d8]/25 hover:bg-[#eef5ff] hover:text-[#0b63d8]";
}

export function getStudentSubpageIconClass({ active, dark, onDarkSidebar = true }) {
  if (onDarkSidebar) {
    return active ? "bg-white/18 text-white" : "bg-white/12 text-white/90";
  }

  return active
    ? dark
      ? "bg-white/18 text-white"
      : "bg-white/20 text-white"
    : dark
      ? "bg-white/[0.06] text-[#cfe0ff]"
      : "bg-white text-[#0b63d8] shadow-sm";
}

export default function StudentNavSubmenu({
  items,
  selected,
  onSelect,
  dark = true,
  onDarkSidebar = true,
}) {
  return (
    <div className="space-y-1.5 px-1">
      {items.map((subpage) => {
        const active = selected === subpage.id;
        const SubIcon = studentNavIconMap[subpage.id];

        return (
          <button
            key={subpage.id}
            type="button"
            onClick={() => onSelect(subpage.id)}
            className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-[13px] font-medium transition-all duration-200 ${getStudentSubpageButtonClass({
              active,
              dark,
              onDarkSidebar,
            })}`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${getStudentSubpageIconClass({
                active,
                dark,
                onDarkSidebar,
              })}`}
            >
              {SubIcon ? <SubIcon className="h-4 w-4" /> : null}
            </span>
            <span className="truncate">{subpage.label}</span>
          </button>
        );
      })}
    </div>
  );
}
