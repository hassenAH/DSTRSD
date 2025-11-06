import { useMemo, useState } from "react";
import styles from "./ProductInfo.module.scss";
import SizeSelector from "./SizeSelector";
import QuantitySelector from "./QuantitySelector";
import DeliveryInfo from "./DeliveryInfo";
import ProductImage from "./ProductImage";

import { useNavigate } from "react-router-dom";
import { useCart, type CartItem } from "../../utils/CartContext";
export type ProductDescription = {
  intro: string;
  detailsTitle?: string;
  details?: string[];
};
interface ProductInfoProps {
  category: string;
  title: string;
  price: string; // e.g. "79 Dt"
  description: ProductDescription;
  pullimages: string[];
  sizes: string[];
}

export default function ProductInfo({
  pullimages,
  category,
  title,
  price,
  description,
  sizes,
}: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { addToCartHome } = useCart();

  // "79 Dt" -> 79
  const unitPrice = useMemo(
    () => Number((price || "").replace(/[^\d.]/g, "")) || 0,
    [price]
  );

  const item: CartItem = useMemo(
    () => ({
      id: `counterfeit-black-${selectedSize}`.toLowerCase(), // stable per-variant
      name: title,
      image: pullimages[0],
      price: unitPrice,
      qty: quantity,
      size: selectedSize,
    }),
    [selectedSize, title, unitPrice, quantity, pullimages]
  );

  const handleBuyNow = () => {
    addToCartHome(item);
    navigate("/checkout");
  };

  return (
    <section className={styles.productInfoSection}>
      <div className={styles.productLayout}>
        <div className={styles.leftColumn}>
          <ProductImage
            src={pullimages[0]}
            hoverSrc={pullimages[1]}
            alt={title}
            showNew
            showOnlineExclusive
          />
        </div>

        <div className={styles.rightColumn}>
          <p className={styles.categoryLabel}>{category}</p>

          <header className={styles.productHeader}>
            <div className={styles.productDetails}>
              <h1 className={styles.productTitle}>{title}</h1>
              <p className={styles.productPrice}>{price} TND</p>
              <hr className={styles.divider} />
              <p className={styles.productDescription}>{description.intro}</p>

              <div className={styles.productDetailsBlock}>
                <h2 className={styles.detailsTitle}>{description.detailsTitle}</h2>
                <ul className={styles.detailsList}>
                  {description.details!.map((d, i) => (
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
          </div>

          <DeliveryInfo />
        </div>
      </div>
    </section>
  );
}
