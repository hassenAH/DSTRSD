import { useNavigate } from "react-router-dom";
import styles from "../Dashboard.module.scss";

export default function DashboardSidebar() {
    const nav = useNavigate();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <h2>Admin Panel</h2>
            </div>

            <nav className={styles.sidebarNav}>
                <div className={styles.navSection}>
                    <h3>Products</h3>
                    <ul>
                        <li>
                            <button
                                className={styles.navItem}
                                onClick={() => nav("/dashboard")}
                            >
                                Products
                            </button>
                        </li>
                    </ul>
                </div>

                <div className={styles.navSection}>
                    <h3>Management</h3>
                    <ul>
                        <li>
                            <button className={styles.navItem}>Analytics</button>
                        </li>
                        <li>
                            <button className={styles.navItem}>Customers</button>
                        </li>
                        <li>
                            <button
                                className={styles.navItem}
                                onClick={() => nav("/orders")}
                            >
                                Orders
                            </button>
                        </li>
                        <li>
                            <button className={styles.navItem}>Settings</button>
                        </li>
                    </ul>
                </div>
            </nav>

            <div className={styles.sidebarFooter}>
                <button className={styles.logoutBtn}>Logout</button>
            </div>
        </aside>
    );
}
