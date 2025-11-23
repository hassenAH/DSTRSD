"use client";
import * as React from "react";
import styles from "./SignUp.module.scss";

interface SignUpButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean; // 👈 new
}

function SignUpButton({
  onClick,
  disabled = false,
  loading = false,
}: SignUpButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <div className={styles.buttonWrapper}>
      <button
        className={`${styles.button} ${loading ? styles.buttonLoading : ""}`}
        onClick={onClick}
        disabled={isDisabled}
        type="submit"
        aria-label="Sign up for newsletter"
        aria-busy={loading}
      >
        <div className={styles.buttonContent}>
          {loading && <span className={styles.spinner} aria-hidden="true" />}
          <span>{loading ? "signing up..." : "sign up →"}</span>
        </div>
      </button>
    </div>
  );
}

export default SignUpButton;
