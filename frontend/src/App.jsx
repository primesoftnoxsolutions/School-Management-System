import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import { fetchMe } from "./store/authSlice";

export default function App() {
  const dispatch = useDispatch();
  const { accessToken, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken && !user) {
      dispatch(fetchMe());
    }
  }, [accessToken, user, dispatch]);

  if (accessToken && loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-600">
        Loading session...
      </div>
    );
  }

  return accessToken ? <DashboardPage /> : <LoginPage />;
}
