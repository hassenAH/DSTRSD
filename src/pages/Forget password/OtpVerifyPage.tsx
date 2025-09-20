import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../SignIn/SignIn.module.scss";

const CODE_LEN = 6;
const RESEND_SECONDS = 30;

export default function OtpVerifyPage() {
    const nav = useNavigate();
    const location = useLocation() as { state?: { email?: string } };
    const email = location.state?.email ?? "";

    const [code, setCode] = useState<string[]>(Array(CODE_LEN).fill(""));
    const [error, setError] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [resendLeft, setResendLeft] = useState(RESEND_SECONDS);

    const inputsRef = useRef<Array<HTMLInputElement | null>>(
        Array(CODE_LEN).fill(null)
    );

    // countdown for resend
    useEffect(() => {
        if (resendLeft <= 0) return;
        const t = setInterval(() => setResendLeft((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [resendLeft]);

    const value = useMemo(() => code.join(""), [code]);

    const onChangeCell = (i: number, v: string) => {
        setError("");
        const next = [...code];
        const char = v.replace(/\D/g, "").slice(-1); // digits only
        next[i] = char ?? "";
        setCode(next);

        if (char && i < CODE_LEN - 1) {
            inputsRef.current[i + 1]?.focus();
        }
    };

    const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[i] && i > 0) {
            inputsRef.current[i - 1]?.focus();
        }
        if (e.key === "ArrowLeft" && i > 0) inputsRef.current[i - 1]?.focus();
        if (e.key === "ArrowRight" && i < CODE_LEN - 1) inputsRef.current[i + 1]?.focus();
    };

    const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LEN);
        if (!text) return;
        e.preventDefault();
        const next = Array(CODE_LEN).fill("");
        for (let i = 0; i < text.length; i++) next[i] = text[i];
        setCode(next);
        // focus last filled
        const idx = Math.min(text.length, CODE_LEN) - 1;
        if (idx >= 0) inputsRef.current[idx]?.focus();
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (value.length !== CODE_LEN) {
            setError(`Enter the ${CODE_LEN}-digit code.`);
            return;
        }

        try {
            setVerifying(true);
            // TODO: replace with real API call
            await new Promise((res) => setTimeout(res, 700));

            // On success → navigate to set new password (or back to login)
            nav("/reset-password", { state: { email } }); // if you have a reset page
            // Or: nav("/login");
        } catch (err) {
            setError("Invalid or expired code. Try again.");
        } finally {
            setVerifying(false);
        }
    };

    const resend = async () => {
        if (resendLeft > 0) return;
        try {
            setResendLeft(RESEND_SECONDS);
            // TODO: call API to resend code
            await new Promise((res) => setTimeout(res, 500));
        } catch {
            setError("Couldn’t resend code. Please try later.");
            setResendLeft(0);
        }
    };

    return (
        <div className={styles.login}>
            <div className={styles.card}>
                <h1 className={styles.title}>Verify code</h1>
                <p className={styles.helper}>
                    Enter the 6-digit code sent to <b>{email || "your email"}</b>.
                </p>

                <form onSubmit={handleVerify} noValidate>
                    {error && <p className={styles.error}>{error}</p>}

                    <div className={styles.codeRow} onPaste={onPaste}>
                        {Array.from({ length: CODE_LEN }).map((_, i) => (
                            <input
                                key={i}
                                ref={(el: HTMLInputElement | null) => {
                                    inputsRef.current[i] = el; // <— statement, returns void
                                }}
                                className={styles.codeCell}
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={1}
                                value={code[i]}
                                onChange={(e) => onChangeCell(i, e.target.value)}
                                onKeyDown={(e) => onKeyDown(i, e)}
                                aria-label={`Digit ${i + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className={styles.loginBtn}
                        disabled={verifying}
                    >
                        {verifying ? "Verifying..." : "Verify"}
                    </button>

                    <div className={styles.resendRow}>
                        <button
                            type="button"
                            className={styles.linkBtn}
                            disabled={resendLeft > 0}
                            onClick={resend}
                        >
                            {resendLeft > 0 ? `Resend in ${resendLeft}s` : "Resend code"}
                        </button>

                        <button
                            type="button"
                            className={styles.linkBtn}
                            onClick={() => nav("/forgot-password")}
                        >
                            Change email
                        </button>
                    </div>

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
