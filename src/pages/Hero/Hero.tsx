import React, { useEffect } from "react";
import "./Hero.scss";

interface HeroProps {
  videoSrc: string;
  title: string;
  description: string;
}

const Hero: React.FC<HeroProps> = ({ videoSrc, title, description }) => {
  useEffect(() => {
    const video = document.querySelector('.hero__video') as HTMLVideoElement;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // fallback: show a "Tap to play" overlay
        video.addEventListener('click', () => video.play());
      });
    }
  }, []);

  return (
    <div className="hero">
      <video
        className="hero__video"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        webkit-playsinline="true"
      >
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