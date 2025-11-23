// components/Dashboard/OrdersPage.tsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import styles from "./Dashboard.module.scss";
import api from "../../../utils/axios";
import DashboardSidebar from "../Sidebar/SidebarDashboard";
import OrderView, { Order } from "./OrderView";

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // modal state
    const [selected, setSelected] = useState<Order | null>(null);
    const [viewOpen, setViewOpen] = useState(false);

    // 🔍 search
    const [search, setSearch] = useState("");
    const normalizedSearch = search.trim().toLowerCase();

    useEffect(() => {
        async function fetchOrders() {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get<Order[]>("/orders");
                setOrders(res.data);
            } catch (err: any) {
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load orders"
                );
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

    // derived: filtered orders
    const filteredOrders = useMemo(
        () =>
            !normalizedSearch
                ? orders
                : orders.filter((order) => {
                    const fullName = `${order.firstName || ""} ${order.lastName || ""}`.toLowerCase();
                    const email = order.email?.toLowerCase() || "";
                    const payment = order.paymentMethod?.toLowerCase() || "";
                    const delivery = order.deliveryMethod?.toLowerCase() || "";
                    const status = (order.status || "processing").toLowerCase();
                    const idLast6 = order._id?.slice(-6)?.toLowerCase() || "";
                    const dateStr = new Date(order.createdAt).toLocaleDateString().toLowerCase();

                    return (
                        fullName.includes(normalizedSearch) ||
                        email.includes(normalizedSearch) ||
                        payment.includes(normalizedSearch) ||
                        delivery.includes(normalizedSearch) ||
                        status.includes(normalizedSearch) ||
                        idLast6.includes(normalizedSearch) ||
                        dateStr.includes(normalizedSearch)
                    );
                }),
        [orders, normalizedSearch]
    );

    // 📁 export filtered orders as CSV
    const handleExportCSV = () => {
        if (!filteredOrders.length) {
            toast.error("No orders to export");
            return;
        }

        const header = [
            "orderId",
            "firstName",
            "lastName",
            "email",
            "totalAmount",
            "paymentMethod",
            "deliveryMethod",
            "status",
            "createdAt",
        ];

        const rows = filteredOrders.map((o) => [
            o._id,
            o.firstName ?? "",
            o.lastName ?? "",
            o.email ?? "",
            o.totalAmount.toFixed(2),
            o.paymentMethod ?? "",
            o.deliveryMethod ?? "",
            o.status ?? "processing",
            new Date(o.createdAt).toISOString(),
        ]);

        const csvContent =
            [header, ...rows]
                .map((row) =>
                    row
                        .map((value) => {
                            const safe = value.replace(/"/g, '""');
                            return `"${safe}"`;
                        })
                        .join(",")
                )
                .join("\n") + "\n";

        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const date = new Date().toISOString().slice(0, 10);

        link.href = url;
        link.setAttribute("download", `orders-${date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("CSV export started");
    };

    return (
        <div className={styles.dashboardLayout}>
            <DashboardSidebar />

            <div className={styles.dashboardContent}>
                <header className={styles.header}>
                    <div>
                        <h1>Orders</h1>
                        <p className={styles.subHeader}>
                            Total: {orders.length} • Showing: {filteredOrders.length}
                        </p>
                    </div>

                    <div className={styles.headerActions}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search by name, email, ID, status..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={handleExportCSV}
                            disabled={loading || !orders.length}
                        >
                            Export CSV
                        </button>
                    </div>
                </header>

                {loading && <p>Loading orders...</p>}
                {error && <p className={styles.error}>{error}</p>}

                {!loading && !error && (
                    <div className={styles.tableContainer}>
                        {filteredOrders.length === 0 ? (
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
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => {
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
                    console.log("Open product", id);
                }}
            />
        </div>
    );
}
