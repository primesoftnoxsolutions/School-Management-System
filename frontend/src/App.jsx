import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import { fetchMe } from "./store/authSlice";

export default function App() {
  const dispatch = useDispatch();
  const { user, loading, sessionChecked } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  if (!sessionChecked || (loading && !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-600">
        Loading session...
      </div>
    );
  }

  return user ? <DashboardPage /> : <LoginPage />;
}
