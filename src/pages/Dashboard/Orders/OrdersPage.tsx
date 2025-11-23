// components/Dashboard/OrdersPage.tsx
import { useEffect, useState } from "react";
import styles from "./Dashboard.module.scss";
import api from "../../../utils/axios";
import DashboardSidebar from "../Sidebar/SidebarDashboard";
import OrderView, { Order } from "./OrderView";
// <-- import

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // NEW: modal state
    const [selected, setSelected] = useState<Order | null>(null);
    const [viewOpen, setViewOpen] = useState(false);

    useEffect(() => {
        async function fetchOrders() {
            try {
                const res = await api.get<Order[]>("/orders");
                setOrders(res.data);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message || "Failed to load orders");
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    const openView = (order: Order) => {
        setSelected(order);
        setViewOpen(true);
    };

    const closeView = () => {
        setViewOpen(false);
        setSelected(null);
    };

    const fmtDT = (n: number) => `${n.toFixed(2)} DT`;

    return (
        <div className={styles.dashboardLayout}>
            <DashboardSidebar />

            <div className={styles.dashboardContent}>
                <header className={styles.header}>
                    <h1>Orders</h1>
                </header>

                {loading && <p>Loading orders...</p>}
                {error && <p className={styles.error}>{error}</p>}

                {!loading && !error && (
                    <div className={styles.tableContainer}>
                        {orders.length === 0 ? (
                            <p className={styles.empty}>No orders found.</p>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Email</th>
                                        <th>Total</th>
                                        <th>Payment</th>
                                        <th>Delivery</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th>Actions</th> {/* NEW */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => {
                                        const status = (order.status || "processing").toLowerCase();
                                        return (
                                            <tr key={order._id}>
                                                <td className={styles.mono}>{order._id.slice(-6)}</td>
                                                <td>{order.firstName} {order.lastName}</td>
                                                <td>{order.email}</td>
                                                <td>{fmtDT(order.totalAmount)}</td>
                                                <td>{order.paymentMethod}</td>
                                                <td>{order.deliveryMethod}</td>
                                                <td>
                                                    <span
                                                        className={`${styles.status} ${status.includes("deliver")
                                                            ? styles.delivered
                                                            : status.includes("pend")
                                                                ? styles.pending
                                                                : styles.processing
                                                            }`}
                                                    >
                                                        {order.status || "processing"}
                                                    </span>
                                                </td>
                                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className={styles.smallBtn}
                                                        onClick={() => openView(order)}
                                                        title="View order"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            <OrderView
                open={viewOpen}
                order={selected}
                onClose={closeView}
                onOpenProduct={(id) => {
                    // go to your product page route if you have one
                    // e.g., navigate(`/product/${id}`)
                    console.log("Open product", id);
                }}
            />
        </div>
    );
}
