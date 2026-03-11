import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getGlobalLiveData } from "../services/api";
import "../styles/AppPages.css";

const PIE_COLORS = ["#7cf1c6", "#52c7ff", "#ffd27e"];

function Impact() {
  const [globalLive, setGlobalLive] = useState(null);
  const [trendSeries, setTrendSeries] = useState([]);
  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    const fetchImpactData = async () => {
      try {
        const globalRes = await getGlobalLiveData();
        const live = globalRes.data;
        setGlobalLive(live);
        setTrendSeries((live?.trend ?? []).map((point) => ({
          time: point.time,
          co2: Number(point.co2) || 0,
          aqi: Number(point.aqi) || 0,
          pm25: Number(point.pm25) || 0,
        })));
        setLastUpdated(new Date().toLocaleString());
      } catch (error) {
        console.log("Unable to load global visual analytics:", error);
      }
    };

    fetchImpactData();
    const interval = setInterval(fetchImpactData, 60000);
    return () => clearInterval(interval);
  }, []);

  const cityData = useMemo(() => globalLive?.cities ?? [], [globalLive]);

  const pieData = useMemo(() => {
    if (!cityData.length) {
      return [];
    }
    let good = 0;
    let moderate = 0;
    let high = 0;
    cityData.forEach((city) => {
      const aqi = Number(city.aqi_us) || 0;
      if (aqi <= 50) {
        good += 1;
      } else if (aqi <= 100) {
        moderate += 1;
      } else {
        high += 1;
      }
    });
    return [
      { name: "Good", value: good },
      { name: "Moderate", value: moderate },
      { name: "High", value: high },
    ];
  }, [cityData]);

  const cityAqiBars = useMemo(
    () =>
      cityData.map((city) => ({
        name: city.city,
        aqi: Number(city.aqi_us) || 0,
        pm25: Number(city.pm2_5) || 0,
      })),
    [cityData]
  );

  return (
    <section className="module-page impact-visual-page">
      <div className="module-hero impact-hero">
        <h1>Global Impact</h1>
        <p>Live Visual Analytics | Updated: {lastUpdated || "--"}</p>
        <div className="impact-hero-cta">
          <Link to="/app/heatmap" className="game-btn">
            Open Clickable Heatmap
          </Link>
        </div>
      </div>

      <div className="impact-kpi-row">
        <div className="impact-kpi">
          <span>Global CO2 ppm</span>
          <strong>{globalLive?.global_summary?.atmospheric_co2_estimate_ppm ?? "--"}</strong>
        </div>
        <div className="impact-kpi">
          <span>Avg AQI</span>
          <strong>{globalLive?.global_summary?.avg_aqi_us ?? "--"}</strong>
        </div>
        <div className="impact-kpi">
          <span>Avg PM2.5</span>
          <strong>{globalLive?.global_summary?.avg_pm2_5 ?? "--"}</strong>
        </div>
      </div>

      <div className="impact-chart-grid">
        <article className="module-card impact-chart impact-wide">
          <h3>Atmospheric CO2 and AQI Trend</h3>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={trendSeries}>
              <defs>
                <linearGradient id="co2Fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#73f2be" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#73f2be" stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(217,255,239,0.16)" />
              <XAxis dataKey="time" tick={{ fill: "#d8fff1", fontSize: 12 }} />
              <YAxis tick={{ fill: "#d8fff1", fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="co2" stroke="#73f2be" fill="url(#co2Fill)" strokeWidth={2.8} />
              <Line type="monotone" dataKey="aqi" stroke="#52c7ff" strokeWidth={2.4} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </article>

        <article className="module-card impact-chart">
          <h3>City AQI Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={92} innerRadius={52}>
                {pieData.map((item, index) => (
                  <Cell key={item.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="module-card impact-chart">
          <h3>City AQI Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={cityAqiBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(217,255,239,0.14)" />
              <XAxis dataKey="name" tick={{ fill: "#d8fff1", fontSize: 11 }} />
              <YAxis tick={{ fill: "#d8fff1", fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="aqi" fill="#52c7ff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="module-card impact-chart impact-wide">
          <h3>PM2.5 Live Trend by City</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cityAqiBars}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(217,255,239,0.14)" />
              <XAxis dataKey="name" tick={{ fill: "#d8fff1", fontSize: 12 }} />
              <YAxis tick={{ fill: "#d8fff1", fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="pm25" stroke="#ffd27e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </article>
      </div>
    </section>
  );
}

export default Impact;
