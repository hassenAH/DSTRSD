
import AboutUs from "./AboutUs/AboutUs";
import logoSrc from "../assets/images/LOGO.png";
import imagePrimary from "../assets/images/AboutUs/1.webp";
import imageSecondary from "../assets/images/AboutUs/2.webp";
export default function About() {
  return (
    <>

      <AboutUs
        logoSrc={logoSrc}
        imagePrimary={imagePrimary}
        imageSecondary={imageSecondary}
        heading="Distressed ®"
        subheading="Creative rebellion in texture, time, and truth."
        description1={{
          title: "Manifesto",
          text: (
            <>
              Distressed is a creative rebellion — a brand where destruction isn't
              damage, it's design. Every texture tells a story, Every stain has a
              past, Every thread ripped is a thread revealed.
              <br />
              <br />
              We don't follow trends. We carve scars. We don't fake vintage. We
              wear time. We're not cleaned up for approval — we're worn down to be
              real.
            </>
          ),
        }}
        description2={{
          title: "For Whom",
          text: (
            <>
              This is for the makers, the breakers, the tagged and the torn.
              <br />
              <br />
              This is Distressed.
            </>
          ),
        }}
      />
    </>
  );
}
