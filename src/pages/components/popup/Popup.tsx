"use client";
import React, { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import styles from "./Popup.module.scss";
import BenefitsList from "./BenefitsList";
import EmailSignup from "./EmailSignup";

// 3D
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

type Props = { onClose?: () => void };

function RotatingModel({ url, scale = 1 }: { url: string; scale?: number }) {
    const { scene } = useGLTF(url);
    const group = useRef<THREE.Group | null>(null);
    const s = useMemo(() => scale, [scale]);
    useFrame((_, delta) => {
        if (group.current) group.current.rotation.y += 0.6 * delta;
    });
    return (
        <group ref={group}>
            <primitive object={scene} scale={s} />
        </group>
    );
}
useGLTF.preload("/models/3.glb");

const Popup: React.FC<Props> = ({ onClose }) => {
    const ref = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        // show as a true modal (enables ::backdrop)
        if (ref.current && !ref.current.open) {
            ref.current.showModal();
        }
        return () => {
            try { ref.current?.close(); } catch { }
        };
    }, []);

    const handleClose = () => {
        try { ref.current?.close(); } catch { }
        onClose?.();
    };

    const benefits = [
        "Early access",
        "Private sales",
        "Special gifts",
        "Personal invitations",
        "Exclusive content",
    ];

    const handleEmailSubmit = (email: string) => {
        console.log("Email submitted:", email);
        // TODO: submit to your API
    };

    return (
        <dialog
            ref={ref}
            className={styles.popup}
            role="dialog"
            aria-labelledby="popup-title"
            aria-modal="true"
            onClose={onClose}
        >
            {/* Close button */}
            <button
                type="button"
                className={styles.closeBtn}
                aria-label="Close"
                onClick={handleClose}
            >
                {/* X icon (SVG) */}
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            {/* Left column: copy + form */}
            <div className={styles.container}>
                <header className={styles.headerContainer}>
                    <div className={styles.headerWrapper}>
                        <div className={styles.headerContent}>
                            <h1 id="popup-title">Join the Pattern</h1>
                        </div>
                    </div>
                </header>

                <section
                    className={styles.benefitsContainer}
                    aria-labelledby="benefits-heading"
                >
                    <div className={styles.benefitsWrapper}>
                        <div className={styles.benefitsContent}>
                            <h2 id="benefits-heading">Unlock now exclusive benefits:</h2>
                            <BenefitsList benefits={benefits} />
                            <div className={styles.signupPrompt}>
                                <p>Sign up now, don’t miss out</p>
                            </div>
                        </div>
                    </div>
                </section>

                <EmailSignup onSubmit={handleEmailSubmit} />
            </div>

            {/* Right column: 3D viewer */}
            <aside className={styles.modelContainer} aria-label="Pattern club 3D preview">
                <div className={styles.canvasWrap}>
                    <Canvas
                        dpr={[1, 1.8]}
                        gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
                        camera={{ fov: 35, position: [0.6, 0.5, 2.1] }}
                    >
                        <ambientLight intensity={0.9} />
                        <directionalLight position={[2, 3, 4]} intensity={0.9} />
                        <Suspense fallback={null}>
                            <RotatingModel url="/models/3.glb" scale={1} />
                        </Suspense>
                    </Canvas>
                </div>
            </aside>
        </dialog>
    );
};

export default Popup;
