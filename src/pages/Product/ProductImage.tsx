"use client";

import { useState } from "react";
import styles from "./ProductImage.module.scss";

interface ProductImageProps {
  images: string[];
  alt: string;
  showOnlineExclusive?: boolean;
  showNew?: boolean;
}

export default function ProductImage({
  images,
  alt,
  showOnlineExclusive = true,
  showNew = true,
}: ProductImageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const total = images.length;
  const currentSrc = images[currentIndex];

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const goTo = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className={styles.imageSection}>
      <div className={styles.imageFrame}>
        {/* main image */}
        <img
          key={currentSrc}
          src={currentSrc}
          alt={alt}
          decoding="async"
          className={styles.productImage}
        />

        {/* badges */}
        {showOnlineExclusive && (
          <div className={styles.onlineExclusiveBadge}>
            <div className={styles.badgeBackground}>
              <span className={styles.onlineExclusiveText}>
                ONLINE EXCLUSIVE
              </span>
            </div>
          </div>
        )}

        {showNew && (
          <div className={styles.newBadge}>
            <div className={styles.newBadgeBackground}>
              <span className={styles.newText}>NEW</span>
            </div>
          </div>
        )}

        {/* arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              className={`${styles.navButton} ${styles.navPrev}`}
              onClick={goPrev}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              type="button"
              className={`${styles.navButton} ${styles.navNext}`}
              onClick={goNext}
              aria-label="Next image"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* thumbnails row */}
      {total > 1 && (
        <div className={styles.thumbRow}>
          {images.map((img, index) => (
            <button
              key={img + index}
              type="button"
              className={`${styles.thumb} ${index === currentIndex ? styles.thumbActive : ""
                }`}
              onClick={() => goTo(index)}
              aria-label={`Show image ${index + 1}`}
            >
              <img
                src={img}
                alt={`${alt} - view ${index + 1}`}
                className={styles.thumbImage}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
