import React from "react";
import styles from "./DeleteProduct.module.scss";

type DeleteModalProps = {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function DeleteProductModal({ productName, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Are you sure?</h2>
        <p>Do you really want to delete "{productName}"?</p>
        <div className={styles.modalActions}>
          <button onClick={onConfirm}>Yes</button>
          <button onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
}
