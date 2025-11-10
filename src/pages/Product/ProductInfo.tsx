// ProductInfo.tsx (updated)
import { useMemo, useState } from "react";
import styles from "./ProductInfo.module.scss";
import QuantitySelector from "./QuantitySelector";
import DeliveryInfo from "./DeliveryInfo";
import ProductImage from "./ProductImage";

import { useNavigate } from "react-router-dom";
import { useCart, type CartItem } from "../../utils/CartContext";
import type { SizeVariant, ColorVariant, ProductDescription } from "../../utils/ProductContext";

interface ProductInfoProps {
  id: string;
  category: string;
  title: string;
  price: string; // e.g. "79 Dt"
  description: ProductDescription;
  colors: ColorVariant[]; // now we get colors with images
  sizes: SizeVariant[];
}

export default function ProductInfo({
  id,
  colors = [],
  title,
  price,
  description,
  sizes = [],
}: ProductInfoProps) {
  const defaultColor = colors[0]?.name ?? "default";
  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);
  const [selectedSize, setSelectedSize] = useState<string>(sizes[0]?.name ?? "");
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const { addToCartHome } = useCart();

  // parse price number
  const unitPrice = useMemo(
    () => Number((price || "").replace(/[^\d.]/g, "")) || 0,
    [price]
  );

  // find images for selected color
  const imagesForColor = useMemo(() => {
    const found = colors.find((c) => c.name === selectedColor);
    return found ? found.images : [];
  }, [colors, selectedColor]);

  const item: CartItem = useMemo(
    () => ({
      id: id,
      name: title,
      image: imagesForColor[0] ?? "", // first image of selected color
      price: unitPrice,
      qty: quantity,
      size: selectedSize,
      color: selectedColor,
    }),
    [selectedSize, selectedColor, title, unitPrice, quantity, imagesForColor]
  );

  const handleBuyNow = () => {
    // optionally check stock for selected size:
    const sizeObj = sizes.find((s) => s.name === selectedSize);
    if (sizeObj && quantity > sizeObj.stock) {
      alert(`Only ${sizeObj.stock} items available in size ${selectedSize}`);
      return;
    }
    addToCartHome(item);
    navigate("/checkout");
  };

  return (
    <section className={styles.productInfoSection}>
      <div className={styles.productLayout}>
        <div className={styles.leftColumn}>
          <ProductImage
            src={imagesForColor[0] ?? ""}
            hoverSrc={imagesForColor[1] ?? ""}
            alt={title}
            showNew
            showOnlineExclusive
          />
          {/* Could add a small gallery/thumbnail list */}
        </div>

        <div className={styles.rightColumn}>
          <header className={styles.productHeader}>
            <div className={styles.productDetails}>
              <h1 className={styles.productTitle}>{title}</h1>
              <p className={styles.productPrice}>{price} TND</p>
              <hr className={styles.divider} />
              <p className={styles.productDescription}>{description.intro}</p>

              <div className={styles.productDetailsBlock}>
                <h2 className={styles.detailsTitle}>{description.detailsTitle}</h2>
                <ul className={styles.detailsList}>
                  {description.details?.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </header>

          <hr className={styles.secondDivider} />

          {/* Color selector */}
          <div className={styles.colorSelector}>
            <label>Color:</label>
            <div className={styles.colorSwatches}>
              {colors.map((c) => (
                <button
                  key={c.name}
                  aria-pressed={c.name === selectedColor}
                  className={`${styles.swatch} ${c.name === selectedColor ? styles.activeSwatch : ""}`}
                  onClick={() => setSelectedColor(c.name)}
                  title={c.name}
                >
                  {/* if you have a tiny color preview image use it, else show text */}
                  {c.images[0] ? (
                    <img src={c.images[0]} alt={c.name} className={styles.swatchImg} />
                  ) : (
                    <span className={styles.swatchLabel}>{c.name}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size selector - assumes sizes include stock */}
          <div className={styles.sizeSelector}>
            <label>Size:</label>
            <div className={styles.sizeOptions}>
              {sizes.map((s) => (
                <button
                  key={s.name}
                  disabled={s.stock <= 0}
                  className={`${styles.sizeBtn} ${s.name === selectedSize ? styles.activeSize : ""}`}
                  onClick={() => setSelectedSize(s.name)}
                  aria-label={`${s.name} ${s.stock <= 0 ? "out of stock" : `${s.stock} available`}`}
                >
                  <span>{s.name}</span>
                  <small className={styles.stockNote}>{s.stock} left</small>
                </button>
              ))}
            </div>
          </div>

          <p className={styles.selectedSizeLabel}>
            Selected: <strong>{selectedSize}</strong> • Color: <strong>{selectedColor}</strong>
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
