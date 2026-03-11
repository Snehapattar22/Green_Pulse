import { createContext, useContext, useMemo, useState } from "react";

const RewardContext = createContext(null);
const STORAGE_KEY = "greenpulse_rewards";

const defaultUsers = [
  { name: "Team Terra", points: 0 },
  { name: "EcoOps Guild", points: 0 },
  { name: "Green Spark", points: 0 },
  { name: "Clean Air Squad", points: 0 },
];

const loadInitialUsers = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return defaultUsers;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return defaultUsers;
    }
    return parsed;
  } catch {
    return defaultUsers;
  }
};

export function RewardProvider({ children }) {
  const [users, setUsers] = useState(loadInitialUsers);
  const [history, setHistory] = useState([]);

  const persistUsers = (nextUsers) => {
    setUsers(nextUsers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUsers));
  };

  const assignReward = ({ name, points }) => {
    const safeName = name.trim();
    const safePoints = Number(points);
    if (!safeName || Number.isNaN(safePoints) || safePoints <= 0) {
      return;
    }

    const existingUser = users.find((user) => user.name.toLowerCase() === safeName.toLowerCase());
    let nextUsers;

    if (existingUser) {
      nextUsers = users.map((user) =>
        user.name.toLowerCase() === safeName.toLowerCase()
          ? { ...user, points: user.points + safePoints }
          : user
      );
    } else {
      nextUsers = [...users, { name: safeName, points: safePoints }];
    }

    persistUsers(nextUsers);
    setHistory((prev) => [
      { name: safeName, points: safePoints, at: new Date().toISOString() },
      ...prev,
    ]);
  };

  const leaderboard = useMemo(
    () => [...users].sort((a, b) => b.points - a.points),
    [users]
  );

  return (
    <RewardContext.Provider value={{ users, leaderboard, history, assignReward }}>
      {children}
    </RewardContext.Provider>
  );
}

export function useRewards() {
  const context = useContext(RewardContext);
  if (!context) {
    throw new Error("useRewards must be used within RewardProvider");
  }
  return context;
}
