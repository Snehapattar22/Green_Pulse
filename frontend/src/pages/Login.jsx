import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { reportUserLogin } from "../services/api";
import "../styles/Auth.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const user = credentials?.user;
      const resolvedName = user?.displayName || user?.email?.split("@")[0] || "Anonymous User";

      await reportUserLogin({
        user_name: resolvedName,
        email: user?.email || email,
        auth_provider: user?.providerData?.[0]?.providerId || "firebase-password",
      }).catch(() => {});

      navigate("/app", { replace: true });
    } catch (authError) {
      setError(authError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-page">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p>Log in to continue monitoring your GreenPulse data.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
        <p className="auth-switch">
          Admin? <Link to="/admin/login">Open Admin Panel</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
