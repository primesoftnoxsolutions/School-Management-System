import { useEffect, useRef, useState } from "react";
import { DropdownBackdrop, DropdownMenuPortal } from "./DropdownBackdrop";

export default function ScrollableSelect({
  label,
  placeholder = "Select...",
  value,
  options = [],
  onChange,
  required = false,
  openUpward = false,
  dark = false,
  menuMaxHeight = 176,
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState({});
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const updateMenuPosition = () => {
    if (!openUpward || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const maxHeight = Math.min(menuMaxHeight, Math.max(rect.top - 12, 120));
    setMenuStyle({
      left: rect.left,
      width: rect.width,
      bottom: window.innerHeight - rect.top + 4,
      maxHeight,
    });
  };

  useEffect(() => {
    const onDocClick = (event) => {
      const inRoot = rootRef.current?.contains(event.target);
      const inMenu = menuRef.current?.contains(event.target);
      if (!inRoot && !inMenu) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!open || !openUpward) return undefined;
    updateMenuPosition();
    const onReposition = () => updateMenuPosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open, openUpward, options.length, menuMaxHeight]);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || value;
  const resolvedMenuHeight = openUpward ? menuStyle.maxHeight || menuMaxHeight : menuMaxHeight;

  const triggerClass = dark
    ? "flex w-full items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-[#1a1b26] px-3 py-2.5 text-left text-sm text-white outline-none transition hover:border-[#7c4dff]/30 focus:border-[#7c4dff]/40 focus:ring-2 focus:ring-[#7c4dff]/15"
    : "flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-700 outline-none transition hover:border-indigo-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

  const menuContent = (
    <div className="overflow-y-auto p-1" style={{ maxHeight: resolvedMenuHeight }}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onChange(opt.value);
              setOpen(false);
            }}
            className={`flex w-full rounded-lg px-3 py-2 text-left text-sm transition ${
              active
                ? dark
                  ? "bg-[#7c4dff]/20 font-medium text-[#7c4dff]"
                  : "bg-indigo-50 font-medium text-indigo-700"
                : dark
                  ? "text-white hover:bg-white/[0.04]"
                  : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <div ref={rootRef} className="relative">
      {label ? (
        <p className={`mb-2 text-sm font-medium ${dark ? "text-[#9e9e9e]" : "text-slate-700"}`}>{label}</p>
      ) : null}
      <button ref={triggerRef} type="button" onClick={() => setOpen((prev) => !prev)} className={triggerClass}>
        <span
          className={`min-w-0 flex-1 truncate ${
            value ? (dark ? "text-white" : "text-slate-800") : dark ? "text-[#9e9e9e]" : "text-slate-400"
          }`}
        >
          {value ? selectedLabel : placeholder}
        </span>
        <span className={`shrink-0 ${dark ? "text-[#9e9e9e]" : "text-slate-400"}`}>{open ? "▲" : "▼"}</span>
      </button>
      {open && openUpward ? (
        <>
          <DropdownBackdrop onClose={() => setOpen(false)} />
          <DropdownMenuPortal menuRef={menuRef} style={menuStyle} dark={dark}>
            {menuContent}
          </DropdownMenuPortal>
        </>
      ) : null}
      {open && !openUpward ? (
        <div
          className={`absolute z-20 mt-1 w-full overflow-hidden rounded-xl shadow-lg ${
            dark ? "border border-white/[0.06] bg-[#161722]" : "border border-slate-200 bg-white"
          }`}
        >
          {menuContent}
        </div>
      ) : null}
      {required && !value ? (
        <p className={`mt-1 text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-400"}`}>Required</p>
      ) : null}
    </div>
  );
}
