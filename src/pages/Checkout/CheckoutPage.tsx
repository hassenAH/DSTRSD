// components/CheckoutPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../../utils/CartContext";
import styles from "./CheckoutPage.module.scss";
import { useNavigate } from "react-router-dom";
import { TUNISIAN_CITIES } from "./TunisianCities";
import { createOrder, DeliveryMethod, PaymentMethod } from "../../utils/orders";
import api from "../../utils/axios";
// 👈 ensure this points to your axios/api instance

export default function CheckoutPage() {
    const nav = useNavigate();
    const { items, subtotal, updateQty, removeFromCart, clearCart } = useCart();

    // form state
    const [email, setEmail] = useState("");
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");
    const [address, setAddress] = useState("");
    const [cities, setCities] = useState<string[]>([]);
    const [city, setCity] = useState("Tunis");
    const [stateProv, setStateProv] = useState("");
    const [zip, setZip] = useState("");
    const [phone, setPhone] = useState("");

    const [delivery] = useState<DeliveryMethod>("standard");
    const [payment, setPayment] = useState<PaymentMethod>("cod");
    const [promo, setPromo] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // 👇 New state to hold fetched sizes per product
    const [productSizes, setProductSizes] = useState<Record<string, any[]>>({});

    useEffect(() => setCities(TUNISIAN_CITIES), []);

    // 👇 Fetch sizes for items missing a size
    useEffect(() => {
        items.forEach((it: any) => {
            if (!it.size && !productSizes[it.id]) {
                loadProductSizes(it.id);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    // helper: load product sizes by ID
    async function loadProductSizes(productId: string) {
        try {
            const res = await api.get(`/products/${productId}`);
            const sizes = res.data?.sizes || [];
            setProductSizes(prev => ({ ...prev, [productId]: sizes }));
        } catch (err) {
            console.error(`Failed to load sizes for product ${productId}`, err);
        }
    }

    // fees
    const shipping = useMemo(() => (delivery === "express" ? 15 : 5), [delivery]);

    // promo
    const discount = useMemo(() => {
        const code = promo.trim().toUpperCase();
        if (!code) return 0;
        if (code === "WELCOME10") return Math.min(subtotal * 0.1, 25);

        return 0;
    }, [promo, subtotal]);

    // total
    const totalAmount = useMemo(() => subtotal - discount + shipping, [subtotal, discount]);

    const fmt = (n: number) => `${n.toFixed(2)}DT`;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg(null);

        if (!items.length) return alert("Your cart is empty.");
        if (!email || !first || !last || !address || !city || !zip) {
            return setErrorMsg("Please fill all required fields.");
        }

        const missingSize = items.find((it: any) => !it.size);
        if (missingSize) {
            return setErrorMsg(`Please select a size for "${missingSize.name}".`);
        }

        const products = items.map((it: any) => ({
            productId: String(it.id),
            size: String(it.size),
            color: it.color ?? null,
            quantity: Number(it.qty || 1),
        }));

        const payload = {
            products,
            email,
            phone,
            firstName: first,
            lastName: last,
            address,
            city,
            zip,
            state: stateProv,
            deliveryMethod: delivery,
            paymentMethod: payment,
            subtotal: Number(subtotal),
            shipping: Number(shipping),
            discount: Number(discount),
            totalAmount: Number(totalAmount),
        } as const;

        try {
            setIsSubmitting(true);
            const res = await createOrder(payload);

            clearCart();
            nav("/", { state: { orderId: res.order._id, ok: true } });
        } catch (err: any) {
            setErrorMsg(err?.message || "Failed to place order.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className={styles.checkout}>
            <h1 className={styles.title}>Checkout</h1>

            <form className={styles.layout} onSubmit={handleSubmit} noValidate>
                {/* LEFT: forms */}
                <section className={styles.left}>
                    {/* Contact */}
                    <div className={styles.card}>
                        <h2 className={styles.h2}>Contact</h2>
                        <div className={styles.grid2}>
                            <label className={styles.field}>
                                <span>Email *</span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                />
                            </label>
                            <label className={styles.field}>
                                <span>Phone</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+216 ..."
                                />
                            </label>
                        </div>
                    </div>

                    {/* Shipping */}
                    <div className={styles.card}>
                        <h2 className={styles.h2}>Shipping Address</h2>
                        <div className={styles.grid2}>
                            <label className={styles.field}>
                                <span>First name *</span>
                                <input required value={first} onChange={(e) => setFirst(e.target.value)} />
                            </label>
                            <label className={styles.field}>
                                <span>Last name *</span>
                                <input required value={last} onChange={(e) => setLast(e.target.value)} />
                            </label>
                        </div>

                        <label className={styles.field}>
                            <span>Address *</span>
                            <input
                                required
                                placeholder="Street, number"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </label>

                        <div className={styles.grid3}>
                            <label className={styles.field}>
                                <span>City *</span>
                                <input value={stateProv} onChange={(e) => setStateProv(e.target.value)} />
                            </label>
                            <label className={styles.field}>
                                <span>State / Province</span>
                                <select required value={city} onChange={(e) => setCity(e.target.value)}>
                                    {cities.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <label className={styles.field}>
                            <span>ZIP / Postal code *</span>
                            <input required value={zip} onChange={(e) => setZip(e.target.value)} />
                        </label>
                    </div>

                    {/* Payment */}
                    <div className={styles.card}>
                        <h2 className={styles.h2}>Payment</h2>
                        <div className={styles.options}>
                            <label className={styles.opt}>
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={payment === "cod"}
                                    onChange={() => setPayment("cod")}
                                />
                                <div className={styles.optMeta}>
                                    <span className={styles.optName}>Cash on Delivery</span>
                                    <span className={styles.optSub}>Pay when it arrives</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    {errorMsg && <p className={styles.error} role="alert">{errorMsg}</p>}
                </section>

                {/* RIGHT: summary */}
                <aside className={styles.right} aria-label="Order summary">
                    <div className={styles.summary}>
                        <h2 className={styles.h2}>Order Summary</h2>

                        {!items.length ? (
                            <p className={styles.muted}>Your cart is empty.</p>
                        ) : (
                            <ul className={styles.lines}>
                                {items.map((it: any) => (
                                    <li key={`${it.id}-${it.size ?? "no"}`} className={styles.line}>
                                        <div className={styles.thumb}>
                                            <img src={it.image} alt={it.name} />
                                        </div>
                                        <div className={styles.meta}>
                                            <div className={styles.top}>
                                                <span className={styles.name}>{it.name}</span>
                                                <button
                                                    className={styles.remove}
                                                    type="button"
                                                    disabled={isSubmitting}
                                                    onClick={() => removeFromCart({ id: it.id, size: it.size })}
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            {/* 👇 New inline size selector */}
                                            {it.size ? (
                                                <div className={styles.subRow}>
                                                    <span className={styles.muted}>Size: {it.size}</span>
                                                    <span className={styles.price}>{fmt(it.price)}</span>
                                                </div>
                                            ) : (
                                                <div className={styles.sizeSelectorInline}>
                                                    <label className={styles.muted}>Select size:</label>
                                                    <div className={styles.sizeOptions}>
                                                        {productSizes[it.id]?.length ? (
                                                            productSizes[it.id].map((s: any) => (
                                                                <button
                                                                    key={s.name}
                                                                    disabled={s.stock <= 0}
                                                                    className={`${styles.sizeBtn} ${s.name === it.tempSize ? styles.activeSize : ""}`}
                                                                    onClick={() =>
                                                                        updateQty({
                                                                            id: it.id,
                                                                            size: s.name,
                                                                            qty: it.qty,
                                                                        })
                                                                    }
                                                                    aria-label={`${s.name} ${s.stock <= 0 ? "out of stock" : `${s.stock} available`}`}
                                                                >
                                                                    <span>{s.name}</span>
                                                                    <small className={styles.stockNote}>{s.stock} left</small>
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <small className={styles.loading}>Loading sizes...</small>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className={styles.qtyRow}>
                                                <div className={styles.stepper}>
                                                    <button
                                                        type="button"
                                                        disabled={isSubmitting}
                                                        onClick={() =>
                                                            updateQty({ id: it.id, size: it.size, qty: Math.max(1, it.qty - 1) })
                                                        }
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        value={it.qty}
                                                        inputMode="numeric"
                                                        onChange={(e) => {
                                                            const v = Math.max(1, parseInt(e.target.value || "1", 10));
                                                            updateQty({ id: it.id, size: it.size, qty: v });
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        disabled={isSubmitting}
                                                        onClick={() =>
                                                            updateQty({ id: it.id, size: it.size, qty: it.qty + 1 })
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <span className={styles.lineTotal}>{fmt(it.price * it.qty)}</span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Promo */}
                        <div className={styles.promo}>
                            <input
                                className={styles.promoInput}
                                placeholder="Promo code"
                                value={promo}
                                onChange={(e) => setPromo(e.target.value)}
                            />
                            <button
                                type="button"
                                className={styles.promoBtn}
                                onClick={() => setPromo((p) => p.trim())}
                                disabled={isSubmitting}
                            >
                                Apply
                            </button>
                        </div>

                        {/* Totals */}
                        <div className={styles.totals}>
                            <div className={styles.trow}>
                                <span>Subtotal</span>
                                <span>{fmt(subtotal)}</span>
                            </div>
                            <div className={styles.trow}>
                                <span>Shipping</span>
                                <span>{fmt(shipping)}</span>
                            </div>

                            {discount > 0 && (
                                <div className={styles.trow}>
                                    <span>Discount</span>
                                    <span>−{fmt(discount)}</span>
                                </div>
                            )}
                            <div className={`${styles.trow} ${styles.grand}`}>
                                <span>Total</span>
                                <span>{fmt(totalAmount)}</span>
                            </div>
                        </div>

                        <button type="submit" className={styles.pay} disabled={!items.length || isSubmitting}>
                            {isSubmitting ? "Placing order..." : payment === "card" ? "Pay now" : "Place order"}
                        </button>
                        <p className={styles.note}>Secure checkout</p>
                    </div>
                </aside>
            </form>
        </div>
    );
}
