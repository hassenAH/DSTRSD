import * as React from "react";
import styles from "./AboutUs.module.css";

function BrandDescription() {
    return (
        <article className={styles.brandDescription}>
            <p className={styles.descriptionText}>
                Distressed is a creative rebellion — a brand where destruction isn't
                damage, it's design. Every texture tells a story, Every stain has a
                past, Every thread ripped is a thread revealed.
                <br />
                <br />
                We don't follow trends. We carve scars. We don't fake vintage. We
                wear time. We're not cleaned up for approval — we're worn down to be
                real.
                <br />
                <br />
                This is for the makers, the breakers, the tagged and the torn.
                <br />
                <br />
                This is Distressed.
            </p>
        </article>
    );
}

export default BrandDescription;
