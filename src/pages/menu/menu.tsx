import { useState } from "react";
import styles from "./menu.module.scss";
import Cart from "../Cart/Cart";
import { useCart } from "../../utils/CartContext";
import logoSrc from "../../assets/images/LOGO.png";

import backpack from "../../assets/backpack.svg";
import User from "../../assets/user.svg";
import { useNavigate } from "react-router-dom";



function NavMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, openCart, items, updateQty, removeFromCart, closeCart, isOpen } = useCart();
  const navigate = useNavigate(); // 
  return (
    <>

      <header className={styles.header}>
        <nav className={styles.navbar}>
          <div className={styles.logoNav}>
            <div className={styles.logo}>
              <a href="/"> <img
                src={logoSrc}
                alt="Logo"
              /></a>

            </div>

            <ul className={styles.navLinks}>
              <li><a href="/products">Shop</a></li>
              <li><a href="/about">About Us</a></li>
            </ul>
          </div>

          {/* Icons + Burger */}
          <div className={styles.actions}>
            {/* Desktop Icons */}
            <div className={styles.icons}>
              <button aria-label="Account" className={styles.iconBtn}
                onClick={() => navigate("/login")} >

                <img
                  src={User}
                  width={"20px"}
                  alt="user"
                />
              </button>

              <button
                aria-label="Cart"
                className={`${styles.iconBtn} ${styles.cartBtn}`}
                onClick={() => openCart()}
              >
                {/* Cart Icon */}
                <img
                  src={backpack}
                  width={"24px"}
                  alt="user"
                />

                {/* Count badge */}
                <span
                  className={`${styles.cartBadge} ${count ? styles.cartBadge__visible : ""}`}
                  aria-hidden={count === 0}
                >
                  {count}
                </span>
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
              <li><a href="/login">Login</a></li>
              <li>
                <button
                  className={styles.mobileLink}
                  onClick={() => {
                    openCart();
                    setMenuOpen(false);
                  }}
                >
                  Cart {count > 0 ? `(${count})` : ""}
                </button>
              </li>
              <li><a href="/products">Shop</a></li>
              <li><a href="/about">About Us</a></li>
            </ul>
          </div>
        )}
      </header>

      {/* Slide-over Cart */}
      <Cart
        isOpen={isOpen}
        items={items}
        currency="DT"
        shipping={5}
        onClose={closeCart}
        onCheckout={() => { navigate("checkout", { state: items }); }}
        onUpdateQty={(id, qty) => updateQty({ id, qty })}
        onRemove={(id) => removeFromCart({ id })}
      />
    </>
  );
}

export default NavMenu;
