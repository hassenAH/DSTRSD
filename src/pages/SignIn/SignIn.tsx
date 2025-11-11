import { useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SignIn.module.scss";
import { useAuth } from "../../utils/AuthContext";
import heroSrc from "../../assets/images/login-hero.webp";

export default function SignInPage() {
  const nav = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const emailId = useId();
  const pwdId = useId();
  const rememberId = useId();

  const errorRef = useRef<HTMLParagraphElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const pwdInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, go straight to dashboard
  useEffect(() => {
    if (isAuthenticated) nav("/dashboard", { replace: true });
  }, [isAuthenticated, nav]);

  // Prefill email if saved
  useEffect(() => {
    const saved = localStorage.getItem("signin.email");
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  // Focus error message when it appears
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  const validate = () => {
    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();
    const emailOk =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) && trimmedEmail.length <= 254;

    if (!trimmedEmail || !emailOk) {
      setError("Please enter a valid email address.");
      emailInputRef.current?.focus();
      return false;
    }
    if (!trimmedPass || trimmedPass.length < 6) {
      setError("Password must be at least 6 characters.");
      pwdInputRef.current?.focus();
      return false;
    }
    setError("");
    return { email: trimmedEmail, password: trimmedPass };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const valid = validate();
    if (!valid) return;

    try {
      setSubmitting(true);

      // remember email locally
      if (remember) localStorage.setItem("signin.email", valid.email);
      else localStorage.removeItem("signin.email");

      // call AuthContext login (will throw on error)
      await login({ email: valid.email, password: valid.password, remember });

      // success → go to dashboard
      nav("/dashboard", { replace: true });
    } catch (err: any) {
      // show server message when available
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Login failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.login}>
      <div className={styles.split}>
        {/* Left image */}
        <div className={styles.left}>
          <img
            src={heroSrc}
            alt="Welcome"
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </div>

        {/* Right form */}
        <div className={styles.right}>
          <div className={styles.card}>
            <h1 className={styles.title}>Login</h1>

            <form onSubmit={handleSubmit} noValidate>
              {error && (
                <p ref={errorRef} className={styles.error} role="alert" tabIndex={-1}>
                  {error}
                </p>
              )}

              <label className={styles.field} htmlFor={emailId}>
                <span>Email</span>
                <input
                  id={emailId}
                  ref={emailInputRef}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                  inputMode="email"
                  spellCheck={false}
                  aria-invalid={!!error && !/^\S+@\S+\.\S+$/.test(email.trim())}
                  aria-describedby={error ? "signin-error" : undefined}
                />
              </label>

              <label className={styles.field} htmlFor={pwdId}>
                <span>Password</span>
                <input
                  id={pwdId}
                  ref={pwdInputRef}
                  type="password"
                  name="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  minLength={6}
                  aria-invalid={!!error && password.trim().length < 6}
                  aria-describedby={error ? "signin-error" : undefined}
                />
              </label>

              <p id="signin-error" className={styles.helper} aria-live="polite">
                {error ? "Check the fields above and try again." : "Use your work email and password."}
              </p>

              <div className={styles.extra}>
                <label className={styles.check} htmlFor={rememberId}>
                  <input
                    id={rememberId}
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    name="remember"
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

              <button
                type="submit"
                className={styles.loginBtn}
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? "Signing in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
