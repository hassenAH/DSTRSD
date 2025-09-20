import { useMemo, useState } from "react";
import styles from "./ProductInfo.module.scss";
import SizeSelector from "./SizeSelector";
import QuantitySelector from "./QuantitySelector";
import DeliveryInfo from "./DeliveryInfo";
import ProductImage from "./ProductImage";
import hoverImage from "../../assets/images/images.jpg";
import pullImage from "../../assets/images/pull.jpg";
// If you have a CartItem type, keep the import. We’ll build a snapshot compatible with it.
import { type CartItem } from "../Cart/Cart";
import { useNavigate } from "react-router-dom";

interface ProductInfoProps {
  category: string;
  title: string;
  price: string; // e.g. "39.99" (numeric string)
  description: {
    intro: string;
    detailsTitle: string;
    details: string[];
  };
  sizes: string[];
}

export default function ProductInfo({
  category,
  title,
  price,
  description,
  sizes,
}: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  // Normalize price once
  const unitPrice = useMemo(() => Number(price) || 0, [price]);

  // Build a product snapshot (works for checkout or cart)
  // If your CartItem has different field names, just rename below.
  const item = useMemo(
    () =>
    ({
      id: `${title}-${selectedSize}`, // stable key for this variant
      title,
      category,
      size: selectedSize,
      qty: quantity, // if your CartItem uses "quantity", rename to "quantity"
      price: unitPrice,
      image: pullImage, // or pass via props
    } as unknown as CartItem), // loosen typing if your CartItem is stricter
    [title, selectedSize, category, quantity, unitPrice]
  );

  const handleCheckout = () => {
    const subtotal = unitPrice * quantity;
    const tax = 0; // adjust if needed
    const total = subtotal + tax;

    // Pass everything (including the item snapshot) to the checkout route
    navigate("/checkout", {
      state: {
        subtotal,
        tax,
        total,
        item,
      },
    });
  };

  const handleBuyNow = () => {
    // “Buy now” can go straight to checkout with this single item:
    handleCheckout();
  };

  return (
    <section className={styles.productInfoSection}>
      <div className={styles.productLayout}>
        {/* Left - Product Image */}
        <div className={styles.leftColumn}>
          <ProductImage
            src={pullImage}
            hoverSrc={hoverImage}
            alt={title}
            showNew
            showOnlineExclusive
          />
        </div>

        {/* Right - Product Details */}
        <div className={styles.rightColumn}>
          <p className={styles.categoryLabel}>{category}</p>

          <header className={styles.productHeader}>
            <div className={styles.productDetails}>
              <h1 className={styles.productTitle}>{title}</h1>
              <p className={styles.productPrice}>
                {unitPrice.toFixed(2)}
              </p>
              <hr className={styles.divider} />
              <p className={styles.productDescription}>{description.intro}</p>

              <div className={styles.productDetailsBlock}>
                <h2 className={styles.detailsTitle}>{description.detailsTitle}</h2>
                <ul className={styles.detailsList}>
                  {description.details.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </header>

          <hr className={styles.secondDivider} />

          <SizeSelector
            sizes={sizes}
            selectedSize={selectedSize}
            onSizeChange={setSelectedSize}
          />
          <p className={styles.selectedSizeLabel}>
            Selected Size: <strong>{selectedSize}</strong>
          </p>

          <div className={styles.purchaseSection}>
            <QuantitySelector
              initialQuantity={quantity}
              onQuantityChange={setQuantity}
            />

            <button
              className={styles.buyButton}
              onClick={handleBuyNow}
              aria-label={`Buy ${quantity} ${title} in size ${selectedSize}`}
            >
              <span className={styles.buyButtonText}>Buy now</span>
            </button>

            {/* Optional explicit “Checkout” button if you want both */}
            {/* <button className={styles.checkoutButton} onClick={handleCheckout}>
              Go to checkout
            </button> */}
          </div>

          <DeliveryInfo />
        </div>
      </div>
    </section>
  );
}
