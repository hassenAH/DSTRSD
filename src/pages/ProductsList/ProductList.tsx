import { useEffect, useMemo, useState } from "react";
import styles from "./ProductPage.module.scss";
import ProductCard from "../components/UI/ProductCard";
import { useCart } from "../../utils/CartContext";
import { useProducts } from "../../utils/ProductContext"; // adjust path if different
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
    // first 8 hex chars are epoch seconds
    const secondsHex = id?.slice(0, 8);
    const seconds = parseInt(secondsHex, 16);
    return isNaN(seconds) ? 0 : seconds * 1000;
};

export default function ProductsPage() {
    const { addToCart } = useCart();
    const { products, loading, error, fetchAllProducts } = useProducts();

    const [activeFilter, setActiveFilter] = useState<FilterType>("FEATURED");
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [activeSize, setActiveSize] = useState<SizeType | null>(null);

    // Load from API on mount (if provider didn't already)
    useEffect(() => {
        if (!products || products.length === 0) {
            fetchAllProducts().catch(() => { });
        }
    }, []); // eslint-disable-line

    const categories = ["All", "Men", "Women", "Accessories"]


    // Pick current category products
    const current: ApiProduct[] = useMemo(() => {
        if (activeCategory === "All") return products;
        return products.filter((p) => p.category?.name === activeCategory);
    }, [products, activeCategory]);

    // Filter + sort based on segmented control
    const filtered = useMemo(() => {
        let list = current.slice();

        if (activeFilter === "ALL") {
            // no-op: show all in category
        } else if (activeFilter === "FEATURED") {
            // heuristic: featured = in stock, show higher stock first
            list = list.filter((p) => p.stock > 0).sort((a, b) => b.stock - a.stock);
        } else if (activeFilter === "NEWEST") {
            list = list.sort(
                (a, b) => objectIdTime(b._id) - objectIdTime(a._id)
            );
        } else if (activeFilter === "SIZE") {
            // if a size is chosen, must include it in sizes[]
            if (activeSize) {
                list = list.filter((p) =>
                    (p.sizes || []).map((s) => s.toUpperCase()).includes(activeSize)
                );
            } else {
                // Only show items that are size-based at all
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
                        const firstImage = (p.images && p.images[0]) || "/placeholder.png";
                        const slug = toSlug(p.title);
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
                                            size: activeSize ?? undefined,
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
                            onClick={() => setActiveSize(s)}
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
                <span
                    className={styles.dockBar__thumb}
                    data-pos={activeFilter.toLowerCase()}
                    aria-hidden
                />
            </footer>
        </div>
    );
}
