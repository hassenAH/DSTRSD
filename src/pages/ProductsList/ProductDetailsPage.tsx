import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProductInfo from "../../pages/Product/ProductInfo";
import styles from "./ProductDetailsPage.module.scss";
import { useProducts } from "../../utils/ProductContext";

const toSlug = (s: string) =>
    s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

export default function ProductDetailsPage() {
    const { slug = "" } = useParams<{ slug?: string }>();
    const { products, loading, error, fetchAllProducts } = useProducts();
    const navigate = useNavigate();

    useEffect(() => {
        // fetch products only if empty
        if (!products || products.length === 0) {
            fetchAllProducts().catch(() => { });
        }
        // run when fetchAllProducts reference changes or when products length is 0 -> avoids infinite loop
    }, [fetchAllProducts, products?.length]);

    const product = useMemo(() => {
        if (!products?.length) return null;
        // match by slugified title OR by id (handy when permalinks use id)
        return (
            products.find((p) => toSlug(p.title) === slug) ??
            products.find((p) => p._id === slug) ??
            null
        );
    }, [products, slug]);

    if (loading) return <div className={styles.loading}>Loading product…</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;
    if (!product) return <div className={styles.notFound}>Product not found.</div>;

    // choose images from first color that has images, otherwise use placeholder
    const firstColorWithImages =
        product.colors?.find((c) => Array.isArray(c.images) && c.images.length > 0);
    const images = firstColorWithImages?.images ?? ["/placeholder.png"];

    // price string (adjust currency formatting if needed)
    const priceStr = `${product.price} TND`;
    const id = product._id;
    const categoryName = product.categories && product.categories.length
        ? product.categories[0]
        : "Products";

    const desc = product.description ?? { intro: "" };
    const detailsTitle = desc.detailsTitle ?? "Product Details";
    const details = Array.isArray(desc.details) ? desc.details : [];

    return (
        <div className={styles.detailsPage}>
            <button className={styles.backBtn} onClick={() => navigate("/products")}>
                ← Back to Shop
            </button>

            <ProductInfo
                id={id}
                category={categoryName}
                title={product.title}
                price={priceStr}
                description={{
                    intro: desc.intro,
                    detailsTitle,
                    details: [...details],
                }}
                // pass the new shapes: sizes (array of {name,stock}) and colors (array of {name,images})
                sizes={product.sizes ?? []}
                // ProductInfo previously accepted colors prop in the updated version — pass it
                // if your ProductInfo expects a `colors` prop, add it there; otherwise it will use the images prop
                // Uncomment next line if ProductInfo signature includes `colors`
                colors={product.colors ?? []}
            />
        </div>
    );
}
