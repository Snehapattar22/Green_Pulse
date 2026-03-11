import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ChartComponent from "../components/ChartComponent";
import {
  getHistory,
  getInsights,
  getLatestData,
  getRewardLeaderboard,
  getRewardSummary,
} from "../services/api";

function Dashboard() {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [history, setHistory] = useState([]);
  const [rewardSummary, setRewardSummary] = useState(null);
  const [topRewards, setTopRewards] = useState([]);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [latestRes, insightsRes, historyRes, rewardSummaryRes, rewardBoardRes] = await Promise.all([
        getLatestData(),
        getInsights(),
        getHistory(30),
        getRewardSummary(),
        getRewardLeaderboard(3),
      ]);

      setData(latestRes.data);
      setInsights(insightsRes.data);
      setHistory(historyRes.data?.items ?? []);
      setRewardSummary(rewardSummaryRes.data ?? null);
      setTopRewards(rewardBoardRes.data?.items ?? []);
      setError("");
    } catch (error) {
      setError("Unable to load live analytics. Check backend connectivity.");
      console.log("Error fetching analytics:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatValue = (value, digits = 1) => {
    const n = Number.parseFloat(value);
    return Number.isFinite(n) ? n.toFixed(digits) : "--";
  };

  const co2Status = useMemo(() => {
    const co2 = Number.parseFloat(data?.co2);
    if (!Number.isFinite(co2)) {
      return { label: "No data", tone: "neutral" };
    }
    if (co2 <= 800) {
      return { label: "Fresh Air", tone: "good" };
    }
    if (co2 <= 1200) {
      return { label: "Moderate", tone: "warn" };
    }
    return { label: "High CO2", tone: "risk" };
  }, [data]);

  if (!data) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">Loading live analytics...</div>
      </div>
    );
  }

  if (Object.keys(data).length === 0) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          No live sensor data yet. Send the first sensor packet to start analytics.
        </div>
      </div>
    );
  }

  const metricCards = [
    {
      title: "Temperature",
      value: `${formatValue(data.temperature)} C`,
      hint: "Ambient",
    },
    {
      title: "Humidity",
      value: `${formatValue(data.humidity)} %`,
      hint: "Relative",
    },
    {
      title: "IR Radiation",
      value: formatValue(data.ir_radiation, 0),
      hint: "Infrared level",
    },
    {
      title: "Predicted CO2",
      value: `${formatValue(data.co2, 0)} ppm`,
      hint: "Model output",
      highlight: true,
    },
    {
      title: "Air Quality Score",
      value: `${formatValue(insights?.air_quality_score, 0)}/100`,
      hint: "Health index",
    },
    {
      title: "CO2 Trend",
      value: `${insights?.trend_ppm > 0 ? "+" : ""}${formatValue(insights?.trend_ppm, 0)} ppm`,
      hint: insights?.trend_direction ?? "Trend",
    },
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <h1>Environmental Analytics</h1>
          <p>Live sensor intelligence for your GreenPulse space.</p>
        </div>
        <span className={`air-badge ${co2Status.tone}`}>{co2Status.label}</span>
      </section>
      {error && <div className="dashboard-error">{error}</div>}

      <section className="dashboard-grid">
        {metricCards.map((metric) => (
          <article
            key={metric.title}
            className={`metric-card${metric.highlight ? " metric-card-highlight" : ""}`}
          >
            <h3>{metric.title}</h3>
            <p>{metric.value}</p>
            <small>{metric.hint}</small>
          </article>
        ))}
      </section>

      <section className="analytics-panel">
        <div className="analytics-header">
          <h2>CO2 Trend</h2>
          <span>Updates every 5 seconds</span>
        </div>
        <ChartComponent co2={Number.parseFloat(data.co2)} series={history} />
      </section>

      <section className="analytics-panel insights-panel">
        <div className="analytics-header">
          <h2>Actionable Insights</h2>
          <span>
            Avg: {formatValue(insights?.avg_co2, 0)} ppm | Peak: {formatValue(insights?.peak_co2, 0)} ppm
          </span>
        </div>
        <ul className="simple-list">
          {(insights?.recommendations ?? []).map((tip, index) => (
            <li key={`${tip}-${index}`}>{tip}</li>
          ))}
          {(!insights?.recommendations || insights.recommendations.length === 0) && (
            <li>Waiting for enough data to generate recommendations.</li>
          )}
        </ul>
      </section>

      <section className="analytics-panel rewards-coin-panel">
        <div className="analytics-header">
          <h2>3D Eco-Coin Rewards</h2>
          <span>Live incentive intelligence</span>
        </div>

        <div className="rewards-coin-layout">
          <div className="coin-vault">
            <div className="coin-tower">
              <span className="coin-layer l1" />
              <span className="coin-layer l2" />
              <span className="coin-layer l3" />
              <span className="coin-layer l4" />
            </div>
            <p>Total Reward Pool</p>
            <strong>{formatValue(rewardSummary?.total_points, 1)} pts</strong>
          </div>

          <div className="coin-analytics">
            <div className="coin-mini-stats">
              <article>
                <h4>Active Users</h4>
                <p>{rewardSummary?.active_users ?? 0}</p>
              </article>
              <article>
                <h4>Reward Events</h4>
                <p>{rewardSummary?.total_events ?? 0}</p>
              </article>
            </div>
            <ul className="simple-list">
              {topRewards.length === 0 && <li>No rewards assigned yet.</li>}
              {topRewards.map((entry, index) => (
                <li key={`${entry.name}-${index}`}>
                  {index + 1}. {entry.name} - {entry.points} pts
                </li>
              ))}
            </ul>
            <div className="coin-cta-row">
              <Link to="/app/rewards" className="game-btn">
                Open Rewards
              </Link>
              <Link to="/app/leaderboard" className="game-btn">
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
