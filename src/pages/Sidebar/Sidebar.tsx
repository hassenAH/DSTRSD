// Sidebar.tsx
import React from "react";
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.scss";

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <img src="/logo.png" alt="Logo" />
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
