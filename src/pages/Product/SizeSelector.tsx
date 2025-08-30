"use client";
import { useState } from "react";
import styles from "./SizeSelector.module.scss"

interface SizeSelectorProps {
  sizes: string[];
  selectedSize?: string;
  onSizeChange?: (size: string) => void;
}

export default function SizeSelector({
  sizes,
  selectedSize,
  onSizeChange,
}: SizeSelectorProps) {
  const [selected, setSelected] = useState(selectedSize || sizes[0]);

  const handleSizeChange = (size: string) => {
    setSelected(size);
    onSizeChange?.(size);
  };

  return (
    <div className={styles.sizeSection}>
      <label className={styles.sizeLabel}>Choose a Size</label>
      <div
        className={styles.sizeOptions}
        role="radiogroup"
        aria-label="Size selection"
      >
        {sizes.map((size) => (
          <button
            key={size}
            className={styles.sizeOption}
            onClick={() => handleSizeChange(size)}
            role="radio"
            aria-checked={selected === size}
            aria-label={`Size ${size}`}
          >
            <div className={styles.radioButton}>
              {selected === size && <div className={styles.radioButtonSelected} />}
              <div
                className={
                  selected === size
                    ? styles.radioButtonBorder
                    : styles.radioButtonBorderUnselected
                }
              />
            </div>
            <span
              className={
                selected === size ? styles.sizeText : styles.sizeTextUnselected
              }
            >
              {size}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
