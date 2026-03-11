import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import AppLayout from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Gamification from "./pages/Gamification";
import Heatmap from "./pages/Heatmap";
import Home from "./pages/Home";
import Impact from "./pages/Impact";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Rewards from "./pages/Rewards";
import Signup from "./pages/Signup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/panel" element={<AdminPanel />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rewards" element={<Rewards />} />
          <Route path="gamification" element={<Gamification />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="impact" element={<Impact />} />
          <Route path="heatmap" element={<Heatmap />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
