import styles from "../Dashboard.module.scss";
export default function DashboardSidebar() {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <h2>Admin Panel</h2>
            </div>

            <nav className={styles.sidebarNav}>
                <div className={styles.navSection}>
                    <h3>Products</h3>

                </div>

                <div className={styles.navSection}>
                    <h3>Management</h3>
                    <ul>
                        <li>
                            <button className={styles.navItem}>
                                <span className={styles.navIcon}>📊</span>
                                Analytics
                            </button>
                        </li>
                        <li>
                            <button className={styles.navItem}>
                                <span className={styles.navIcon}>👥</span>
                                Customers
                            </button>
                        </li>
                        <li>
                            <button className={styles.navItem}>
                                <span className={styles.navIcon}>📝</span>
                                Orders
                            </button>
                        </li>
                        <li>
                            <button className={styles.navItem}>
                                <span className={styles.navIcon}>⚙️</span>
                                Settings
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>

            <div className={styles.sidebarFooter}>
                <button className={styles.logoutBtn}>
                    <span className={styles.navIcon}>🚪</span>
                    Logout
                </button>
            </div>
        </aside>
    );
}