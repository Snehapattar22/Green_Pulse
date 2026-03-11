import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

export const getLatestData = () => API.get("/latest");
export const getInsights = () => API.get("/insights");
export const getHistory = (limit = 60) => API.get(`/history?limit=${limit}`);

export const getRewardSummary = () => API.get("/rewards/summary");
export const getRewardHistory = (limit = 40) => API.get(`/rewards/history?limit=${limit}`);
export const getRewardLeaderboard = (limit = 20) => API.get(`/rewards/leaderboard?limit=${limit}`);

export const adminLogin = (passcode) => API.post("/admin/login", { passcode });
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

export const getGlobalLiveData = () => API.get("/global/live");
