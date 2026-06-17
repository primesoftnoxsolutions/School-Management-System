import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/authSlice";

export default function LoginPage() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: "admin@schoolerp.local", password: "Admin@123" });

  const onSubmit = async (event) => {
    event.preventDefault();
    await dispatch(login(form));
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={onSubmit} className="premium-glass w-full max-w-md rounded-3xl p-7">
        <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-sky-700/80">
          Welcome To
        </p>
        <h1 className="premium-title mb-1 text-2xl font-bold">Naseer Ideal Public School</h1>
        <p className="mb-5 text-sm text-sky-900/70">School ERP Secure Login</p>
        <div className="mb-3">
          <label htmlFor="email" className="mb-1 block text-sm text-sky-900/80">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="premium-input w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="mb-1 block text-sm text-sky-900/80">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="premium-input w-full"
            required
          />
        </div>
        {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="premium-btn w-full"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <div className="mt-4 rounded-xl border border-sky-100 bg-white/60 p-3 text-xs text-sky-900/70">
          <p>Super Admin: admin@schoolerp.local / Admin@123</p>
          <p>Accountant: accountant@schoolerp.local / Account@123</p>
          <p>Teacher: teacher@schoolerp.local / Teacher@123</p>
        </div>
      </form>
    </div>
  );
}
