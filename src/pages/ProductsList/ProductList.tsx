import { useEffect, useMemo, useState } from "react";
import styles from "./ProductPage.module.scss";
import ProductCard from "../components/UI/ProductCard";
import { useCart } from "../../utils/CartContext";
import { useProducts } from "../../utils/ProductContext";
import type { Product as ApiProduct } from "../../utils/ProductContext";

type FilterType = "FEATURED" | "NEWEST" | "SIZE" | "ALL";
type SizeType = "SMALL" | "MEDIUM" | "LARGE";

// derive slug from title
const toSlug = (s: string) =>
    s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

// extract timestamp from Mongo ObjectId
const objectIdTime = (id: string) => {
    const secondsHex = id?.slice(0, 8);
    const seconds = parseInt(secondsHex, 16);
    return isNaN(seconds) ? 0 : seconds * 1000;
};

export default function ProductsPage() {
    const { addToCart } = useCart();
    const { products = [], loading, error, fetchAllProducts } = useProducts();

    const [activeFilter, setActiveFilter] = useState<FilterType>("FEATURED");
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [activeSize, setActiveSize] = useState<SizeType | null>(null);

    // Load from API on mount (if provider didn't already)
    useEffect(() => {
        if (!products || products.length === 0) {
            fetchAllProducts().catch(() => { });
        }
    }, [fetchAllProducts, products?.length]);

    // derive categories from products if available, fallback to static list
    const derivedCategories = useMemo(() => {
        const set = new Set<string>();
        products.forEach((p) => {
            (p.categories || []).forEach((c) => {
                if (c) set.add(c);
            });
        });
        return ["All", ...Array.from(set).sort()];
    }, [products]);

    const categories = derivedCategories.length ? derivedCategories : ["All", "Men", "Women", "Accessories"];

    // Pick current category products
    const current: ApiProduct[] = useMemo(() => {
        if (activeCategory === "All") return products;
        return products.filter((p) => (p.categories || []).some((c) => c === activeCategory));
    }, [products, activeCategory]);

    // Filter + sort based on segmented control
    const filtered = useMemo(() => {
        let list = current.slice();

        if (activeFilter === "ALL") {
            // no-op
        } else if (activeFilter === "FEATURED") {
            // featured heuristic: available stock (sum of sizes) > 0, sort by total stock desc
            list = list
                .filter((p) => {
                    const total = (p.sizes || []).reduce((s, it) => s + (Number((it as any).stock) || 0), 0);
                    return total > 0;
                })
                .sort((a, b) => {
                    const sa = (a.sizes || []).reduce((s, it) => s + (Number((it as any).stock) || 0), 0);
                    const sb = (b.sizes || []).reduce((s, it) => s + (Number((it as any).stock) || 0), 0);
                    return sb - sa;
                });
        } else if (activeFilter === "NEWEST") {
            list = list.sort((a, b) => objectIdTime(b._id) - objectIdTime(a._id));
        } else if (activeFilter === "SIZE") {
            if (activeSize) {
                list = list.filter((p) =>
                    (p.sizes || []).some((s) => String((s as any).name).toUpperCase() === activeSize)
                );
            } else {
                list = list.filter((p) => (p.sizes || []).length > 0);
            }
        }

        return list;
    }, [current, activeFilter, activeSize]);

    const handleCategoryChange = (c: string) => {
        setActiveCategory(c);
        setActiveFilter("FEATURED");
        setActiveSize(null);
        setSelectedProduct(null);
    };

    const handleFilterChange = (f: FilterType) => {
        setActiveFilter(f);
        if (f !== "SIZE") setActiveSize(null);
    };

    return (
        <div className={styles.productPage}>
            {/* Sticky mobile header */}
            <header className={styles.mobileBar}>
                <div className={styles.mobileBar__titleRow}>
                    <h1 className={styles.title}>{activeCategory}</h1>
                    <small className={styles.counter}>
                        {loading ? "Loading…" : `${filtered.length} items`} · {activeFilter.toLowerCase()}
                        {activeFilter === "SIZE" && activeSize ? ` · ${activeSize.toLowerCase()}` : ""}
                    </small>
                </div>

                {error && <div className={styles.errorBanner}>{error}</div>}

                {/* Category chips */}
                <nav className={styles.categoryChips} aria-label="Categories">
                    {categories.map((c) => (
                        <button
                            key={c}
                            className={`${styles.chip} ${c === activeCategory ? styles.chip__active : ""}`}
                            onClick={() => handleCategoryChange(c)}
                        >
                            {c}
                        </button>
                    ))}
                </nav>
            </header>

            {/* Grid */}
            <main className={styles.grid}>
                {loading && <div className={styles.loading}>Loading products…</div>}

                {!loading &&
                    filtered.map((p) => {
                        // pick first image from first color that has images, fallback to placeholder
                        const firstColorWithImages = (p.colors || []).find((c) => Array.isArray(c.images) && c.images.length > 0);
                        const firstImage = firstColorWithImages?.images?.[0] ?? "/placeholder.png";
                        const slug = toSlug(p.title || p._id);
                        const displayPrice = `${p.price} DT`;

                        return (
                            <div
                                key={p._id}
                                className={`${styles.cardWrap} ${selectedProduct === p._id ? styles.cardWrap__selected : ""}`}
                            >
                                <ProductCard
                                    slug={slug}
                                    image={firstImage}
                                    name={p.title}
                                    price={displayPrice}
                                    onAddToBag={() => {
                                        addToCart({
                                            id: p._id,
                                            name: p.title,
                                            image: firstImage,
                                            price: p.price,
                                            size: undefined,
                                            qty: 1,
                                            merge: true,
                                        });
                                        setSelectedProduct(p._id);
                                    }}
                                />
                            </div>
                        );
                    })}

                {!loading && filtered.length === 0 && (
                    <div className={styles.emptyState}>No products found for this selection.</div>
                )}
            </main>

            {/* Mobile Size bar as a small sheet above the dock */}
            {activeFilter === "SIZE" && (
                <div className={styles.sizeSheet} role="tablist" aria-label="Size">
                    {(["SMALL", "MEDIUM", "LARGE"] as SizeType[]).map((s) => (
                        <button
                            key={s}
                            role="tab"
                            aria-selected={activeSize === s}
                            className={`${styles.sizeBtn} ${activeSize === s ? styles.sizeBtn__active : ""}`}
                            onClick={() => setActiveSize(activeSize === s ? null : s)}
                        >
                            {s}
                        </button>
                    ))}
                    <button
                        className={`${styles.sizeBtn} ${activeSize === null ? styles.sizeBtn__active : ""}`}
                        onClick={() => setActiveSize(null)}
                        aria-label="Show all sizes"
                    >
                        ALL
                    </button>
                </div>
            )}

            {/* Mobile floating dock filter */}
            <footer className={styles.dockBar} role="tablist" aria-label="Filter (mobile)">
                {(["FEATURED", "NEWEST", "SIZE", "ALL"] as FilterType[]).map((f) => (
                    <button
                        key={f}
                        role="tab"
                        aria-selected={activeFilter === f}
                        className={`${styles.dockSegment} ${activeFilter === f ? styles.dockSegment__active : ""}`}
                        onClick={() => handleFilterChange(f)}
                    >
                        {f}
                    </button>
                ))}
                <span className={styles.dockBar__thumb} data-pos={activeFilter.toLowerCase()} aria-hidden />
            </footer>
        </div>
    );
}
