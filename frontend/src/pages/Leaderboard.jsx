import { useEffect, useState } from "react";
import { getRewardLeaderboard } from "../services/api";
import "../styles/AppPages.css";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState("");

  const loadLeaderboard = async () => {
    try {
      const response = await getRewardLeaderboard(20);
      setLeaderboard(response.data?.items ?? []);
      setError("");
    } catch (apiError) {
      setError("Unable to load leaderboard.");
    }
  };

  useEffect(() => {
    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="module-page">
      <div className="module-hero">
        <h1>Leaderboard</h1>
        <p>Live ranking based on admin reward assignments.</p>
      </div>

      <div className="module-grid">
        <article className="module-card">
          <h3>Top Green Champions</h3>
          {error && <p className="admin-status">{error}</p>}
          <ul className="simple-list">
            {leaderboard.map((entry, index) => (
              <li key={entry.name}>
                {index + 1}. {entry.name} - {entry.points} pts
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

export default Leaderboard;
