// src/components/Popup.tsx (or whatever path)
// adjust imports according to your structure

import React, { useEffect, useRef, Suspense, useMemo, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { toast } from "react-hot-toast";
// ⚠️ adjust path
import "./Popup.scss";
import { useSubscribers } from "../../../utils/SubscriberContext";

type PopupProps = {
    onClose?: () => void;
};

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
useGLTF.preload("/models/logo.glb");

const Popup: React.FC<PopupProps> = ({ onClose }) => {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const { subscribe } = useSubscribers(); // ✅ use context
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (dialogRef.current && !dialogRef.current.open) {
            dialogRef.current.showModal();
        }
        return () => {
            try {
                dialogRef.current?.close();
            } catch { }
        };
    }, []);

    const handleClose = () => {
        try {
            dialogRef.current?.close();
        } catch { }
        onClose?.();
    };

    const benefits = [
        "Early access",
        "Exclusive content",
        "Special offers",
        "Personal invitation",
    ];

    const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;

        const formData = new FormData(e.currentTarget);
        const email = String(formData.get("email") || "").trim();
        if (!email) return;

        try {
            setIsSubmitting(true);
            // 🔥 call backend via context
            await subscribe(email);
            handleClose();
            // success → toast + close
            toast.success("You’re in. Check your inbox soon.");


        } catch (err: any) {
            console.error(err);
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to subscribe. Please try again.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <dialog ref={dialogRef} className="popup" onClose={onClose}>
            <button className="popup__close" onClick={handleClose} aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </svg>
            </button>

            <div className="popup__content">
                {/* LEFT SIDE */}
                <div className="popup__left">
                    <h1 className="popup__title">Join the Pattern</h1>
                    <h2 className="popup__subtitle">Unlock exclusive benefits:</h2>
                    <ul className="popup__benefits">
                        {benefits.map((b, i) => (
                            <li key={i}>{b}</li>
                        ))}
                    </ul>

                    <p className="popup__text">Sign up now, don’t miss out.</p>

                    <form className="popup__form" onSubmit={handleEmailSubmit}>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email address"
                            required
                        />
                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Joining..." : "Join"}
                        </button>
                        <small className="popup__disclaimer">
                            By signing up, you agree to receive marketing messages via email.
                        </small>
                    </form>
                </div>

                {/* RIGHT SIDE - 3D Model */}
                <div className="popup__right">
                    <Canvas
                        dpr={[1, 1.8]}
                        gl={{
                            antialias: true,
                            powerPreference: "high-performance",
                            alpha: true,
                        }}
                        camera={{ fov: 35, position: [0.6, 0.5, 2.1] }}
                    >
                        <ambientLight intensity={0.9} />
                        <directionalLight position={[2, 3, 4]} intensity={0.9} />
                        <Suspense fallback={null}>
                            <RotatingModel url="/models/Logo.glb" scale={2} />
                        </Suspense>
                    </Canvas>
                </div>
            </div>
        </dialog>
    );
};

export default Popup;
