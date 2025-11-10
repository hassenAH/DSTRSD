// components/Dashboard/OrdersPage.tsx
import { useEffect, useState } from "react";
import styles from "./Dashboard.module.scss";
import api from "../../../utils/axios";
import DashboardSidebar from "../Sidebar/SidebarDashboard";

type OrderProduct = {
    productId: string;
    name?: string;
    size?: string;
    color?: string;
    quantity: number;
    price?: number;
};

type Order = {
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
    status?: string;
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order._id}>
                                            <td className={styles.mono}>{order._id.slice(-6)}</td>
                                            <td>{order.firstName} {order.lastName}</td>
                                            <td>{order.email}</td>
                                            <td>{order.subtotal.toFixed(2)} DT</td>
                                            <td>{order.paymentMethod}</td>
                                            <td>{order.deliveryMethod}</td>
                                            <td>
                                                <span
                                                    className={`${styles.status} ${order.status === "delivered"
                                                        ? styles.delivered
                                                        : order.status === "pending"
                                                            ? styles.pending
                                                            : styles.processing
                                                        }`}
                                                >
                                                    {order.status || "processing"}
                                                </span>
                                            </td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
