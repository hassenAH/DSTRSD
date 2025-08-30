"use client";
import * as React from "react";
import styles from "./Footer.module.scss";
import EmailInput from "./EmailInput";
import SignUpButton from "./SignUpButton";

export default function Footer() {
  const [email, setEmail] = React.useState("");

  const handleEmailChange = (value: string) => setEmail(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      console.log("Footer signup:", email);
      setEmail("");
    }
  };

  const handleSignUpClick = () => {
    if (email.trim()) {
      console.log("Footer signup:", email);
      setEmail("");
    }
  };

  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <form className={styles.formContainer} onSubmit={handleSubmit}>
            <span className={styles.heading}>NEWSLETTER</span>
            <EmailInput
              value={email}
              onChange={handleEmailChange}
              placeholder="Email Address"
            />
            <SignUpButton
              onClick={handleSignUpClick}
              disabled={!email.trim()}
            />
          </form>
        </div>
      </footer>

      
      <div className={styles.copyrightContainer}>
        <div className={styles.container}>
          <p className={styles.copyrightText}>
            <span className={styles.regularText}>© 2025, </span>
            <span className={styles.boldText}>Distressed</span>
            <span className={styles.regularText}>. Made in Tunisia</span>
          </p>
        </div>
      </div>
    </>
  );
}
