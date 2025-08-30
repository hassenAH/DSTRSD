import styles from './ProductImage.module.scss';

interface ProductImageProps {
  src: string;
  alt: string;
  showOnlineExclusive?: boolean;
  showNew?: boolean;
}

export default function ProductImage({
  src,
  alt,
  showOnlineExclusive = false,
  showNew = false,
}: ProductImageProps) {
  return (
    <section className={styles.imageSection}>
      <div className={styles.imageContainer}>
        <div className={styles.imageWrapper}>
          <div className={styles.imageBorder}>
            <div className={styles.imageFrame}>
              <img src={src} alt={alt} className={styles.productImage} />

              {}
              {showOnlineExclusive && (
                <div className={styles.onlineExclusiveBadge}>
                  <div className={styles.badgeBackground}>
                    <div className={styles.badgeContainer}>
                      <div className={styles.badgeContent}>
                        <div className={styles.badgeTextWrapper}>
                          <span className={styles.onlineExclusiveText}>
                            ONLINE EXCLUSIVE
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {}
              {showNew && (
                <div className={styles.newBadge}>
                  <div className={styles.newBadgeBackground}>
                    <div className={styles.newBadgeContainer}>
                      <div className={styles.newBadgeContent}>
                        <div className={styles.newBadgeTextWrapper}>
                          <span className={styles.newText}>NEW</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
