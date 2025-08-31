import { useEffect, useMemo, useRef } from "react";
import styles from "./Cart.module.scss";

export type CartItem = {
    id: string | number;
    name: string;
    image: string;
    price: number;   // in your currency units
    size?: string;   // e.g. "SMALL"
    qty: number;
};

type CartProps = {
    isOpen: boolean;
    items: CartItem[];
    currency?: string; // default: "$"
    taxRate?: number;  // e.g. 0.0 .. 0.2
    shipping?: number; // flat shipping
    onClose: () => void;
    onCheckout?: (summary: {
        subtotal: number; tax: number; shipping: number; total: number; items: CartItem[];
    }) => void;
    onUpdateQty: (id: CartItem["id"], qty: number) => void;
    onRemove: (id: CartItem["id"]) => void;
};

export default function Cart({
    isOpen,
    items,
    currency = "DT",
    taxRate = 0,
    shipping = 0,
    onClose,
    onCheckout,
    onUpdateQty,
    onRemove,
}: CartProps) {
    const panelRef = useRef<HTMLDivElement>(null);
    const prevActiveRef = useRef<HTMLElement | null>(null);

    // Totals
    const { subtotal, tax, total } = useMemo(() => {
        const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
        const tax = Math.max(0, Math.round(subtotal * taxRate * 100) / 100);
        const total = Math.round((subtotal + tax + shipping) * 100) / 100;
        return { subtotal, tax, total };
    }, [items, taxRate, shipping]);

    // Open/close side effects: focus + ESC + scroll lock
    useEffect(() => {
        const body = document.body;
        if (isOpen) {
            prevActiveRef.current = (document.activeElement as HTMLElement) ?? null;
            body.style.overflow = "hidden";
            // focus panel
            setTimeout(() => panelRef.current?.focus(), 0);
        } else {
            body.style.overflow = "";
            prevActiveRef.current?.focus?.();
        }
        return () => { body.style.overflow = ""; };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    const fmt = (n: number) => `${n.toFixed(2)} ${currency}`;

    return (
        <div className={`${styles.cart} ${isOpen ? styles.open : ""}`} aria-hidden={!isOpen}>
            {/* Overlay */}
            <button
                className={styles.overlay}
                aria-label="Close cart"
                onClick={onClose}
            />

            {/* Panel */}
            <aside
                className={styles.panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby="cart-title"
                tabIndex={-1}
                ref={panelRef}
            >
                <header className={styles.header}>
                    <h2 id="cart-title" className={styles.title}>Your bag</h2>
                    <button className={styles.close} onClick={onClose} aria-label="Close">×</button>
                </header>

                <div className={styles.content}>
                    {items.length === 0 ? (
                        <div className={styles.empty}>
                            <p className={styles.emptyTitle}>Your bag is empty</p>
                            <p className={styles.emptySub}>Add products to see them here.</p>
                            <button className={styles.browse} onClick={onClose}>Continue shopping</button>
                        </div>
                    ) : (
                        <ul className={styles.list}>
                            {items.map((item) => (
                                <li key={item.id} className={styles.row}>
                                    <div className={styles.thumbWrap}>
                                        <img src={item.image} alt={item.name} className={styles.thumb} loading="lazy" />
                                    </div>

                                    <div className={styles.meta}>
                                        <div className={styles.name} title={item.name}>{item.name}</div>
                                        <div className={styles.sub}>
                                            {item.size ? <span className={styles.size}>Size: {item.size}</span> : null}
                                        </div>

                                        <div className={styles.controls}>
                                            <div className={styles.stepper} aria-label="Quantity selector">
                                                <button
                                                    className={styles.step}
                                                    onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))}
                                                    aria-label="Decrease quantity"
                                                >−</button>
                                                <input
                                                    className={styles.qty}
                                                    inputMode="numeric"
                                                    value={item.qty}
                                                    onChange={(e) => {
                                                        const v = Math.max(1, parseInt(e.target.value || "1", 10));
                                                        onUpdateQty(item.id, v);
                                                    }}
                                                />
                                                <button
                                                    className={styles.step}
                                                    onClick={() => onUpdateQty(item.id, item.qty + 1)}
                                                    aria-label="Increase quantity"
                                                >+</button>
                                            </div>

                                            <div className={styles.price}>{fmt(item.price * item.qty)}</div>
                                        </div>

                                        <button
                                            className={styles.remove}
                                            onClick={() => onRemove(item.id)}
                                            aria-label={`Remove ${item.name} from cart`}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer (totals) */}
                <footer className={styles.footer}>
                    <div className={styles.line}>
                        <span>Subtotal</span>
                        <span>{fmt(subtotal)}</span>
                    </div>
                    {taxRate > 0 && (
                        <div className={styles.line}>
                            <span>Tax</span>
                            <span>{fmt(tax)}</span>
                        </div>
                    )}
                    {shipping > 0 && (
                        <div className={styles.line}>
                            <span>Shipping</span>
                            <span>{fmt(shipping)}</span>
                        </div>
                    )}
                    <div className={`${styles.line} ${styles.total}`}>
                        <span>Total</span>
                        <span>{fmt(total)}</span>
                    </div>

                    <button
                        className={styles.checkout}
                        disabled={items.length === 0}
                        onClick={() => onCheckout?.({ subtotal, tax, shipping, total, items })}
                    >
                        Checkout
                    </button>
                    <p className={styles.note}>Taxes & shipping calculated at checkout.</p>
                </footer>
            </aside>
        </div>
    );
}
