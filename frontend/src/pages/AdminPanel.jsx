import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminAssignReward,
  adminGetHistory,
  adminGetUserActivity,
  adminGetUsers,
  getRewardLeaderboard,
} from "../services/api";
import "../styles/AppPages.css";

const ADMIN_TOKEN_KEY = "greenpulse_admin_token";

function AdminPanel() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [points, setPoints] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [userActivity, setUserActivity] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const token = localStorage.getItem(ADMIN_TOKEN_KEY);

  const loadUserActivity = async (userName) => {
    if (!token || !userName) {
      return;
    }
    setLoadingActivity(true);
    try {
      const response = await adminGetUserActivity(token, userName, 80);
      setUserActivity(response.data);
    } catch {
      setUserActivity(null);
    } finally {
      setLoadingActivity(false);
    }
  };

  const loadData = async () => {
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }
    try {
      const [historyRes, boardRes, usersRes] = await Promise.all([
        adminGetHistory(token, 60),
        getRewardLeaderboard(8),
        adminGetUsers(token, 100),
      ]);
      setHistory(historyRes.data?.items ?? []);
      setSummary(historyRes.data?.summary ?? null);
      setLeaderboard(boardRes.data?.items ?? []);
      const userItems = usersRes.data?.items ?? [];
      setUsers(userItems);
      if (userItems.length > 0) {
        const defaultUser = selectedUser || userItems[0].name;
        setSelectedUser(defaultUser);
        await loadUserActivity(defaultUser);
      }
    } catch (apiError) {
      if (apiError?.response?.status === 401) {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        navigate("/admin/login", { replace: true });
      }
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 12000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      navigate("/admin/login", { replace: true });
      return;
    }
    setStatus("");
    try {
      await adminAssignReward(
        {
          name: name.trim(),
          points: Number(points),
          reason: reason.trim() || "Manual admin reward",
          issued_by: "admin-panel",
        },
        token
      );
      setStatus("Reward assigned successfully.");
      setName("");
      setPoints("");
      setReason("");
      await loadData();
    } catch (apiError) {
      setStatus(apiError?.response?.data?.error ?? "Failed to assign reward.");
    }
  };

  const totalAssigned = useMemo(() => summary?.total_points ?? 0, [summary]);

  const formatTime = (value) => {
    if (!value) {
      return "--";
    }
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.toLocaleString();
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    navigate("/admin/login", { replace: true });
  };

  const handleUserClick = async (userName) => {
    setSelectedUser(userName);
    await loadUserActivity(userName);
  };

  return (
    <section className="module-page">
      <div className="module-hero admin-hero">
        <div>
          <h1>Admin Panel</h1>
          <p>Assign rewards, review users, and manage operational activity in one place.</p>
        </div>
        <button type="button" className="game-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="module-grid admin-panel-grid">
        <article className="module-card admin-assign-card">
          <h3>Assign Reward</h3>
          <form className="reward-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="User or Team Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <input
              type="number"
              min="0.1"
              step="0.1"
              placeholder="Reward Points"
              value={points}
              onChange={(event) => setPoints(event.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Reason (optional)"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
            <button type="submit" className="game-btn">
              Assign Reward
            </button>
            {status && <p className="admin-status">{status}</p>}
          </form>
        </article>

        <article className="module-card admin-summary-card">
          <h3>Reward Summary</h3>
          <ul className="simple-list">
            <li>Total points assigned: {totalAssigned}</li>
            <li>Total events: {summary?.total_events ?? 0}</li>
            <li>Active users: {summary?.active_users ?? 0}</li>
          </ul>
        </article>

        <article className="module-card admin-leaderboard-card">
          <h3>Top Leaderboard</h3>
          <ul className="simple-list">
            {leaderboard.length === 0 && <li>No rewards assigned yet.</li>}
            {leaderboard.map((entry, index) => (
              <li key={`${entry.name}-${index}`}>
                {index + 1}. {entry.name} - {entry.points} pts
              </li>
            ))}
          </ul>
        </article>

        <article className="module-card admin-history-card">
          <h3>Recent Assignments</h3>
          <ul className="simple-list">
            {history.length === 0 && <li>No assignment history yet.</li>}
            {history.slice(0, 10).map((item) => (
              <li key={item.id}>
                {item.name}: +{item.points} pts ({item.reason})
              </li>
            ))}
          </ul>
        </article>

        <article className="module-card admin-users-card">
          <h3>Users</h3>
          <div className="admin-user-list">
            {users.length === 0 && <p>No user prediction activity yet.</p>}
            {users.map((user) => (
              <button
                type="button"
                key={user.name}
                className={`admin-user-btn${selectedUser === user.name ? " active" : ""}`}
                onClick={() => handleUserClick(user.name)}
              >
                <strong>{user.name}</strong>
                <span>{user.predictions_count} predictions</span>
              </button>
            ))}
          </div>
        </article>

        <article className="module-card admin-user-activity">
          <h3>User Activity Explorer</h3>
          {loadingActivity && <p>Loading activity...</p>}
          {!loadingActivity && !userActivity && <p>Select a user to view activity details.</p>}
          {!loadingActivity && userActivity && (
            <>
              <div className="admin-user-meta">
                <span>Started: {formatTime(userActivity.profile?.started_at)}</span>
                <span>Last seen: {formatTime(userActivity.profile?.last_seen)}</span>
                <span>Latest location: {userActivity.profile?.last_location ?? "--"}</span>
              </div>
              <div className="admin-user-meta">
                <span>Predictions: {userActivity.profile?.predictions_count ?? 0}</span>
                <span>Avg CO2: {userActivity.profile?.avg_co2 ?? 0} ppm</span>
                <span>Best reduction: {userActivity.profile?.best_reduction ?? 0} ppm</span>
              </div>
              <ul className="simple-list admin-event-list">
                {(userActivity.events ?? []).slice(0, 16).map((event, index) => (
                  <li key={`${event.timestamp}-${index}`}>
                    <p>{formatTime(event.timestamp)}</p>
                    <span>Location: {event.location}</span>
                    <span>Measure: {event.measure_taken}</span>
                    <span>CO2: {event.co2} ppm</span>
                    <span>Reduction: {event.reduction_vs_previous} ppm</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>
      </div>
    </section>
  );
}

export default AdminPanel;
