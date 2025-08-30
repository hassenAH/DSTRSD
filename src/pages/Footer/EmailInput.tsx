"use client";
import * as React from "react";
import styles from './EmailInput.module.scss';

interface EmailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function EmailInput({ value, onChange, placeholder = "Email Address" }: EmailInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles.inputWrapper}>
      <div className={styles.inputContainer}>
        <input
          type="email"
          className={styles.input}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label="Email address"
        />
      </div>
    </div>
  );
}

export default EmailInput;
