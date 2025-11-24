import styles from "./ProductCard.module.scss";
import { useNavigate } from "react-router-dom";
import { KeyboardEvent } from "react";

interface ProductCardProps {
    image: string;
    name: string;
    price: string;
    className?: string;
    onClick?: () => void;            // (optional) custom handler
    onAddToBag?: () => void;
    cta?: "bar" | "button" | "none";
    disabled?: boolean;
    slug?: string;                   // <-- add this
}

export default function ProductCard({
    image,
    name,
    price,
    className = "",
    onClick,
    onAddToBag,
    cta = "bar",
    disabled = false,
    slug,
}: ProductCardProps) {
    const nav = useNavigate();

    const goToDetails = () => {
        if (onClick) return onClick();
        if (slug) nav(`/products/${slug}`);
    };

    const onKey = (e: KeyboardEvent<HTMLElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            goToDetails();
        }
    };

    return (
        <article
            className={`${styles.productCard} ${className}`}
            onClick={goToDetails}
            onKeyDown={onKey}
            tabIndex={0}
            role="button"
            aria-label={`${name}, ${price}`}
        >
            <div className={styles.productCard__media}>
                <img
                    src={image}
                    alt={name}
                    className={styles.productCard__image}
                    loading="lazy"
                    decoding="async"
                />

                <div className={styles.productCard__overlay} />
                <div className={styles.productCard__actions}>
                    <button
                        type="button"
                        className={styles.productCard__quick}
                        onClick={(e) => {
                            e.stopPropagation();
                            goToDetails();
                        }}
                    >
                        QUICK VIEW
                    </button>
                </div>
            </div>

            <footer className={styles.productCard__info}>
                <span className={styles.productCard__name} title={name}>
                    {name}
                </span>

                {cta === "bar" && (
                    <div
                        className={styles.productCard__bar}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className={styles.productCard__barPrice}>{price}</span>
                        <button
                            type="button"
                            className={styles.productCard__barBtn}
                            onClick={onAddToBag}
                            disabled={disabled}
                            aria-label={`Add ${name} to bag for ${price}`}
                        >
                            Add to bag
                        </button>
                    </div>
                )}

                {cta === "button" && (
                    <button
                        type="button"
                        className={styles.productCard__inlineBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToBag?.();
                        }}
                        disabled={disabled}
                        aria-label={`Add ${name} to bag for ${price}`}
                    >
                        Add to bag · <strong>{price}</strong>
                    </button>
                )}

                {cta === "none" && (
                    <span className={styles.productCard__price}>{price} TND</span>
                )}
            </footer>
        </article>
    );
}
