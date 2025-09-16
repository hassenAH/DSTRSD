import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SignIn.module.scss";

export default function SignInPage() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(""); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    setError(""); 
    if (remember) localStorage.setItem("token", "demo-token");


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

          <button type="submit" className={styles.loginBtn}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
