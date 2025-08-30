"use client";
import { useState } from "react";
import styles from "./ProductInfo.module.scss";
import SizeSelector from "./SizeSelector";
import QuantitySelector from "./QuantitySelector";
import DeliveryInfo from "./DeliveryInfo";
import ProductImage from "./ProductImage"; 
import pullImage from "../../assets/images/pull.jpg";

interface ProductInfoProps {
  category: string;
  title: string;
  price: string;
description: React.ReactNode;
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

  const handleBuyNow = () => {
    console.log("Buy now clicked", { selectedSize, quantity });
  };

  return (
    <section className={styles.productInfoSection}>
      <div className={styles.productLayout}>
        
        <div className={styles.leftColumn}>
          <ProductImage
            src={pullImage}
            alt={title}
            showOnlineExclusive
            showNew
          />
        </div>

        <div className={styles.rightColumn}>
          <p className={styles.categoryLabel}>{category}</p>

          <header className={styles.productHeader}>
            <div className={styles.productDetails}>
              <h1 className={styles.productTitle}>{title}</h1>
              <p className={styles.productPrice}>{price}</p>
              <div className={styles.divider} />
              <p className={styles.productDescription}>{description}</p>
            </div>
          </header>

          <div className={styles.secondDivider} />

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
            <div className={styles.buyButtonContainer}>
              <button
                className={styles.buyButton}
                onClick={handleBuyNow}
                aria-label={`Buy ${quantity} ${title} in size ${selectedSize}`}
              >
                <span className={styles.buyButtonText}>Buy now</span>
              </button>
            </div>
          </div>

          <DeliveryInfo />
        </div>
      </div>
    </section>
  );
}
