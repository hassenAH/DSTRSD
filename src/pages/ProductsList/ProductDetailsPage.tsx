import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductInfo from "../../pages/Product/ProductInfo";
import styles from "./ProductDetailsPage.module.scss";
import { useProducts } from "../../utils/ProductContext";

const toSlug = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function ProductDetailsPage() {
    const { slug = "" } = useParams<{ slug: string }>();
    const { products, loading, error, fetchAllProducts } = useProducts();
    const navigate = useNavigate();

    useEffect(() => {
        if (!products || products.length === 0) {
            fetchAllProducts().catch(() => { });
        }
    }, []); // eslint-disable-line

    const product = useMemo(() => {
        if (!products?.length) return null;
        return products.find((p) => toSlug(p.title) === slug) ?? null;
    }, [products, slug]);

    if (loading) return <div className={styles.loading}>Loading product…</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;
    if (!product) return <div className={styles.notFound}>Product not found.</div>;

    const images = product.images?.length ? product.images : ["/placeholder.png"];
    const priceStr = `${product.price} `;
    const categoryName = product.category?.name ?? "Products";
    const desc = product.description ?? { intro: "" };
    const detailsTitle = desc.detailsTitle ?? "Product Details";
    const details = Array.isArray(desc.details) ? desc.details : [];

    return (
        <div className={styles.detailsPage}>
            {/* back button */}

            <button className={styles.backBtn} onClick={() => navigate("/products")}>
                ← Back to Shop
            </button>


            <ProductInfo
                pullimages={images}
                category={categoryName}
                title={product.title}
                price={priceStr}
                description={{
                    intro: desc.intro,
                    detailsTitle,
                    details: [...details],
                }}
                sizes={[...(product.sizes || [])]}
            />
        </div>
    );
}
