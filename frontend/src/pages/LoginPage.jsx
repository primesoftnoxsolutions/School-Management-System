import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/authSlice";

const ROLE_OPTIONS = [
  { id: "SUPER_ADMIN", label: "Super Admin" },
  { id: "TEACHER", label: "Teachers" },
];

const SCHOOL_HIGHLIGHTS = [
  "Complete student & teacher management",
  "Fee collection, payroll & reports",
  "Daily attendance & academic records",
  "Secure role-based access for staff",
];

export default function LoginPage() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [role, setRole] = useState("SUPER_ADMIN");
  const [form, setForm] = useState({ email: "", password: "" });

  const onRoleChange = (nextRole) => {
    setRole(nextRole);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    await dispatch(login(form));
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — School info */}
      <aside className="relative hidden w-[48%] overflow-hidden bg-gradient-to-br from-slate-900 via-sky-950 to-cyan-900 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-0 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
            Welcome To
          </p>
          <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
            Naseer Ideal
            <br />
            Public School
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-sky-100/85">
            A modern school management platform for admissions, attendance, fees,
            payroll, and day-to-day academic operations — all in one secure place.
          </p>

          <ul className="mt-10 space-y-3">
            {SCHOOL_HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-sky-100/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-xs text-cyan-300">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 border-t border-white/10 px-12 py-6 xl:px-16">
          <p className="text-xs text-sky-200/70">
            © {new Date().getFullYear()} Naseer Ideal Public School · School ERP System
          </p>
        </div>
      </aside>

      {/* Right — Login form */}
      <main className="flex w-full flex-col justify-center bg-slate-50 px-6 py-10 sm:px-10 lg:w-[52%] lg:px-16 xl:px-20">
        <div className="mx-auto w-full max-w-xl">
          {/* Mobile school header */}
          <div className="mb-8 text-center lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700/80">
              Welcome To
            </p>
            <h1 className="premium-title mt-1 text-2xl font-bold">Naseer Ideal Public School</h1>
            <p className="mt-1 text-sm text-sky-900/70">School ERP Secure Login</p>
          </div>

          <div className="ref-card p-8 sm:p-10">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-slate-900">Sign in</h2>
              <p className="mt-2 text-sm text-slate-500">
                Select your role and enter your credentials
              </p>
            </div>

            {/* Role selector */}
            <div className="mb-7">
              <p className="mb-2.5 text-center text-sm font-medium text-slate-700">Login as</p>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5">
                {ROLE_OPTIONS.map((option) => {
                  const active = role === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onRoleChange(option.id)}
                      className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                        active
                          ? "bg-white text-sky-700 shadow-sm ring-1 ring-sky-100"
                          : "text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="ref-input w-full px-4 py-3 text-base"
                  placeholder="you@school.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="ref-input w-full px-4 py-3 text-base"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error ? <p className="text-center text-sm text-rose-600">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="premium-btn w-full py-3.5 text-base"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              {role === "SUPER_ADMIN"
                ? "Super Admin access for full school management"
                : "Teacher access for class attendance & records"}
            </p>
            {import.meta.env.DEV && role === "SUPER_ADMIN" ? (
              <p className="mt-2 text-center text-[11px] text-slate-400">
                Local dev: admin@schoolerp.local / Admin@123
              </p>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
