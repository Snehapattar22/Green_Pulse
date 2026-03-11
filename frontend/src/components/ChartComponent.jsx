import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function ChartComponent({ co2, series = [] }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (series.length > 0) {
      const points = series.map((item) => ({
        time: new Date(item.timestamp).toLocaleTimeString([], { hour12: false }),
        value: Number(item.co2),
      }));
      setChartData(points.slice(-30));
      return;
    }

    if (!Number.isFinite(co2)) {
      return;
    }

    setChartData((prev) => [
      ...prev.slice(-11),
      { time: new Date().toLocaleTimeString([], { hour12: false }), value: Number(co2) },
    ]);
  }, [co2, series]);

  return (
    <div className="co2-chart-wrap">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={chartData}
          margin={{ top: 12, right: 12, left: -12, bottom: 6 }}
        >
          <defs>
            <linearGradient id="co2Line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#73f2be" />
              <stop offset="100%" stopColor="#23a0d9" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(218, 255, 241, 0.14)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "rgba(236, 255, 248, 0.78)", fontSize: 12 }}
            tickMargin={10}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(236, 255, 248, 0.78)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <ReferenceLine y={800} stroke="rgba(115, 242, 190, 0.55)" strokeDasharray="4 4" />
          <ReferenceLine y={1200} stroke="rgba(255, 168, 84, 0.7)" strokeDasharray="4 4" />
          <Tooltip
            contentStyle={{
              background: "rgba(8, 30, 42, 0.9)",
              border: "1px solid rgba(122, 239, 198, 0.38)",
              borderRadius: "10px",
              color: "#ecfff8",
            }}
            formatter={(value) => [`${value} ppm`, "CO2"]}
            labelStyle={{ color: "#b9ffe3" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#co2Line)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, stroke: "#73f2be", strokeWidth: 2, fill: "#0d2d2d" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ChartComponent;
