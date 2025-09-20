import React, { useState, ChangeEvent } from "react";
import styles from "./EditProduct.module.scss";
import type { Product } from "./Dashboard";

type EditModalProps = {
  product: Product;
  onSave: (updated: Product) => void;
  onCancel: () => void;
};

const AVAILABLE_SIZES = ["Small", "Medium", "Large", "X Large"];

export default function EditProductModal({ product, onSave, onCancel }: EditModalProps) {
  const [editedProduct, setEditedProduct] = useState<Product>({ ...product });
  const [images, setImages] = useState<string[]>(product.image ? [product.image] : []);

  const handleSizeChange = (size: string, checked: boolean) => {
    let newSizes = editedProduct.sizes ? [...editedProduct.sizes] : [];
    if (checked) {
      if (!newSizes.includes(size)) newSizes.push(size);
    } else {
      newSizes = newSizes.filter((s) => s !== size);
    }
    setEditedProduct({ ...editedProduct, sizes: newSizes });
  };

  const handleImageChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const newImages = [...images];
        newImages[index] = reader.result as string;
        setImages(newImages);
        setEditedProduct({ ...editedProduct, image: newImages[0] }); // première image comme principale
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Edit {editedProduct.name}</h2>

        <label>Name</label>
        <input
          type="text"
          value={editedProduct.name}
          onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
        />

        <label>Price</label>
        <input
          type="text"
          value={editedProduct.price}
          onChange={(e) => setEditedProduct({ ...editedProduct, price: e.target.value })}
        />

        <label>Description</label>
        <textarea
          className={styles.textarea}
          value={editedProduct.description || ""}
          onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
        />

        <label>Sizes</label>
        <div className={styles.sizesCheckbox}>
          {AVAILABLE_SIZES.map((size) => (
            <label key={size}>
              <input
                type="checkbox"
                checked={editedProduct.sizes?.includes(size) || false}
                onChange={(e) => handleSizeChange(size, e.target.checked)}
              />
              <span className={styles.checkmark}></span>
              {size}
            </label>
          ))}
        </div>

        <label>Quantity</label>
        <input
          type="number"
          value={editedProduct.quantity || 0}
          onChange={(e) => setEditedProduct({ ...editedProduct, quantity: Number(e.target.value) })}
        />

        <label>Images</label>
        <div className={styles.imagesContainer}>
          {images.map((img, index) => (
            <div key={index} className={styles.imageInputWrapper}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(index, e)}
              />
              {img && <img src={img} alt={`Preview ${index}`} className={styles.imagePreview} />}
            </div>
          ))}
          <button
            type="button"
            className={styles.addImageBtn}
            onClick={() => setImages([...images, ""])}
          >
            + Add Image
          </button>
        </div>

        <div className={styles.modalActions}>
          <button onClick={() => onSave(editedProduct)}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
