// Sidebar.tsx
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.scss";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
<img   src="https://api.builder.io/api/v1/image/assets/TEMP/744ea032654af71664341354c420e6c6c96256e3?width=260"
                alt="Logo" />
                    </div>

      <nav className={styles.nav}>
        <NavLink
          to="/products"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
        >
          Products
        </NavLink>

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
        >
          Invoices
        </NavLink>
      </nav>

      <button className={styles.logout}>Déconnecter</button>
    </aside>
  );
}
