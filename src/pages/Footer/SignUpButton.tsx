"use client";
import * as React from "react";
import styles from "./SignUp.module.scss";

interface SignUpButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

function SignUpButton({ onClick, disabled = false }: SignUpButtonProps) {
  return (
    <div className={styles.buttonWrapper}>
      <button
        className={styles.button}
        onClick={onClick}
        disabled={disabled}
        type="submit"
        aria-label="Sign up for newsletter"
      >
        <div className={styles.buttonContent}>
          <span>sign up →</span>
        </div>
      </button>
    </div>
  );
}

export default SignUpButton;
