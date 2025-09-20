import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../SignIn/SignIn.module.scss";

export default function ResetPasswordPage() {
    const nav = useNavigate();
    const location = useLocation() as { state?: { email?: string } };
    const email = location.state?.email ?? "";
    const [p1, setP1] = useState("");
    const [p2, setP2] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!p1 || p1.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (p1 !== p2) {
            setError("Passwords do not match.");
            return;
        }
        try {
            setSaving(true);
            // TODO: API call: reset password
            await new Promise((res) => setTimeout(res, 700));
            nav("/login");
        } catch {
            setError("Couldn’t reset password. Try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.login}>
            <div className={styles.card}>
                <h1 className={styles.title}>Set new password</h1>
                <p className={styles.helper}>For <b>{email || "your account"}</b></p>

                <form onSubmit={handleSubmit} noValidate>
                    {error && <p className={styles.error}>{error}</p>}

                    <label className={styles.field}>
                        <span>New password</span>
                        <input
                            type="password"
                            value={p1}
                            onChange={(e) => setP1(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </label>

                    <label className={styles.field}>
                        <span>Confirm password</span>
                        <input
                            type="password"
                            value={p2}
                            onChange={(e) => setP2(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </label>

                    <button type="submit" className={styles.loginBtn} disabled={saving}>
                        {saving ? "Saving..." : "Save password"}
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
