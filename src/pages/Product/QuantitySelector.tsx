"use client";
import { useState } from "react";
import styles from "./QuantitySelector.module.scss"; 
interface QuantitySelectorProps {
  initialQuantity?: number;
  min?: number;
  max?: number;
  onQuantityChange?: (quantity: number) => void;
}

export default function QuantitySelector({
  initialQuantity = 1,
  min = 1,
  max = 99,
  onQuantityChange,
}: QuantitySelectorProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleDecrease = () => {
    if (quantity > min) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityChange?.(newQuantity);
    }
  };

  return (
    <div className={styles.quantitySelector}>
      <div className={styles.quantityBackground} />
      <button
        className={styles.quantityMinus}
        onClick={handleDecrease}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
      >
        -
      </button>
      <span className={styles.quantityValue} aria-label={`Quantity: ${quantity}`}>
        {quantity}
      </span>
      <button
        className={styles.quantityPlus}
        onClick={handleIncrease}
        disabled={quantity >= max}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
