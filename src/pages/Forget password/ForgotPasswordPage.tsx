import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../SignIn/SignIn.module.scss";

export default function ForgotPasswordPage() {
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const [ok, setOk] = useState("");

    const isValidEmail = (v: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setOk("");

        if (!email || !isValidEmail(email)) {
            setError("Enter a valid email address.");
            return;
        }

        try {
            setSending(true);
            // TODO: replace with real API call
            await new Promise((res) => setTimeout(res, 700));

            setOk("We’ve sent a 6-digit code to your email.");
            // Pass email via state to OTP page
            nav("/verify-otp", { state: { email: email.trim() } });
        } catch (err) {
            setError("Couldn’t send the code. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className={styles.login}>
            <div className={styles.card}>
                <h1 className={styles.title}>Forgot password</h1>

                <form onSubmit={handleSubmit} noValidate>
                    {error && <p className={styles.error}>{error}</p>}
                    {ok && <p className={styles.ok}>{ok}</p>}

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

                    <button
                        type="submit"
                        className={styles.loginBtn}
                        disabled={sending}
                    >
                        {sending ? "Sending..." : "Send code"}
                    </button>

                    <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => nav("/login")}
                    >
                        ← Back to login
                    </button>
                </form>
            </div>
        </div>
    );
}
