export default function AppLaunchSplash({ user, dark = true, exiting = false }) {
  const name = user?.fullName || user?.name || "User";
  const accent = dark ? "#7c4dff" : "#0b63d8";
  const accentSoft = dark ? "rgba(124,77,255,0.16)" : "rgba(11,99,216,0.14)";
  const accentSoft2 = dark ? "rgba(124,77,255,0.08)" : "rgba(11,99,216,0.08)";

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center px-6 ${
        dark ? "bg-[#0b0c15]" : "bg-[#eef3f8]"
      } ${exiting ? "app-launch-splash-exit" : "app-launch-splash-enter"}`}
      aria-live="polite"
      aria-busy={!exiting}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: accentSoft }}
        />
        <div
          className="absolute -bottom-32 -right-28 h-96 w-96 rounded-full blur-3xl"
          style={{ background: accentSoft2 }}
        />
        <div
          className={`absolute right-10 top-10 h-32 w-32 rounded-full border ${
            dark ? "border-white/5" : "border-[#0b63d8]/10"
          }`}
        />
        <div
          className={`absolute left-10 bottom-10 h-44 w-44 rounded-full border ${
            dark ? "border-white/5" : "border-[#0b63d8]/10"
          }`}
        />
      </div>

      <div className={`relative z-10 flex max-w-2xl flex-col items-center text-center ${exiting ? "" : "app-launch-splash-content"}`}>
        <p className="text-sm font-bold uppercase tracking-[0.38em] sm:text-base" style={{ color: accent }}>
          Insaf Grammar High School
        </p>

        <div className="relative mt-8">
          <div
            className="absolute inset-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ background: accentSoft }}
          />
          <img
            src="/Logo%20Insaf%20Grammar%20High%20School.png"
            alt="Insaf Grammar High School logo"
            className="relative h-64 w-64 object-contain drop-shadow-[0_28px_70px_rgba(15,23,42,0.16)] sm:h-72 sm:w-72"
          />
        </div>

        <h2 className={`mt-10 text-4xl font-bold sm:text-5xl ${dark ? "text-white" : "text-[#08264a]"}`}>Welcome back</h2>
        <p className={`mt-3 max-w-md text-base leading-7 ${dark ? "text-[#9e9e9e]" : "text-slate-600"}`}>
          {name}
        </p>

        <div className="mt-8 flex w-full max-w-sm items-center gap-3">
          <span className={`h-1.5 flex-1 rounded-full ${dark ? "bg-white/10" : "bg-slate-200"}`} />
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
          <span className={`h-1.5 flex-1 rounded-full ${dark ? "bg-white/10" : "bg-slate-200"}`} />
        </div>

        {!exiting ? (
          <p className={`mt-8 text-base font-semibold uppercase tracking-[0.26em] sm:text-lg ${dark ? "text-[#7c4dff]/80" : "text-[#0b63d8]/80"}`}>
            Loading your dashboard...
          </p>
        ) : null}
      </div>
    </div>
  );
}
