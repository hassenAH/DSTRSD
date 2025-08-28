import React, { useState } from "react";
import styles from "./menu.module.scss";

function NavMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400&display=swap"
        rel="stylesheet"
      />
      <header className={styles.header}>
        <nav className={styles.navbar}>
          {/* Logo */}
          <div className={styles.logo}>
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/744ea032654af71664341354c420e6c6c96256e3?width=260"
              alt="Logo"
            />
          </div>

          {/* Desktop Links */}
          <ul className={styles.navLinks}>
            <li><a href="#">Shop</a></li>
            <li><a href="#">Archive</a></li>
            <li><a href="#">About Us</a></li>
          </ul>

          {/* Icons + Burger */}
          <div className={styles.actions}>
            {/* Desktop Icons */}
            <div className={styles.icons}>
              <button aria-label="Account" className={styles.iconBtn}>
                {/* Account Icon */}
                <svg width="20" height="20" viewBox="0 0 17 18" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.6 3.58c.71 0 1.39.28 1.88.78.5.5.78 1.18.78 1.89 0 .71-.28 1.39-.78 1.89a2.65 2.65 0 01-3.76 0 2.67 2.67 0 010-3.78c.49-.5 1.17-.78 1.88-.78Zm5.73 7.24c-.82-.83-1.89-1.32-3.18-1.47a4.1 4.1 0 001.08-4.8A4.4 4.4 0 008.6 2.23a4.4 4.4 0 00-3.8 2.32 4.1 4.1 0 001.08 4.8c-1.3.15-2.36.64-3.19 1.47-1.7 1.72-1.7 5.68-1.7 5.68h1.36s.01-3.39 1.3-4.68c.74-.75 1.78-1.13 3.12-1.13h3.36c1.34 0 2.38.38 3.13 1.13 1.3 1.29 1.3 4.68 1.3 4.68h1.36s0-3.96-1.7-5.68Z"
                    fill="black"
                  />
                </svg>
              </button>

              <button aria-label="Cart" className={styles.iconBtn}>
                {/* Cart Icon */}
                <svg width="20" height="20" viewBox="0 0 17 18" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.1 14.78h11.57V6.36H3.1v8.42Zm5.82-11.52c1.1 0 2.02.74 2.31 1.75H6.6c.3-1.01 1.22-1.75 2.32-1.75ZM12.62 5c-.32-1.76-1.86-3.1-3.71-3.1-1.85 0-3.38 1.34-3.71 3.1H1.74v11.13h14.27V5H12.62Z"
                    fill="black"
                  />
                </svg>
              </button>
            </div>

            {/* Burger Icon (mobile only) */}
            <button
              className={styles.burger}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle Menu"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ""}`}>


            <ul>
              <li><div className={styles.mobileIcons}>
                <button aria-label="Cart" className={styles.iconBtn}><svg width="20" height="20" viewBox="0 0 17 18" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.6 3.58c.71 0 1.39.28 1.88.78.5.5.78 1.18.78 1.89 0 .71-.28 1.39-.78 1.89a2.65 2.65 0 01-3.76 0 2.67 2.67 0 010-3.78c.49-.5 1.17-.78 1.88-.78Zm5.73 7.24c-.82-.83-1.89-1.32-3.18-1.47a4.1 4.1 0 001.08-4.8A4.4 4.4 0 008.6 2.23a4.4 4.4 0 00-3.8 2.32 4.1 4.1 0 001.08 4.8c-1.3.15-2.36.64-3.19 1.47-1.7 1.72-1.7 5.68-1.7 5.68h1.36s.01-3.39 1.3-4.68c.74-.75 1.78-1.13 3.12-1.13h3.36c1.34 0 2.38.38 3.13 1.13 1.3 1.29 1.3 4.68 1.3 4.68h1.36s0-3.96-1.7-5.68Z"
                    fill="black"
                  />
                </svg></button>
              </div></li>

              <div className={styles.mobileIcons}> <button aria-label="Account" className={styles.iconBtn}><svg width="20" height="20" viewBox="0 0 17 18" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M3.1 14.78h11.57V6.36H3.1v8.42Zm5.82-11.52c1.1 0 2.02.74 2.31 1.75H6.6c.3-1.01 1.22-1.75 2.32-1.75ZM12.62 5c-.32-1.76-1.86-3.1-3.71-3.1-1.85 0-3.38 1.34-3.71 3.1H1.74v11.13h14.27V5H12.62Z"
                  fill="black"
                />
              </svg></button></div>

              <li><a href="#">Shop</a></li>
              <li><a href="#">Archive</a></li>
              <li><a href="#">About Us</a></li>
            </ul>
          </div>
        )}
      </header>
    </>
  );
}

export default NavMenu;
