import { useNavigate } from "react-router-dom";
import styles from "../Dashboard.module.scss";
import { useAuth } from "../../../utils/AuthContext";

export default function DashboardSidebar() {
    const nav = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();            // clears tokens & user in AuthContext
        nav("/", { replace: true }); // go to home
    };

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
                            <button className={styles.navItem} onClick={() => nav("/dashboard")}>
                                Products
                            </button>
                        </li>
                    </ul>
                </div>

                <div className={styles.navSection}>
                    <h3>Management</h3>
                    <ul>
                        <li><button className={styles.navItem}>Analytics</button></li>
                        <li>
                            <button className={styles.navItem} onClick={() => nav("/sub")}>
                                Subscribers
                            </button>
                        </li>
                        <li>
                            <button className={styles.navItem} onClick={() => nav("/orders")}>
                                Orders
                            </button>
                        </li>
                        <li><button className={styles.navItem}>Settings</button></li>
                    </ul>
                </div>
            </nav>

            <div className={styles.sidebarFooter}>
                <button className={styles.logoutBtn} onClick={handleLogout} aria-label="Log out">
                    Logout
                </button>
            </div>
        </aside>
    );
}
