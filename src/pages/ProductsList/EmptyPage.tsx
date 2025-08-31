import { useMemo, useState } from "react";
import { Link } from "react-router-dom"; // if you don't use RR, swap <Link> with <a>
import styles from "./EmptyPage.module.scss";
import ProductCard from "../components/UI/ProductCard";


type Recommendation = {
    id: number;
    name: string;
    price: string;
    image: string;
};

type AccessoriesPageProps = {
    recommendations?: Recommendation[];
};

export default function AccessoriesPage({ recommendations = [] }: AccessoriesPageProps) {


    const hasRecs = useMemo(() => recommendations.length > 0, [recommendations]);


    return (
        <div className={styles.page}>
            <header className={styles.hero}>
                <div className={styles.hero__icon} aria-hidden />
                <h1 className={styles.hero__title}>Accessories</h1>
                <p className={styles.hero__subtitle}>
                    We’re still crafting this category. In the meantime, explore other picks or get notified.
                </p>

                <div className={styles.hero__ctaRow}>
                    <Link to="/products?category=Clothes" className={styles.btnPrimary}>
                        Browse Clothes
                    </Link>
                    <Link to="/products?category=Women" className={styles.btnGhost}>
                        Browse Women
                    </Link>
                </div>


            </header>

            {hasRecs && (
                <section className={styles.recs} aria-labelledby="recs-title">
                    <div className={styles.recs__head}>
                        <h2 id="recs-title" className={styles.recs__title}>
                            Popular right now
                        </h2>
                        <span className={styles.recs__count}>{recommendations.length} items</span>
                    </div>
                    <div className={styles.recs__grid}>
                        {recommendations.map((p) => (
                            <div key={p.id} className={styles.cardWrap}>
                                <ProductCard image={p.image} name={p.name} price={p.price} onClick={() => { }} />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
