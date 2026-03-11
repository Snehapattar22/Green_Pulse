import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/AppLayout.css";

function AppLayout() {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login", { replace: true });
      }
      setCheckingSession(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (checkingSession) {
    return <div className="app-loading">Checking session...</div>;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">GreenPulse</div>
        <nav className="app-nav">
          <NavLink to="/app" end>
            Home
          </NavLink>
          <NavLink to="/app/dashboard">Dashboard</NavLink>
          <NavLink to="/app/rewards">Rewards</NavLink>
          <NavLink to="/app/gamification">Gamification</NavLink>
          <NavLink to="/app/leaderboard">Leaderboard</NavLink>
          <NavLink to="/app/impact">Global Impact</NavLink>
          <NavLink to="/app/heatmap">Heatmap</NavLink>
        </nav>
        <button type="button" className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <div className="app-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AppLayout;
