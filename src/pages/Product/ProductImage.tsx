"use client";

import { useState } from "react";
import styles from "./ProductImage.module.scss";

interface ProductImageProps {
  src: string;             // default image
  hoverSrc?: string;       // optional hover image
  alt: string;
  showOnlineExclusive?: boolean;
  showNew?: boolean;
}

export default function ProductImage({
  src,
  hoverSrc,
  alt,

}: ProductImageProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className={styles.imageSection}>
      <div
        className={styles.imageFrame}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={isHovered && hoverSrc ? hoverSrc : src}
          alt={alt}
          decoding="async"
          className={styles.productImage}
        />


        <div className={styles.onlineExclusiveBadge}>
          <div className={styles.badgeBackground}>
            <span className={styles.onlineExclusiveText}>
              ONLINE EXCLUSIVE
            </span>
          </div>
        </div>


        <div className={styles.newBadge}>
          <div className={styles.newBadgeBackground}>
            <span className={styles.newText}>NEW</span>
          </div>
        </div>

      </div>
    </section>
  );
}
