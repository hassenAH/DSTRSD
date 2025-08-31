"use client";
import React from 'react';
import styles from './Popup.module.scss';
import BenefitsList from './BenefitsList';
import EmailSignup from './EmailSignup';


const Popup: React.FC = () => {
    const benefits = [
        'Early access',
        'Private sales',
        'Special gifts',
        'Personal invitations',
        'Exclusive content'
    ];

    const handleEmailSubmit = (email: string) => {
        console.log('Email submitted:', email);
        // Handle email submission logic here
    };

    return (
        <dialog
            className={styles.popup}
            role="dialog"
            aria-labelledby="popup-title"
            aria-modal="true"
            open
        >
            <div className={styles.container}>
                <header className={styles.headerContainer}>
                    <div className={styles.headerWrapper}>
                        <div className={styles.headerContent}>
                            <h1 id="popup-title">
                                Join the Pattern
                            </h1>
                        </div>
                    </div>
                </header>

                <section className={styles.benefitsContainer} aria-labelledby="benefits-heading">
                    <div className={styles.benefitsWrapper}>
                        <div className={styles.benefitsContent}>
                            <h2 id="benefits-heading">
                                Unlock now exclusive benefits:
                            </h2>
                            <BenefitsList benefits={benefits} />
                            <div className={styles.signupPrompt}>
                                <p>Sign up now don't miss out</p>
                            </div>
                        </div>
                    </div>
                </section>

                <EmailSignup onSubmit={handleEmailSubmit} />
            </div>

            <aside className={styles.imageContainer} aria-label="Pattern club promotional image">
                <img
                    src="https://api.builder.io/api/v1/image/assets/TEMP/bd847fe2b2de37b92bc6bc34d1f06f6866eed9fc?placeholderIfAbsent=true&apiKey=8dabbd16ae2444879aebbf55f5804723"
                    alt="Pattern club promotional image showing exclusive fashion content"
                    className={styles.heroImage}
                />
            </aside>
        </dialog>
    );
};

export default Popup;
