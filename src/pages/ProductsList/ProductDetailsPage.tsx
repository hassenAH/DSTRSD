import { useParams } from "react-router-dom";
import ProductInfo from "../../pages/Product/ProductInfo"; // adjust path
import styles from "./ProductDetailsPage.module.scss";     // optional
import { useProducts } from "../../utils/ProductContext";

// Mock catalogue — replace with real data lookup
const CATALOG = {
    "counterfeit-black": {
        category: "New Arrivals",
        title: "Counterfeit - Black",
        price: "79 Dt",
        description: {
            intro:
                "The Counterfeit Tee carries a vandalized 50DT note across the chest...",
            detailsTitle: "Product Details",
            details: ["Black tee", "Regular fit", "Ribbed neckline", "Sublimation printing"],
        },
        sizes: ["Small", "Medium", "Large"],
    },
} as const;

export default function ProductDetailsPage() {
    const { slug = "" } = useParams<{ slug: string }>();
    const product = CATALOG[slug as keyof typeof CATALOG];
const { currentProduct } = useProducts()
    if (!product) {
        return <div className={styles.notFound}>Product not found.</div>;
    }

    // ProductDetailsPage.tsx
    return (
        <div className={styles.detailsPage}>
            <ProductInfo
            pullimages={currentProduct!.images}
                category={product.category}
                title={product.title}
                price={product.price}
                description={{
                    ...product.description,
                    details: [...product.description.details], // ← make mutable copy
                }}
                sizes={[...product.sizes]} // ← make mutable copy
            />
        </div>
    );

}
