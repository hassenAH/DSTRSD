import React, { useEffect, useRef } from "react";
import styles from "./AboutUs.module.scss";

type Block = {
    title: string;
    /** allow rich content (br, strong, etc.) */
    text: React.ReactNode;
};

type AboutUsProps = {
    logoSrc: string;
    imagePrimary: string;
    imageSecondary: string;
    heading?: string;
    subheading?: string;
    description1: Block;
    description2: Block;
    className?: string;
};

const useInView = <T extends HTMLElement>(threshold = 0.2) => {
    const ref = useRef<T | null>(null);
    useEffect(() => {
        if (!ref.current) return;
        const el = ref.current;
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) el.classList.add(styles._inView);
                });
            },
            { threshold }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [threshold]);
    return ref;
};

const useTilt = () => {
    const ref = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const node = ref.current;
        if (!node) return;
        const handle = (e: MouseEvent) => {
            const rect = node.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rx = ((y / rect.height) - 0.5) * -6;
            const ry = ((x / rect.width) - 0.5) * 10;
            node.style.setProperty("--rx", `${rx}deg`);
            node.style.setProperty("--ry", `${ry}deg`);
        };
        const reset = () => {
            node.style.setProperty("--rx", `0deg`);
            node.style.setProperty("--ry", `0deg`);
        };
        node.addEventListener("mousemove", handle);
        node.addEventListener("mouseleave", reset);
        return () => {
            node.removeEventListener("mousemove", handle);
            node.removeEventListener("mouseleave", reset);
        };
    }, []);
    return ref;
};

export default function AboutUs({
    logoSrc,
    imagePrimary,
    imageSecondary,
    heading = "About Us",
    subheading,
    description1,
    description2,
    className,
}: AboutUsProps) {
    const cardRef = useInView<HTMLElement>(0.25);
    const img1Ref = useInView<HTMLDivElement>(0.2);
    const img2Ref = useInView<HTMLDivElement>(0.2);
    const tilt1 = useTilt();
    const tilt2 = useTilt();

    return (
        <section className={`${styles.about} ${className ?? ""}`} aria-label="About our company">
            <div className={styles.aurora} aria-hidden />

            <header className={styles.header}>
                <img
                    src={logoSrc}
                    alt="Company logo"
                    className={styles.logo}
                    loading="eager"
                    decoding="async"
                />
                <div className={styles.titles}>
                    <h1 className={styles.heading}>{heading}</h1>
                    <p className={styles.subheading}>{subheading}</p>
                </div>
            </header>

            <div className={styles.gallery}>
                <div ref={img1Ref} className={`${styles.frame} ${styles.primary}`}>
                    <div ref={tilt1} className={styles.tiltWrap} style={{ transform: "rotateX(var(--rx)) rotateY(var(--ry))" }}>
                        <img src={imagePrimary} alt="Team at work" className={styles.photo} loading="lazy" />
                    </div>
                    <span className={styles.badge}>Since 2025</span>
                </div>

                <div ref={img2Ref} className={`${styles.frame} ${styles.secondary}`}>
                    <div ref={tilt2} className={styles.tiltWrap} style={{ transform: "rotateX(var(--rx)) rotateY(var(--ry))" }}>
                        <img src={imageSecondary} alt="Our culture & vibe" className={styles.photo} loading="lazy" />
                    </div>

                </div>
            </div>

            <article ref={cardRef} className={styles.card} role="article" aria-label="About content">
                {/* Description 1 (your snippet allowed with rich markup) */}
                <div className={styles.block}>


                    {/* Keep your original classes so you can paste your exact snippet if you want */}
                    <article className={styles.brandDescription}>
                        <p className={styles.descriptionText}>{description1.text}</p>
                        <p className={styles.descriptionText}>{description2.text}</p>
                    </article>

                </div>




            </article>
        </section>
    );
}



