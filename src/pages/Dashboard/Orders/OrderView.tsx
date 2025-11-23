// components/Dashboard/OrderView.tsx
import { useEffect, useRef } from "react";
import styles from "./OrderView.module.scss";
import { downloadInvoice } from "./Invoice/downloadInvoice";

type PopulatedProduct = {
    _id: string;
    title: string;
    price: number;
};

type OrderProduct = {
    product: PopulatedProduct;
    color?: string;
    size?: string;
    quantity: number;
    price: number; // unit price stored at order time
};

export type Order = {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    state?: string;
    zip: string;
    subtotal: number;
    shipping: number;
    discount: number;
    totalAmount: number;
    paymentMethod: string;
    deliveryMethod: string;
    products: OrderProduct[];
    createdAt: string;
    status?: string; // e.g., "Pending" | "Delivered" | "Processing"
};

type Props = {
    open: boolean;
    order: Order | null;
    onClose: () => void;
    // Optional button to go to product page when clicking a product title
    onOpenProduct?: (productId: string) => void;
};

export default function OrderView({ open, order, onClose, onOpenProduct }: Props) {
    const closeRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const prevOv = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const to = setTimeout(() => closeRef.current?.focus(), 0);

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prevOv;
            clearTimeout(to);
            window.removeEventListener("keydown", onKey);
        };
    }, [open, onClose]);

    if (!open || !order) return null;

    const statusClass = (() => {
        const s = (order.status || "processing").toLowerCase();
        if (s.includes("deliver")) return styles.delivered;
        if (s.includes("pend")) return styles.pending;
        return styles.processing;
    })();

    const fmtDT = (n: number) => `${n.toFixed(2)} DT`;
    const created = new Date(order.createdAt).toLocaleString();

    return (
        <div className={styles.overlay} onMouseDown={onClose}>
            <div
                className={styles.panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby="ov-title"
                aria-describedby="ov-desc"
                onMouseDown={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className={styles.header}>
                    <div className={styles.hLeft}>
                        <h2 id="ov-title" className={styles.title}>
                            Order <span className={styles.mono}>#{order._id.slice(-6)}</span>
                        </h2>
                        <span className={`${styles.status} ${statusClass}`}>
                            {order.status || "processing"}
                        </span>
                        <div id="ov-desc" className={styles.date}>
                            Placed on {created}
                        </div>
                    </div>
                    <div className={styles.hRight}>

                        {order && (
                            <button
                                className={styles.btnPrimary}    // NEW
                                type="button"
                                onClick={() => downloadInvoice(order)}
                                title="Download invoice PDF"
                            >
                                Invoice PDF
                            </button>
                        )}
                        <button className={styles.btnGhost} onClick={onClose}>
                            Close
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className={styles.content}>
                    <section className={styles.col}>
                        <div className={styles.card}>
                            <h3 className={styles.h3}>Customer</h3>
                            <div className={styles.kv}>
                                <span className={styles.key}>Name</span>
                                <span className={styles.val}>{order.firstName} {order.lastName}</span>
                            </div>
                            <div className={styles.kv}>
                                <span className={styles.key}>Email</span>
                                <a className={styles.val} href={`mailto:${order.email}`}>{order.email}</a>
                            </div>
                            {order.phone && (
                                <div className={styles.kv}>
                                    <span className={styles.key}>Phone</span>
                                    <a className={styles.val} href={`tel:${order.phone}`}>{order.phone}</a>
                                </div>
                            )}
                        </div>

                        <div className={styles.card}>
                            <h3 className={styles.h3}>Shipping</h3>
                            <address className={styles.address}>
                                {order.address}
                                <br />
                                {order.city}{order.state ? `, ${order.state}` : ""} {order.zip}
                            </address>
                            <div className={styles.kv}>
                                <span className={styles.key}>Delivery</span>
                                <span className={styles.val}>{order.deliveryMethod}</span>
                            </div>
                            <div className={styles.kv}>
                                <span className={styles.key}>Payment</span>
                                <span className={styles.val}>{order.paymentMethod}</span>
                            </div>
                        </div>
                    </section>

                    <section className={styles.col}>
                        <div className={styles.card}>
                            <h3 className={styles.h3}>Items</h3>

                            <div className={styles.items}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Options</th>
                                            <th className={styles.num}>Qty</th>
                                            <th className={styles.num}>Price</th>
                                            <th className={styles.num}>Line</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.products.map((p, i) => {
                                            const line = p.price * p.quantity;
                                            return (
                                                <tr key={`${p.product._id}-${i}`}>
                                                    <td>
                                                        {onOpenProduct ? (
                                                            <button
                                                                type="button"
                                                                className={styles.linkBtn}
                                                                onClick={() => onOpenProduct(p.product._id)}
                                                                title="View product"
                                                            >
                                                                {p.product.title}
                                                            </button>
                                                        ) : (
                                                            <span>{p.product.title}</span>
                                                        )}
                                                    </td>
                                                    <td className={styles.dim}>
                                                        {p.size && <span>Size: {p.size}</span>}
                                                        {p.color && (
                                                            <>
                                                                {p.size && " · "}
                                                                <span>Color: {p.color}</span>
                                                            </>
                                                        )}
                                                    </td>
                                                    <td className={styles.num}>{p.quantity}</td>
                                                    <td className={styles.num}>{fmtDT(p.price)}</td>
                                                    <td className={styles.num}>{fmtDT(line)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className={styles.totals}>
                                <div className={styles.trow}>
                                    <span>Subtotal</span>
                                    <span>{fmtDT(order.subtotal)}</span>
                                </div>
                                <div className={styles.trow}>
                                    <span>Shipping</span>
                                    <span>{fmtDT(order.shipping)}</span>
                                </div>

                                {order.discount > 0 && (
                                    <div className={styles.trow}>
                                        <span>Discount</span>
                                        <span>− {fmtDT(order.discount)}</span>
                                    </div>
                                )}
                                <div className={`${styles.trow} ${styles.grand}`}>
                                    <span>Total</span>
                                    <span>{fmtDT(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
