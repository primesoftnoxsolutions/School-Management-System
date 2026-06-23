export default function AppLaunchSplash({ user, dark = true, exiting = false }) {
  const name = user?.fullName || user?.name || "User";
  const accent = dark ? "#7c4dff" : "#0b63d8";

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center px-6 ${
        dark ? "bg-[#0b0c15]" : "bg-[#eef3f8]"
      } ${exiting ? "app-launch-splash-exit" : "app-launch-splash-enter"}`}
      aria-live="polite"
      aria-busy={!exiting}
    >
      <div className={`flex max-w-md flex-col items-center text-center ${exiting ? "" : "app-launch-splash-content"}`}>
        <div className="mb-8">
          <div
            className={`app-launch-logo flex h-32 w-32 items-center justify-center rounded-[2rem] border shadow-[0_24px_60px_rgba(15,23,42,0.14)] ${
              dark
                ? "border-[#7c4dff]/25 bg-[#161722] shadow-[0_24px_60px_rgba(124,77,255,0.2)]"
                : "border-[#0b63d8]/20 bg-white"
            }`}
          >
            <svg viewBox="0 0 96 96" className="h-[4.5rem] w-[4.5rem]" aria-hidden="true">
              <path
                d="M48 9 77 21v21c0 21-12 36-29 45C31 78 19 63 19 42V21L48 9Z"
                fill={dark ? "#161722" : "#062d4f"}
                stroke={accent}
                strokeWidth="4.5"
              />
              <path
                d="M31 58c7-6 15-6 17-5 2-1 10-1 17 5V36c-7-5-14-5-17-1-3-4-10-4-17 1v22Z"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <path d="M48 22c5 5 5 10 0 15-5-5-5-10 0-15Z" fill={dark ? "#7c4dff" : "#d8a32a"} />
            </svg>
          </div>
        </div>

        <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: accent }}>
          Naseer Ideal Public School
        </p>
        <h2 className={`mt-4 text-3xl font-bold ${dark ? "text-white" : "text-[#08264a]"}`}>Welcome back</h2>
        <p className={`mt-3 text-base ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>{name}</p>

        {!exiting ? (
          <p className={`mt-8 text-sm font-medium ${dark ? "text-[#7c4dff]/80" : "text-[#0b63d8]/80"}`}>
            Loading your dashboard...
          </p>
        ) : null}
      </div>
    </div>
  );
}
