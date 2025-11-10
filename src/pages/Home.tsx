import { useState } from "react";
import Hero from "./Hero/Hero";
import bgVideo from "../assets/videos/Home.mp4";
import ProductInfo from "./Product/ProductInfo";
import style from "./Home.module.scss";
import Footer from "./Footer/Footer";
import Popup from "./components/popup/Popup";
import join from "../assets/images/popup.svg"
import { useProducts } from "../utils/ProductContext";


export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const { currentProduct, loading, error } = useProducts();

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!currentProduct) return <p>No product found.</p>;



  return (
    <div className={style.homeContainer}>
      <Hero
        videoSrc={bgVideo}
        title="Distressed"
        description="Jamais 203"
      />

      <ProductInfo
        id={currentProduct!._id}
        category={currentProduct!.categories[0]}
        title={currentProduct!.title}
        price={currentProduct!.price.toString()}
        description={currentProduct!.description}
        sizes={currentProduct!.sizes} colors={currentProduct!.colors} />

      {/* <CategorySection></CategorySection> */}
      <Footer />

      {/* Floating button (hidden while popup is open) */}
      {!showPopup && (
        <button
          type="button"
          className={style.fab}
          aria-label="Open membership popup"
          onClick={() => setShowPopup(true)}
        >
          <img
            src={join}
            width={"38px"}
            alt="user"
          />
          <span className={style.fabLabel}>Join the Pattern</span>
        </button>
      )}

      {/* Popup (unmounted when closed) */}
      {showPopup && <Popup onClose={() => setShowPopup(false)} />}
    </div>
  );
}
