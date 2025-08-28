import React from "react";
import "./hero.scss";

interface HeroProps {
  videoSrc: string;
  title: string;
  description: string;
}

const Hero: React.FC<HeroProps> = ({ videoSrc, title, description }) => {
  return (
    <div className="hero">
      <video className="hero__video" autoPlay loop muted playsInline>
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="hero__overlay">
        <h1 className="hero__title">{title}</h1>
        <p className="hero__description">{description}</p>
      </div>
    </div>
  );
};

export default Hero;
