import { useEffect, useState } from "react";
import { getRewardHistory, getRewardSummary } from "../services/api";
import "../styles/AppPages.css";

function Rewards() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRewards = async () => {
    try {
      const [summaryRes, historyRes] = await Promise.all([
        getRewardSummary(),
        getRewardHistory(20),
      ]);
      setSummary(summaryRes.data);
      setHistory(historyRes.data?.items ?? []);
      setError("");
    } catch (apiError) {
      setError("Unable to load rewards feed right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
    const interval = setInterval(loadRewards, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="module-page">
      <div className="module-hero">
        <h1>Rewards Center</h1>
        <p>Dynamic rewards stream. Admin assignments appear here in real time.</p>
      </div>

      <div className="module-grid">
        <article className="module-card">
          <h3>Live Status</h3>
          <p>{loading ? "Loading reward data..." : "Connected to reward feed."}</p>
          {error && <p className="admin-status">{error}</p>}
        </article>
        <article className="module-card">
          <h3>Total Reward Points</h3>
          <p>{summary?.total_points ?? 0} pts</p>
        </article>
        <article className="module-card">
          <h3>Reward Activity</h3>
          <ul className="simple-list">
            {history.length === 0 && <li>No rewards assigned yet.</li>}
            {history.slice(0, 8).map((item) => (
              <li key={item.id}>
                {item.name}: +{item.points} pts ({item.reason})
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default Rewards;
