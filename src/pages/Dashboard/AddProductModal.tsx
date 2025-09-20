import React, { useState, ChangeEvent } from "react";
import styles from "./AddProduct.module.scss";
import type { Product } from "./Dashboard";

type AddModalProps = {
  onAdd: (product: Product) => void;
  onCancel: () => void;
};

const AVAILABLE_SIZES = ["Small", "Medium", "Large", "X Large"];

export default function AddProductModal({ onAdd, onCancel }: AddModalProps) {
  const [newProduct, setNewProduct] = useState<Product>({
    id: Date.now(),
    name: "",
    price: "",
    description: "",
    sizes: [],
    quantity: 0,
    image: "",
  });

  const [images, setImages] = useState<string[]>([]);

  const handleFileChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const newImages = [...images];
        newImages[index] = reader.result as string;
        setImages(newImages);
        setNewProduct({ ...newProduct, image: newImages[0] }); // première image comme principale
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    let newSizes = newProduct.sizes ? [...newProduct.sizes] : [];
    if (checked) {
      if (!newSizes.includes(size)) newSizes.push(size);
    } else {
      newSizes = newSizes.filter((s) => s !== size);
    }
    setNewProduct({ ...newProduct, sizes: newSizes });
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Add New Product</h2>

        <label>Title</label>
        <input
          type="text"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
          placeholder="Product Name"
        />

        <label>Price</label>
        <input
          type="text"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          placeholder="Price"
        />

        <label>Description</label>
        <textarea
          className={styles.textarea}
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          placeholder="Description"
        />

        <label>Sizes</label>
        <div className={styles.sizesCheckbox}>
          {AVAILABLE_SIZES.map((size) => (
            <label key={size}>
              <input
                type="checkbox"
                checked={newProduct.sizes?.includes(size) || false}
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
          value={newProduct.quantity}
          onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
          placeholder="Quantity"
        />

        <label>Images</label>
        <div className={styles.imagesContainer}>
          {images.map((img, index) => (
            <div key={index} className={styles.imageInputWrapper}>
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(index, e)} />
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
          <button onClick={() => onAdd(newProduct)}>Add</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
