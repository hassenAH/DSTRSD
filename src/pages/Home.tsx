import { Link } from "react-router-dom";
import NavMenu from "./menu/menu";
import Hero from "./Hero/Hero";
import bgVideo from "../assets/videos/test.mp4";
import Popup from "./components/Popup";
export default function Home() {
  return (
    <div className="text-center">

      <Hero
        videoSrc={bgVideo}
        title="NOUVELLE COLLECTION"
        description="PRE-FALL 25 - KNOW WHAT I MEAN"
      />
      <Popup></Popup>

      <h1 className="text-4xl font-bold text-blue-600">Home Page</h1>
      <Link to="/about" className="mt-6 inline-block text-lg text-blue-500 underline">
        Go to About →
      </Link>
    </div>
  );
}
