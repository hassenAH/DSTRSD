// components/EditProductModal.tsx
import React, { useEffect, useMemo, useState, ChangeEvent, FormEvent } from "react";
import styles from "./EditProduct.module.scss";
import type { Product } from "../../utils/ProductContext"; // use your context Product
import type { UpdateProductInput } from "../../utils/ProductContext";
import CategorySelect from "./CategorySelect";

type EditModalProps = {
  product: Product;
  // Accepts an extended update payload; parent can decide to call JSON PATCH or multipart
  onSave: (updated: UpdateProductInput & {
    imagesFiles?: File[];        // newly added files
    removeImages?: string[];     // existing image URLs (or ids) to remove
    categoryId?: string;         // convenience if your API expects categoryId
  }) => void | Promise<void>;
  onCancel: () => void;
};

const AVAILABLE_SIZES = ["XS", "Small", "Medium", "Large", "X Large", "XXL"];

export default function EditProductModal({ product, onSave, onCancel }: EditModalProps) {
  // ---- Scalar fields ----
  const [title, setTitle] = useState(product.title);
  // show price in major units if you stored cents; adjust to your storage
  const [price, setPrice] = useState<string>(String(product.price));
  const [stock, setStock] = useState<number>(product.stock ?? 0);
  const [categoryId, setCategoryId] = useState<string>(product.category?._id || "");

  // ---- Sizes & Colors ----
  const [sizes, setSizes] = useState<string[]>(product.sizes || []);
  const [colorsInput, setColorsInput] = useState<string>((product.colors || []).join(", "));
  const colors = useMemo(
    () => colorsInput.split(",").map(s => s.trim()).filter(Boolean),
    [colorsInput]
  );

  // ---- Description ----
  const [intro, setIntro] = useState<string>(product.description?.intro || "");
  const [detailsTitle, setDetailsTitle] = useState<string>(product.description?.detailsTitle || "Product Details");
  const [details, setDetails] = useState<string[]>(
    product.description?.details?.length ? product.description.details : [""]
  );

  // ---- Images: existing + new files ----
  const [existingImages, setExistingImages] = useState<string[]>(product.images || []);
  const [removeImages, setRemoveImages] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  // cleanup previews
  useEffect(() => {
    return () => newPreviews.forEach(url => URL.revokeObjectURL(url));
  }, [newPreviews]);

  const toggleSize = (size: string, checked: boolean) => {
    setSizes(prev => checked ? Array.from(new Set([...prev, size])) : prev.filter(s => s !== size));
  };

  const addDetail = () => setDetails(prev => [...prev, ""]);
  const updateDetailAt = (i: number, v: string) =>
    setDetails(prev => prev.map((d, idx) => (idx === i ? v : d)));
  const removeDetailAt = (i: number) => {
    setDetails(prev => {
      const copy = prev.slice();
      copy.splice(i, 1);
      return copy.length ? copy : [""];
    });
  };

  // helper (place near top)
  const formatBytes = (n: number) => {
    if (!n) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(n) / Math.log(k));
    return `${(n / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
  };

  const handleAddFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    setNewFiles(prev => [...prev, ...selected]);
    setNewPreviews(prev => [
      ...prev,
      ...selected.map(f => URL.createObjectURL(f))
    ]);

    // allow selecting the same file twice if needed
    e.currentTarget.value = "";
  };

  const removeNewImageAt = (i: number) => {
    setNewFiles(prev => {
      const copy = prev.slice();
      copy.splice(i, 1);
      return copy;
    });
    setNewPreviews(prev => {
      const copy = prev.slice();
      const [removed] = copy.splice(i, 1);
      if (removed) URL.revokeObjectURL(removed);
      return copy;
    });
  };


  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(x => x !== url));
    setRemoveImages(prev => Array.from(new Set([...prev, url])));
  };



  const validate = () => {
    if (!title.trim()) return "Title is required.";
    if (!price || isNaN(Number(price))) return "Valid price is required.";
    if (!intro.trim()) return "Description intro is required.";
    return "";
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      alert(v);
      return;
    }

    // ⚠️ If your backend expects cents, use Math.round(Number(price) * 100)
    const priceToSend = Number(price);

    const payload: UpdateProductInput & {
      imagesFiles?: File[];
      removeImages?: string[];
      categoryId?: string;
    } = {
      title,
      price: priceToSend,
      stock,
      sizes,
      colors,
      description: {
        intro,
        detailsTitle,
        details: details.filter(Boolean),
      },
      // keep current image array if your JSON PATCH supports it
      // or let backend compute it from removeImages + imagesFiles
      images: existingImages,
      ...(categoryId ? { category: { _id: categoryId, name: product.category?.name || "" } } : {}),
      imagesFiles: newFiles.length ? newFiles : undefined,
      removeImages: removeImages.length ? removeImages : undefined,
      ...(categoryId ? { categoryId } : {}), // convenience if your API reads categoryId
    };

    onSave(payload);
  };

  return (
    <div className={styles.modal} role="dialog" aria-modal="true">
      <form className={styles.modalContent} onSubmit={submit}>
        <h2>Edit “{product.title}”</h2>

        <label>Name</label>
        <input value={title} onChange={e => setTitle(e.target.value)} />

        <div className={styles.grid2}>
          <div>
            <label>Price (TND)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </div>

          <div>
            <label>Stock</label>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={e => setStock(Number(e.target.value))}
            />
          </div>
        </div>

        <label>Category</label>
        <CategorySelect value={categoryId} onChange={setCategoryId} />

        <label>Sizes</label>
        <div className={styles.sizesCheckbox}>
          {AVAILABLE_SIZES.map(size => (
            <label key={size} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={sizes.includes(size)}
                onChange={e => toggleSize(size, e.target.checked)}
              />
              <span className={styles.checkmark} />
              {size}
            </label>
          ))}
        </div>

        <label>Colors (comma separated)</label>
        <input
          value={colorsInput}
          onChange={e => setColorsInput(e.target.value)}
          placeholder="Black, White"
        />

        <div className={styles.hr} />

        <h3>Description</h3>
        <label>Intro</label>
        <textarea
          className={styles.textarea}
          value={intro}
          onChange={e => setIntro(e.target.value)}
        />

        <label>Details Title</label>
        <input
          value={detailsTitle}
          onChange={e => setDetailsTitle(e.target.value)}
        />

        <label>Details (bullets)</label>
        <div className={styles.detailsList}>
          {details.map((d, i) => (
            <div key={i} className={styles.detailRow}>
              <input
                value={d}
                onChange={e => updateDetailAt(i, e.target.value)}
                placeholder={`Detail #${i + 1}`}
              />
              <button type="button" className={styles.iconBtn} onClick={() => removeDetailAt(i)} title="Remove">
                ✕
              </button>
            </div>
          ))}
          <button type="button" className={styles.addDetailBtn} onClick={addDetail}>
            + Add Detail
          </button>
        </div>

        <div className={styles.hr} />

        <h3>Images</h3>

        {/* Uploader */}
        <div className={styles.uploader}>
          {/* Accessible dropzone (label wraps input) */}
          <label className={styles.dropzone}>
            <input type="file" accept="image/*" multiple onChange={handleAddFiles} />
            <div className={styles.dzText}>
              <strong>Click to upload</strong> or drag & drop images
            </div>
          </label>

          {/* Gallery grid */}
          <div className={styles.gallery}>
            {/* Existing server images */}
            {existingImages.map((url) => (
              <div key={`exist-${url}`} className={styles.tile}>
                <img className={styles.thumb} src={url} alt="product" />
                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    aria-label="Remove image"
                    title="Remove"
                  >
                    🗑️
                  </button>
                </div>
                <div className={styles.meta}>
                  <span className={styles.name}>Existing</span>
                  <span className={styles.size}>—</span>
                </div>
              </div>
            ))}

            {/* Newly added (local) files */}
            {newPreviews.map((src, i) => (
              <div key={`new-${src}`} className={styles.tile}>
                <img className={styles.thumb} src={src} alt={`preview-${i}`} />
                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => removeNewImageAt(i)}
                    aria-label="Remove image"
                    title="Remove"
                  >
                    Remove
                  </button>
                </div>
                <div className={styles.meta}>
                  <span className={styles.name}>{newFiles[i]?.name || `image-${i + 1}`}</span>
                  <span className={styles.size}>{newFiles[i] ? formatBytes(newFiles[i].size) : "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.modalActions}>
          <button type="submit">Save</button>
          <button type="button" onClick={onCancel} className={styles.secondaryBtn}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
