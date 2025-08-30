import styles from './ProductDetail.module.scss'; 
import ProductImage from './ProductImage';
import ProductInfo from './ProductInfo';
import pullImage from "../../assets/images/pull.jpg";

export default function ProductDetail() {
  const productData = {
    category: "New Arrivals",
    title: "Counterfeit - Black",
    price: "79 Dt",
    description:
      "The Counterfeit Tee carries a vandalized 50DT note across the chest — the central bank scarred, walls tagged, a helicopter circling above. Cut from black polycotton and treated with a stone-wash finish, each shirt bears its own stains, fades, and distressed marks, making no two pieces alike. The fit is regular, unisex, built to wear down and age with time. It's a piece that treats money as fragile, fabric as temporary, and both as canvases for rebellion. Money doesn't last. Neither does fabric. Product Details Black tee Regular fit Ribbed neckline Sublimation printing",
    sizes: ["Small", "Medium", "Large"],
  };

  return (
    <main className={styles.productDetailSection}>
      <div className={styles.productDetailContent}>
        <ProductImage
          src={pullImage}
          alt={productData.title}
          showOnlineExclusive
          showNew
        />

        <div className={styles.productInfoContainer}>
          <ProductInfo
            category={productData.category}
            title={productData.title}
            price={productData.price}
            description={productData.description}
            sizes={productData.sizes}
          />
        </div>
      </div>
    </main>
  );
}
