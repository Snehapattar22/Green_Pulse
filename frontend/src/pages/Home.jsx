import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/Home.css";

function Home() {
  const [counter, setCounter] = useState(2880210);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const ticker = setInterval(() => {
      setCounter((prev) => prev + Math.floor(Math.random() * 16) + 5);
    }, 1200);

    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearInterval(ticker);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section className="home-page cinematic-home">
      <div
        className="parallax-green far"
        style={{ transform: `translate3d(0, ${scrollY * 0.08}px, 0)` }}
      />
      <div
        className="parallax-green mid"
        style={{ transform: `translate3d(0, ${scrollY * 0.14}px, 0)` }}
      />
      <div
        className="parallax-green near"
        style={{ transform: `translate3d(0, ${scrollY * 0.2}px, 0)` }}
      />

      <div className="floating-particles" />

      <div className="home-shell">
        <section className="hero-cinematic">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
          >
            <p className="home-kicker">GreenPulse Climate Intelligence</p>
            <h1>Monitor. Predict. Reduce. Earn.</h1>
            <p className="hero-sub">
              A smart climate platform that combines real-time environmental monitoring,
              AI-powered carbon prediction, and reward-based sustainability to help
              individuals and organizations reduce their carbon footprint.
            </p>

            <div className="hero-cta-row">
              <Link to="/app/dashboard" className="hero-btn primary">
                Open Dashboard
              </Link>
              <Link to="/app/rewards" className="hero-btn ghost">
                Go to Rewards
              </Link>
            </div>

            <div className="counter-glass">
              <span>{counter.toLocaleString()}</span>
              <p>kg CO2 monitored globally today</p>
            </div>
          </motion.div>

          <motion.div
            className="earth-stage"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.75, delay: 0.08 }}
          >
            <div className="orbit ring-a" />
            <div className="orbit ring-b" />
            <div className="orbit ring-c" />
            <div className="carbon-dot d1" />
            <div className="carbon-dot d2" />
            <div className="carbon-dot d3" />
            <div className="carbon-dot d4" />
            <div className="earth-webgl">
              <div className="earth-continent" />
            </div>
          </motion.div>
        </section>

        <section className="story-grid">
          <motion.article
            className="glass-card section-wide"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55 }}
          >
            <div className="section-copy">
              <p className="section-kicker">Smart IoT Monitoring</p>
              <h3>Live signals from distributed eco sensors.</h3>
              <p>
                Stream telemetry in seconds with smooth pulse indicators and
                edge-to-cloud reliability.
              </p>
            </div>
            <div className="section-visual iot-visual">
              <div className="iot-device">
                <span className="screen" />
              </div>
              <div className="signal-wave">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </motion.article>

          <motion.article
            className="glass-card section-wide reverse"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55 }}
          >
            <div className="section-copy">
              <p className="section-kicker">AI Prediction Engine</p>
              <h3>Interactive trend curves with confidence tracking.</h3>
              <p>
                Visualize predicted carbon spikes before they happen and trigger
                early mitigation actions.
              </p>
            </div>
            <div className="section-visual ai-visual">
              <svg viewBox="0 0 420 180" className="ai-graph">
                <polyline
                  points="12,152 72,120 130,130 188,92 246,79 308,58 368,38 408,25"
                  className="line"
                />
                <circle cx="308" cy="58" r="6" className="node" />
                <circle cx="368" cy="38" r="6" className="node delay" />
              </svg>
              <div className="scan-light" />
            </div>
          </motion.article>

          <motion.article
            className="glass-card"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55 }}
          >
            <p className="section-kicker">Rewards</p>
            <h3>3D eco-coin incentives</h3>
            <div className="coin-stack">
              <span className="coin c1" />
              <span className="coin c2" />
              <span className="coin c3" />
            </div>
            <Link to="/app/rewards" className="inline-link">
              Manage Rewards
            </Link>
          </motion.article>

          <motion.article
            className="glass-card"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55 }}
          >
            <p className="section-kicker">Gamification</p>
            <h3>Challenge previews that drive participation</h3>
            <div className="challenge-preview">
              <p>Eco Sprint Week</p>
              <div className="progress-track">
                <span />
              </div>
            </div>
            <Link to="/app/gamification" className="inline-link">
              Play Challenges
            </Link>
          </motion.article>

          <motion.article
            className="glass-card section-wide"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.55 }}
          >
            <div className="section-copy">
              <p className="section-kicker">Global Impact</p>
              <h3>Heatmap view of environmental outcomes.</h3>
              <p>
                Translate local actions into global signals with hotspot-based
                impact mapping.
              </p>
            </div>
            <div className="section-visual impact-visual">
              <div className="impact-globe">
                <span className="hot h1" />
                <span className="hot h2" />
                <span className="hot h3" />
              </div>
            </div>
            <Link to="/app/heatmap" className="inline-link">
              Open Live Heatmap
            </Link>
          </motion.article>
        </section>

        <div className="hero-cta-row footer-cta">
          <Link to="/app/leaderboard" className="hero-btn ghost">
            Open Leaderboard
          </Link>
          <Link to="/app/impact" className="hero-btn ghost">
            View Global Impact
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Home;
