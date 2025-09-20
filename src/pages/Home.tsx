import { useState } from "react";
import Hero from "./Hero/Hero";
import bgVideo from "../assets/videos/test.mp4";
import ProductInfo from "./Product/ProductInfo";
import style from "./Home.module.scss";
import Footer from "./Footer/Footer";
import Popup from "./components/popup/Popup";
// ⬅️ adjust path if different

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);

  const productData = {
    category: "New Arrivals",
    title: "Counterfeit - Black",
    price: "79 Dt",
    description: {
      intro: `The Counterfeit Tee carries a vandalized 50DT note across the chest — 
      the central bank scarred, walls tagged, a helicopter circling above. 
      Cut from black polycotton and treated with a stone-wash finish, each 
      shirt bears its own stains, fades, and distressed marks, making no two 
      pieces alike. The fit is regular, unisex, built to wear down and age with time. 
      It's a piece that treats money as fragile, fabric as temporary, and both as 
      canvases for rebellion. 
      
      Money doesn't last. Neither does fabric.`,
      detailsTitle: "Product Details",
      details: ["Black tee", "Regular fit", "Ribbed neckline", "Sublimation printing"],
    },
    sizes: ["Small", "Medium", "Large"],
  };

  return (
    <div className={style.homeContainer}>
      <Hero
        videoSrc={bgVideo}
        title="NOUVELLE COLLECTION"
        description="PRE-FALL 25 - KNOW WHAT I MEAN"
      />

      <ProductInfo
        category={productData.category}
        title={productData.title}
        price={productData.price}
        description={productData.description}
        sizes={productData.sizes}
      />

      <Footer />

      {/* Floating button (hidden while popup is open) */}
      {!showPopup && (
        <button
          type="button"
          className={style.fab}
          aria-label="Open membership popup"
          onClick={() => setShowPopup(true)}
        >
          <svg
            className={style.fabIcon}
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {/* gift icon */}
            <path
              d="M20 12v8a2 2 0 0 1-2 2h-5v-10h7zm-9 0v10H6a2 2 0 0 1-2-2v-8h7zm9-6h-2.18a3 3 0 1 0-4.64 0H12a3 3 0 1 0-4.64 0H5a2 2 0 0 0-2 2v2h18V8a2 2 0 0 0-2-2ZM9 6a1 1 0 0 1 2 0v2H9V6Zm6 0a1 1 0 1 1-2 0v2h2V6Z"
              fill="currentColor"
            />
          </svg>
          <span className={style.fabLabel}>Join the Pattern</span>
        </button>
      )}

      {/* Popup (unmounted when closed) */}
      {showPopup && <Popup onClose={() => setShowPopup(false)} />}
    </div>
  );
}
