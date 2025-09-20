import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./SignIn.module.scss";
import { useAuth } from "../../utils/AuthContext";

export default function SignInPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const location = useLocation() as { state?: { from?: Location } };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setError("");
      setSubmitting(true);
      await login({ email, password, remember }); // <— Auth context
      const to = location.state?.from?.pathname ?? "/";
      nav(to, { replace: true });
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.card}>
        <h1 className={styles.title}>Login</h1>

        <form onSubmit={handleSubmit} noValidate>
          {error && <p className={styles.error}>{error}</p>}

          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <div className={styles.extra}>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <button
              type="button"
              className={styles.forgot}
              onClick={() => nav("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={submitting}>
            {submitting ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
