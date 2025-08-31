import { useState, useMemo } from "react";
import styles from "./ProductPage.module.scss";
import ProductCard from "../components/UI/ProductCard";
import { useCart } from "../../utils/CartContext";

type FilterType = "NEWEST" | "FEATURED" | "SIZE";
type CategoryType = "Clothes" | "Accessories" | "Women";
type SizeType = "SMALL" | "MEDIUM" | "LARGE";

type Product = {
    id: number;
    name: string;
    price: string;
    image: string;
    category: FilterType;
    size?: SizeType; // used when category === "SIZE"
};

export default function ProductsPage() {
    const [activeFilter, setActiveFilter] = useState<FilterType>("FEATURED");
    const [activeCategory, setActiveCategory] = useState<CategoryType>("Clothes");
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [activeSize, setActiveSize] = useState<SizeType | null>(null);
    const { addToCart, openCart } = useCart();
    const productData: Record<CategoryType, Array<Product>> = {
        Clothes: [
            { id: 1, name: "BASIC TEE", price: "69DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "FEATURED" },
            { id: 2, name: "SLIM FIT SHIRT", price: "89DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "NEWEST" },
            { id: 3, name: "COTTON HOODIE", price: "79DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "FEATURED" },
            { id: 4, name: "CASUAL PANTS", price: "99DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "SIZE", size: "LARGE" },
            { id: 5, name: "DENIM JACKET", price: "129DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "NEWEST" },
            { id: 6, name: "POLO SHIRT", price: "109DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "SIZE", size: "MEDIUM" },
        ],
        Accessories: [
            { id: 11, name: "LEATHER BELT", price: "49 DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "FEATURED" },
            { id: 12, name: "CANVAS BAG", price: "79 DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "NEWEST" },
            { id: 13, name: "CLASSIC WATCH", price: "199 DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "FEATURED" },
            { id: 14, name: "SUNGLASSES", price: "129 DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "SIZE", size: "SMALL" },
            { id: 15, name: "WALLET", price: "69 DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "NEWEST" },
        ],
        Women: [
            { id: 21, name: "SILK BLOUSE", price: "119 DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "FEATURED" },
            { id: 22, name: "MIDI DRESS", price: "149 DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "NEWEST" },
            { id: 23, name: "CASHMERE SCARF", price: "89 DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "FEATURED" },
            { id: 24, name: "HIGH HEELS", price: "179 DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "SIZE", size: "SMALL" },
            { id: 25, name: "LEATHER HANDBAG", price: "249 DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", category: "SIZE", size: "LARGE" },
        ],
    };

    const current = productData[activeCategory] || [];

    const filtered = useMemo(() => {
        if (activeFilter === "SIZE") {
            // Show only "SIZE" products; if a sub-size is chosen, filter by it
            return current.filter(p => p.category === "SIZE" && (!activeSize || p.size === activeSize));
        }
        return current.filter(p => p.category === activeFilter);
    }, [current, activeFilter, activeSize]);

    const handleCategoryChange = (c: CategoryType) => {
        setActiveCategory(c);
        setActiveFilter("FEATURED");
        setActiveSize(null);
        setSelectedProduct(null);
    };

    const handleFilterChange = (f: FilterType) => {
        setActiveFilter(f);
        // reset size when leaving SIZE; keep it when switching within SIZE
        if (f !== "SIZE") setActiveSize(null);
    };

    const handleProductClick = (id: number, name: string) => {
        setSelectedProduct(id);
        setTimeout(() => setSelectedProduct(null), 800);
        console.log(`Clicked on ${name}`);
    };

    return (
        <div className={styles.productPage}>
            {/* Sticky mobile bar */}
            <header className={styles.mobileBar}>
                <div className={styles.mobileBar__titleRow}>
                    <h1 className={styles.title}>{activeCategory}</h1>
                    <small className={styles.counter}>
                        {filtered.length} items · {activeFilter.toLowerCase()}
                        {activeFilter === "SIZE" && activeSize ? ` · ${activeSize.toLowerCase()}` : ""}
                    </small>
                </div>

                {/* Category chips */}
                <nav className={styles.categoryChips} aria-label="Categories">
                    {(["Clothes", "Accessories", "Women"] as CategoryType[]).map((c) => (
                        <button
                            key={c}
                            className={`${styles.chip} ${c === activeCategory ? styles.chip__active : ""}`}
                            onClick={() => handleCategoryChange(c)}
                        >
                            {c}
                        </button>
                    ))}
                </nav>

                {/* Main segmented filter */}
                <div className={styles.segmented} role="tablist" aria-label="Filter">
                    {(["FEATURED", "NEWEST", "SIZE"] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            role="tab"
                            aria-selected={activeFilter === f}
                            className={`${styles.segment} ${activeFilter === f ? styles.segment__active : ""}`}
                            onClick={() => handleFilterChange(f)}
                        >
                            {f}
                        </button>
                    ))}
                    <span
                        className={styles.segmented__thumb}
                        data-pos={activeFilter.toLowerCase()}
                        aria-hidden
                    />
                </div>

                {/* SIZE sub-filter */}
                {activeFilter === "SIZE" && (
                    <div className={styles.sizeBar} role="tablist" aria-label="Size">
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
                        {/* Clear size (show all size-tagged items) */}
                        <button
                            className={`${styles.sizeBtn} ${activeSize === null ? styles.sizeBtn__active : ""}`}
                            onClick={() => setActiveSize(null)}
                            aria-label="Show all sizes"
                        >
                            ALL
                        </button>
                    </div>
                )}
            </header>

            {/* Grid */}
            <main className={styles.grid}>
                {filtered.map((p) => (
                    <div
                        key={p.id}
                        className={`${styles.cardWrap} ${selectedProduct === p.id ? styles.cardWrap__selected : ""}`}
                    >
                        <ProductCard
                            image={p.image}
                            name={p.name}
                            price={p.price}
                            onAddToBag={() => {
                                addToCart({
                                    id: p.id,
                                    name: p.name,
                                    image: p.image,
                                    price: Number(String(p.price).replace(/[^0-9.]/g, "")), // parse "$129"
                                    size: p.size,
                                    qty: 1,
                                    merge: true, // merge same id+size (recommended)
                                });
                                openCart(); // optional: open slide-over after add
                            }}
                        />
                    </div>
                ))}
            </main>
        </div>
    );
}
