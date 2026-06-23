export default function TeacherTopHeader({ user, dark = false, onToggleTheme }) {
  return (
    <header className="mb-4 flex flex-wrap items-center gap-4 bg-transparent px-5 py-4 lg:px-6">
      <div className="min-w-0">
        <h1 className={`text-lg font-semibold ${dark ? "text-white" : "text-slate-800"}`}>Teacher Portal</h1>
        <p className={`text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Naseer Ideal Public School</p>
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        {onToggleTheme ? (
          <button
            type="button"
            onClick={onToggleTheme}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
              dark
                ? "border-white/[0.06] bg-[#161722] text-[#7c4dff] hover:bg-white/[0.04]"
                : "border-slate-200 bg-white text-slate-500 shadow-sm hover:bg-slate-50"
            }`}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {dark ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M20 15.5A8.2 8.2 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path
                  d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        ) : null}

        <div
          className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 ${
            dark ? "border-white/[0.06] bg-[#161722]" : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7c4dff] text-sm font-semibold text-white">
            {(user?.fullName || "T").charAt(0)}
          </div>
          <div className="text-left">
            <p className={`text-sm font-semibold ${dark ? "text-white" : "text-slate-800"}`}>
              {user?.fullName || "Teacher"}
            </p>
            <p className={`text-xs ${dark ? "text-[#9e9e9e]" : "text-slate-500"}`}>Teacher</p>
          </div>
        </div>
      </div>
    </header>
  );
}
