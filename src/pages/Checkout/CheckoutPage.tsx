import { useMemo, useState } from "react";
import { useCart } from "../../utils/CartContext";
import styles from "./CheckoutPage.module.scss";
import { useNavigate } from "react-router-dom";

type DeliveryMethod = "standard" | "express";
type PaymentMethod = "card" | "cod";

const COUNTRIES = ["Tunisia", "United States", "United Kingdom", "France", "Germany", "Canada", "Australia"];

export default function CheckoutPage() {
    const nav = useNavigate();
    const { items, subtotal, updateQty, removeFromCart, clearCart } = useCart();

    // form state
    const [email, setEmail] = useState("");
    const [first, setFirst] = useState("");
    const [last, setLast] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [country, setCountry] = useState(COUNTRIES[0]);
    const [stateProv, setStateProv] = useState("");
    const [zip, setZip] = useState("");
    const [phone, setPhone] = useState("");

    const [delivery, setDelivery] = useState<DeliveryMethod>("standard");
    const [payment, setPayment] = useState<PaymentMethod>("card");
    const [promo, setPromo] = useState("");
    const [agree, setAgree] = useState(true);

    // fees
    const shipping = useMemo(() => (delivery === "express" ? 15 : 5), [delivery]);

    // promo (demo)
    const discount = useMemo(() => {
        const code = promo.trim().toUpperCase();
        if (!code) return 0;
        if (code === "WELCOME10") return Math.min(subtotal * 0.1, 25);
        if (code === "FREESHIP") return shipping;
        return 0;
    }, [promo, subtotal, shipping]);

    const taxRate = 0.07;
    const taxable = Math.max(0, subtotal - discount);
    const tax = useMemo(() => +(taxable * taxRate).toFixed(2), [taxable]);
    const total = useMemo(() => +(taxable + Math.max(0, shipping - (promo.trim().toUpperCase() === "FREESHIP" ? shipping : 0)) + tax).toFixed(2), [taxable, shipping, promo, tax]);

    const fmt = (n: number) => `$${n.toFixed(2)}`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!items.length) return alert("Your cart is empty.");
        if (!email || !first || !last || !address || !city || !zip) return alert("Please fill all required fields.");
        if (!agree) return alert("Please accept the terms.");
        // mock place order
        alert("Order placed! (demo)");
        clearCart();
        nav("/"); // back home
    };

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
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                            </label>
                            <label className={styles.field}>
                                <span>Phone</span>
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+216 ..." />
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
                            <input required placeholder="Street, number" value={address} onChange={(e) => setAddress(e.target.value)} />
                        </label>

                        <div className={styles.grid3}>
                            <label className={styles.field}>
                                <span>City *</span>
                                <input required value={city} onChange={(e) => setCity(e.target.value)} />
                            </label>
                            <label className={styles.field}>
                                <span>Country</span>
                                <select value={country} onChange={(e) => setCountry(e.target.value)}>
                                    {COUNTRIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </label>
                            <label className={styles.field}>
                                <span>State / Province</span>
                                <input value={stateProv} onChange={(e) => setStateProv(e.target.value)} />
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
                                <input type="radio" name="payment" checked={payment === "cod"} onChange={() => setPayment("cod")} />
                                <div className={styles.optMeta}>
                                    <span className={styles.optName}>Cash on Delivery</span>
                                    <span className={styles.optSub}>Pay when it arrives</span>
                                </div>
                            </label>
                        </div>


                    </div>


                </section>

                {/* RIGHT: summary */}
                <aside className={styles.right} aria-label="Order summary">
                    <div className={styles.summary}>
                        <h2 className={styles.h2}>Order Summary</h2>

                        {!items.length ? (
                            <p className={styles.muted}>Your cart is empty.</p>
                        ) : (
                            <ul className={styles.lines}>
                                {items.map((it) => (
                                    <li key={`${it.id}-${it.size ?? "no"}`} className={styles.line}>
                                        <div className={styles.thumb}>
                                            <img src={it.image} alt={it.name} />
                                        </div>
                                        <div className={styles.meta}>
                                            <div className={styles.top}>
                                                <span className={styles.name}>{it.name}</span>
                                                <button className={styles.remove} onClick={() => removeFromCart({ id: it.id, size: it.size })}>
                                                    Remove
                                                </button>
                                            </div>
                                            <div className={styles.subRow}>
                                                {it.size ? <span className={styles.muted}>Size: {it.size}</span> : <span />}
                                                <span className={styles.price}>{fmt(it.price)}</span>
                                            </div>
                                            <div className={styles.qtyRow}>
                                                <div className={styles.stepper}>
                                                    <button onClick={() => updateQty({ id: it.id, size: it.size, qty: Math.max(1, it.qty - 1) })}>−</button>
                                                    <input
                                                        value={it.qty}
                                                        inputMode="numeric"
                                                        onChange={(e) => {
                                                            const v = Math.max(1, parseInt(e.target.value || "1", 10));
                                                            updateQty({ id: it.id, size: it.size, qty: v });
                                                        }}
                                                    />
                                                    <button onClick={() => updateQty({ id: it.id, size: it.size, qty: it.qty + 1 })}>+</button>
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
                                placeholder="Promo code (WELCOME10 / FREESHIP)"
                                value={promo}
                                onChange={(e) => setPromo(e.target.value)}
                            />
                            <button type="button" className={styles.promoBtn} onClick={() => setPromo((p) => p.trim())}>
                                Apply
                            </button>
                        </div>

                        {/* Totals */}
                        <div className={styles.totals}>
                            <div className={styles.trow}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                            {discount > 0 && <div className={styles.trow}><span>Discount</span><span>−{fmt(discount)}</span></div>}
                            <div className={styles.trow}><span>Shipping</span><span>{fmt(Math.max(0, shipping - (promo.trim().toUpperCase() === "FREESHIP" ? shipping : 0)))}</span></div>
                            <div className={styles.trow}><span>Tax</span><span>{fmt(tax)}</span></div>
                            <div className={`${styles.trow} ${styles.grand}`}><span>Total</span><span>{fmt(total)}</span></div>
                        </div>

                        <button type="submit" className={styles.pay} disabled={!items.length}>
                            {payment === "card" ? "Pay now" : "Place order"}
                        </button>
                        <p className={styles.note}>Secure checkout · demo only</p>
                    </div>
                </aside>
            </form>
        </div>
    );
}
