import { useEffect, useMemo, useState } from "react";
import "../styles/AppPages.css";

const QUIZ = [
  {
    question: "Which action usually lowers daily carbon footprint the most?",
    options: ["Using public transport", "Leaving lights on", "Longer AC runtime"],
    answer: 0,
  },
  {
    question: "What is a strong habit for office energy savings?",
    options: ["Keep monitors on overnight", "Enable sleep mode", "Print every draft"],
    answer: 1,
  },
  {
    question: "Best quick step to reduce indoor CO2 build-up?",
    options: ["Close all vents", "Increase ventilation", "Disable sensors"],
    answer: 1,
  },
];

const TRASH_ITEMS = [
  { label: "Plastic Bottle", type: "recycle" },
  { label: "Banana Peel", type: "compost" },
  { label: "Newspaper", type: "recycle" },
  { label: "Tea Bag", type: "compost" },
];

const MEMORY_ITEMS = ["Leaf", "Leaf", "Sun", "Sun", "Tree", "Tree"];
const GAME_STATS_KEY = "greenpulse_game_stats_v2";

const loadStats = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(GAME_STATS_KEY) || "{}");
    return {
      xp: Number(parsed.xp) || 0,
      streak: Number(parsed.streak) || 0,
      bestTap: Number(parsed.bestTap) || 0,
      completed: Number(parsed.completed) || 0,
    };
  } catch {
    return { xp: 0, streak: 0, bestTap: 0, completed: 0 };
  }
};

function Gamification() {
  const [selectedGame, setSelectedGame] = useState("");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [sortScore, setSortScore] = useState(0);
  const [sortDone, setSortDone] = useState(false);

  const [tapScore, setTapScore] = useState(0);
  const [tapTime, setTapTime] = useState(10);
  const [tapRunning, setTapRunning] = useState(false);

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryDone, setMemoryDone] = useState(false);

  const [stats, setStats] = useState(loadStats);

  useEffect(() => {
    localStorage.setItem(GAME_STATS_KEY, JSON.stringify(stats));
  }, [stats]);

  const activeItem = TRASH_ITEMS[activeItemIndex];
  const quizStep = quizDone ? QUIZ.length : quizIndex + 1;
  const quizProgress = useMemo(() => (quizStep / QUIZ.length) * 100, [quizStep]);
  const sortStep = sortDone ? TRASH_ITEMS.length : activeItemIndex + 1;
  const sortProgress = useMemo(() => (sortStep / TRASH_ITEMS.length) * 100, [sortStep]);
  const tapProgress = useMemo(() => ((10 - tapTime) / 10) * 100, [tapTime]);

  useEffect(() => {
    if (!tapRunning) {
      return undefined;
    }
    const interval = setInterval(() => {
      setTapTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTapRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [tapRunning]);

  useEffect(() => {
    if (!memoryDone && matched.length === MEMORY_ITEMS.length) {
      setMemoryDone(true);
      addGameProgress(45);
    }
  }, [matched, memoryDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const addGameProgress = (xpGain) => {
    setStats((prev) => ({
      ...prev,
      xp: prev.xp + xpGain,
      streak: prev.streak + 1,
      completed: prev.completed + 1,
    }));
  };

  const answerQuiz = (optionIndex) => {
    if (quizDone) {
      return;
    }
    if (optionIndex === QUIZ[quizIndex].answer) {
      setQuizScore((prev) => prev + 1);
    }
    if (quizIndex === QUIZ.length - 1) {
      setQuizDone(true);
      addGameProgress(30 + (optionIndex === QUIZ[quizIndex].answer ? 10 : 0));
      return;
    }
    setQuizIndex((prev) => prev + 1);
  };

  const resetQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizDone(false);
  };

  const sortItem = (binType) => {
    if (sortDone) {
      return;
    }
    if (binType === activeItem.type) {
      setSortScore((prev) => prev + 1);
    }
    if (activeItemIndex === TRASH_ITEMS.length - 1) {
      setSortDone(true);
      addGameProgress(25 + (binType === activeItem.type ? 10 : 0));
      return;
    }
    setActiveItemIndex((prev) => prev + 1);
  };

  const resetSortGame = () => {
    setActiveItemIndex(0);
    setSortScore(0);
    setSortDone(false);
  };

  const startTapGame = () => {
    setTapScore(0);
    setTapTime(10);
    setTapRunning(true);
  };

  const tapLeaf = () => {
    if (!tapRunning || tapTime === 0) {
      return;
    }
    setTapScore((prev) => prev + 1);
  };

  useEffect(() => {
    if (tapTime === 0 && !tapRunning) {
      setStats((prev) => ({
        ...prev,
        bestTap: Math.max(prev.bestTap, tapScore),
      }));
      addGameProgress(15 + Math.min(20, Math.floor(tapScore / 2)));
    }
  }, [tapTime, tapRunning]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetMemory = () => {
    const shuffled = [...MEMORY_ITEMS]
      .map((value, index) => ({ id: `${value}-${index}`, value }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMemoryMoves(0);
    setMemoryDone(false);
  };

  const flipCard = (cardId) => {
    if (flipped.includes(cardId) || matched.includes(cardId) || flipped.length === 2) {
      return;
    }
    const nextFlipped = [...flipped, cardId];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryMoves((prev) => prev + 1);
      const first = cards.find((card) => card.id === nextFlipped[0]);
      const second = cards.find((card) => card.id === nextFlipped[1]);

      if (first?.value === second?.value) {
        setMatched((prev) => [...prev, ...nextFlipped]);
        setTimeout(() => setFlipped([]), 180);
      } else {
        setTimeout(() => setFlipped([]), 600);
      }
    }
  };

  const openGame = (gameName) => {
    setSelectedGame(gameName);
    if (gameName === "memory" && cards.length === 0) {
      resetMemory();
    }
  };

  const closeGame = () => {
    setSelectedGame("");
  };

  const badges = [
    stats.completed >= 3 ? "Starter" : "",
    stats.bestTap >= 20 ? "Rapid Leaf" : "",
    stats.xp >= 120 ? "Eco Pro" : "",
  ].filter(Boolean);

  return (
    <section className="module-page gamification-page">
      <div className="module-hero game-hero">
        <div>
          <h1>Eco Arcade</h1>
          <p>Play in challenge mode, build streaks, and unlock eco skill badges.</p>
        </div>
        <div className="hero-pill">4 Mini Games</div>
      </div>

      <div className="module-grid game-stats-grid">
        <article className="module-card">
          <h3>XP</h3>
          <p>{stats.xp}</p>
        </article>
        <article className="module-card">
          <h3>Streak</h3>
          <p>{stats.streak}</p>
        </article>
        <article className="module-card">
          <h3>Best Tap Score</h3>
          <p>{stats.bestTap}</p>
        </article>
        <article className="module-card">
          <h3>Badges</h3>
          <p>{badges.length ? badges.join(", ") : "No badges yet"}</p>
        </article>
      </div>

      {!selectedGame && (
        <div className="module-grid game-choice-grid game-choice-square">
          <article className="module-card game-picker-card game-card-quiz">
            <span className="game-tag">Knowledge</span>
            <h3>Eco Quiz</h3>
            <p>Answer quick sustainability questions.</p>
            <button type="button" className="game-btn" onClick={() => openGame("quiz")}>
              Start Quiz
            </button>
          </article>
          <article className="module-card game-picker-card game-card-sorter">
            <span className="game-tag">Recycling</span>
            <h3>Waste Sorter</h3>
            <p>Place each item in the right bin.</p>
            <button type="button" className="game-btn" onClick={() => openGame("sorter")}>
              Start Sorting
            </button>
          </article>
          <article className="module-card game-picker-card game-card-tap">
            <span className="game-tag">Reflex</span>
            <h3>Leaf Tap Sprint</h3>
            <p>Tap fast for 10 seconds and beat your record.</p>
            <button type="button" className="game-btn" onClick={() => openGame("tap")}>
              Start Sprint
            </button>
          </article>
          <article className="module-card game-picker-card game-card-memory">
            <span className="game-tag">Focus</span>
            <h3>Eco Memory Match</h3>
            <p>Match eco symbols in minimum moves.</p>
            <button type="button" className="game-btn" onClick={() => openGame("memory")}>
              Start Match
            </button>
          </article>
        </div>
      )}

      {selectedGame && (
        <div className="module-grid single-game-grid">
          <article className="module-card game-play-card">
            <button type="button" className="game-back-btn" onClick={closeGame}>
              Back to game dashboard
            </button>

            {selectedGame === "quiz" && (
              <>
                <div className="game-top-row">
                  <h3>Eco Quiz</h3>
                  <span className="score-chip">Score {quizScore}</span>
                </div>
                <div className="progress-row game-progress">
                  <span style={{ width: `${quizProgress}%` }} />
                </div>
                {!quizDone && (
                  <>
                    <p className="game-question">Q{quizStep}: {QUIZ[quizIndex].question}</p>
                    <div className="game-actions">
                      {QUIZ[quizIndex].options.map((option, index) => (
                        <button key={option} type="button" className="game-btn" onClick={() => answerQuiz(index)}>
                          {option}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {quizDone && (
                  <div className="game-result">
                    <p>You scored {quizScore} / {QUIZ.length}</p>
                    <button type="button" className="game-btn" onClick={resetQuiz}>
                      Play Quiz Again
                    </button>
                  </div>
                )}
              </>
            )}

            {selectedGame === "sorter" && (
              <>
                <div className="game-top-row">
                  <h3>Waste Sorter</h3>
                  <span className="score-chip">Correct {sortScore}</span>
                </div>
                <div className="progress-row game-progress">
                  <span style={{ width: `${sortProgress}%` }} />
                </div>
                {!sortDone && (
                  <>
                    <p className="game-question">Sort: {activeItem.label}</p>
                    <div className="game-actions two-col">
                      <button type="button" className="game-btn" onClick={() => sortItem("recycle")}>
                        Recycle Bin
                      </button>
                      <button type="button" className="game-btn" onClick={() => sortItem("compost")}>
                        Compost Bin
                      </button>
                    </div>
                  </>
                )}
                {sortDone && (
                  <div className="game-result">
                    <p>Correct sorts: {sortScore} / {TRASH_ITEMS.length}</p>
                    <button type="button" className="game-btn" onClick={resetSortGame}>
                      Restart Sorter
                    </button>
                  </div>
                )}
              </>
            )}

            {selectedGame === "tap" && (
              <>
                <div className="game-top-row">
                  <h3>Leaf Tap Sprint</h3>
                  <span className="score-chip">Score {tapScore}</span>
                </div>
                <div className="progress-row game-progress">
                  <span style={{ width: `${tapProgress}%` }} />
                </div>
                <p className="tap-caption">Tap the leaf as many times as possible in 10 seconds.</p>
                <div className="tap-game">
                  <button type="button" className={`leaf-btn${tapRunning ? " live" : ""}`} onClick={tapLeaf}>
                    Tap
                  </button>
                  <div className="tap-stats">
                    <p>Time: <strong>{tapTime}s</strong></p>
                    <p>Score: <strong>{tapScore}</strong></p>
                  </div>
                </div>
                <button type="button" className="game-btn" onClick={startTapGame}>
                  {tapRunning ? "Restart Sprint" : "Start Sprint"}
                </button>
              </>
            )}

            {selectedGame === "memory" && (
              <>
                <div className="game-top-row">
                  <h3>Eco Memory Match</h3>
                  <span className="score-chip">Moves {memoryMoves}</span>
                </div>
                <div className="memory-grid">
                  {cards.map((card) => {
                    const show = flipped.includes(card.id) || matched.includes(card.id);
                    return (
                      <button
                        type="button"
                        key={card.id}
                        className={`memory-card${show ? " open" : ""}`}
                        onClick={() => flipCard(card.id)}
                      >
                        {show ? card.value : "?"}
                      </button>
                    );
                  })}
                </div>
                <div className="game-actions two-col">
                  <button type="button" className="game-btn" onClick={resetMemory}>
                    Reset Match
                  </button>
                  {memoryDone && <span className="score-chip">Completed</span>}
                </div>
              </>
            )}
          </article>
        </div>
      )}
    </section>
  );
}

export default Gamification;
