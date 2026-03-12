import axios from "axios";

const trimTrailingSlashes = (value) => value.replace(/\/+$/, "");

// Detect correct backend URL
const resolveApiBaseUrl = () => {
  const envBase = import.meta.env.VITE_API_BASE_URL;

  // If environment variable is provided
  if (envBase && envBase.trim()) {
    const normalized = trimTrailingSlashes(envBase.trim());
    return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
  }

  // Local development
  if (import.meta.env.DEV) {
    return "http://localhost:5000/api";
  }

  // Production (Render backend)
  return "https://green-pulse-rfsb.onrender.com/api";
};

const API = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000,
});

/* ================= SENSOR DATA ================= */

export const getLatestData = () => API.get("/latest");
export const getInsights = () => API.get("/insights");
export const getHistory = (limit = 60) =>
  API.get(`/history?limit=${limit}`);

/* ================= REWARDS ================= */

export const getRewardSummary = () =>
  API.get("/rewards/summary");

export const getRewardHistory = (limit = 40) =>
  API.get(`/rewards/history?limit=${limit}`);

export const getRewardLeaderboard = (limit = 20) =>
  API.get(`/rewards/leaderboard?limit=${limit}`);

/* ================= ADMIN ================= */

export const adminLogin = (passcode) =>
  API.post("/admin/login", { passcode });

export const adminAssignReward = (payload, token) =>
  API.post("/admin/rewards", payload, {
    headers: { "X-Admin-Token": token },
  });

export const adminGetHistory = (token, limit = 100) =>
  API.get(`/admin/rewards/history?limit=${limit}`, {
    headers: { "X-Admin-Token": token },
  });

export const adminGetUsers = (token, limit = 100) =>
  API.get(`/admin/users?limit=${limit}`, {
    headers: { "X-Admin-Token": token },
  });

export const adminGetUserActivity = (token, userName, limit = 80) =>
  API.get(`/admin/users/${encodeURIComponent(userName)}/activity?limit=${limit}`, {
    headers: { "X-Admin-Token": token },
  });

/* ================= AUTH ================= */

export const reportUserLogin = (payload) =>
  API.post("/auth/login-activity", payload);

/* ================= GLOBAL DATA ================= */

export const getGlobalLiveData = () =>
  API.get("/global/live");