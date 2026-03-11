import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/api";
import "../styles/Auth.css";

const ADMIN_TOKEN_KEY = "greenpulse_admin_token";

function AdminLogin() {
  const navigate = useNavigate();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!passcode.trim()) {
      setError("Please enter admin passcode.");
      return;
    }

    setLoading(true);
    try {
      const response = await adminLogin(passcode.trim());
      localStorage.setItem(ADMIN_TOKEN_KEY, response.data.token);
      navigate("/admin/panel", { replace: true });
    } catch (apiError) {
      setError(apiError?.response?.data?.error ?? "Unable to login as admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Admin Panel</h1>
        <p>Control reward assignments and monitor reward operations.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-passcode">Passcode</label>
          <input
            id="admin-passcode"
            type="password"
            value={passcode}
            onChange={(event) => setPasscode(event.target.value)}
            placeholder="Enter admin passcode"
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Authenticating..." : "Enter Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
