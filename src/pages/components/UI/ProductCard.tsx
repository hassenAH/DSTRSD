import styles from "./ProductCard.module.scss";

interface ProductCardProps {
    image: string;
    name: string;
    price: string;
    className?: string;
    onClick?: () => void;           // Quick View / card click
    onAddToBag?: () => void;        // Add-to-bag action
    cta?: "bar" | "button" | "none"; // default = "bar"
    disabled?: boolean;             // disable CTA
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
}: ProductCardProps) {
    return (
        <article
            className={`${styles.productCard} ${className}`}
            onClick={onClick}
            tabIndex={0}
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

                {/* Hover/Focus overlay + Quick View (kept from previous) */}
                <div className={styles.productCard__overlay} />
                <div className={styles.productCard__actions}>
                    <button
                        type="button"
                        className={styles.productCard__quick}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick?.();
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

                {/* Variant A: bottom bar with price + CTA */}
                {cta === "bar" && (
                    <div className={styles.productCard__bar} onClick={(e) => e.stopPropagation()}>
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

                {/* Variant B: inline button (price on right text) */}
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

                {/* Variant C: none → show price as plain text */}
                {cta === "none" && <span className={styles.productCard__price}>{price}</span>}
            </footer>
        </article>
    );
}
