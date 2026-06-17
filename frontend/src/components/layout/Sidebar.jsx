export default function Sidebar({ selected, onSelect, onLogout }) {
  const navItems = [
    "Dashboard",
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

  return (
    <aside className="premium-glass fixed inset-y-0 left-0 hidden w-72 border-r p-4 lg:flex lg:flex-col">
      <div>
        <h2 className="premium-title mb-1 text-lg font-bold">School ERP</h2>
        <p className="mb-6 text-xs text-sky-700/70">Enterprise Management Suite</p>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
        {navItems.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
              selected === item
                ? "bg-gradient-to-r from-sky-500 to-cyan-500 font-medium text-white"
                : "text-slate-700 hover:bg-sky-100/70"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="mt-4 border-t border-sky-100 pt-4">
        <button type="button" onClick={onLogout} className="premium-btn-soft w-full">
          Logout
        </button>
      </div>
    </aside>
  );
}
