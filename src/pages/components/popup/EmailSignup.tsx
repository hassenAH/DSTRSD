"use client";
import React, { useState } from 'react';
import styles from './EmailSignup.module.scss';

interface EmailSignupProps {
    onSubmit: (email: string) => void;
}

const EmailSignup: React.FC<EmailSignupProps> = ({ onSubmit }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email.trim()) {
            onSubmit(email);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    return (
        <form onSubmit={handleSubmit} aria-label="Email signup form">
            <div className={styles.emailContainer}>
                <div className={styles.emailWrapper}>
                    <div className={styles.emailInput}>
                        <div className={styles.emailInputContent}>
                            <label htmlFor="email-input" className="sr-only">
                                Enter your email address
                            </label>
                            <input
                                id="email-input"
                                type="email"
                                value={email}
                                onChange={handleInputChange}
                                placeholder="Enter your e-mail adress"
                                required
                                aria-required="true"
                                aria-describedby="email-disclaimer"
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    background: 'transparent',
                                    width: '100%',
                                    fontSize: 'inherit',
                                    color: 'inherit'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.disclaimerContainer}>
                <div className={styles.disclaimerWrapper}>
                    <div className={styles.disclaimerContent}>
                        <p id="email-disclaimer" className="sr-only">
                            Privacy notice: By signing up, you agree to receive marketing messages via email.
                        </p>
                        <small aria-hidden="true">
                            By signing up, you agree to receive marketing messages via email.
                        </small>
                    </div>
                </div>
            </div>

            <div className={styles.buttonContainer}>
                <div className={styles.buttonWrapper}>
                    <button
                        type="submit"
                        className={styles.joinButton}
                        aria-label="Join the Pattern club"
                    >
                        JOIN
                    </button>
                </div>
            </div>
        </form>
    );
};

export default EmailSignup;
