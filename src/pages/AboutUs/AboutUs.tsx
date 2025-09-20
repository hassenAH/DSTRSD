
import styles from "./AboutUs.module.css";
import BrandDescription from "./BrandDescription";


function AboutUs() {
    return (
        <section className={styles.mainContainer}>
            <div className={styles.contentWrapper}>
                <div className={styles.heroSection}>
                    <img
                        src="https://api.builder.io/api/v1/image/assets/TEMP/f90512fca67c6332e44e55f8c6edc6e665cf791d?width=1014"
                        alt="Distressed brand visual representation showing creative rebellion and worn textures"
                        className={styles.heroImage}
                    />
                    <div className={styles.textContent}>
                        <div className={styles.topDivider} />
                        <div className={styles.headingGroup}>
                            <header className={styles.aboutUsHeader}>
                                <h1 className={styles.aboutUsTitle}>About us</h1>
                            </header>
                            <div className={styles.brandNameSection}>
                                <h2 className={styles.brandName}>DISTRESSED - TROISFOISTRES</h2>
                            </div>
                            <div className={styles.collectionSection}>
                                <h3 className={styles.collectionName}>JAMAIS 203</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <BrandDescription />
            <div className={styles.bottomDivider} />
        </section>
    );
}

export default AboutUs;
