import Hero from "./Hero/Hero";
import bgVideo from "../assets/videos/test.mp4";
import ProductInfo from './Product/ProductInfo';
import style from "./Home.module.scss";
import Footer from "./Footer/Footer";

export default function Home() {
const productData = {
  category: "New Arrivals",
  title: "Counterfeit - Black",
  price: "79 Dt",
  description: (
    <>
      <span className={style.span}>
        The Counterfeit Tee carries a vandalized 50DT note across the chest — 
        the central bank scarred, walls tagged, a helicopter circling above. 
        Cut from black polycotton and treated with a stone-wash finish, each 
        shirt bears its own stains, fades, and distressed marks, making no two 
        pieces alike. The fit is regular, unisex, built to wear down and age with time. 
        It's a piece that treats money as fragile, fabric as temporary, and both as canvases for rebellion.
        <br /><br />
        Money doesn't last. Neither does fabric.
        <br /><br />
      </span>
      <div className={style.div8}>Product Details</div>
      <br />
      <span className={style.span}>
        • Black tee
        <br />• Regular fit
        <br />• Ribbed neckline
        <br />• Sublimation printing
      </span>
    </>
  ),
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
      <Footer/>
    </div>
  );
}
