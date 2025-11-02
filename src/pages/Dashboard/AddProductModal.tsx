// components/AddProductModal.tsx
import React, { useMemo, useState, ChangeEvent, FormEvent, useEffect } from "react";
import styles from "./AddProduct.module.scss";
import { useProducts } from "../../utils/ProductContext";
import CategorySelect from "./CategorySelect";

type AddModalProps = {
  onAdd: (serverProduct: any) => void; // product from the server response
  onCancel: () => void;
};

// align with your backend accepted sizes
const AVAILABLE_SIZES = ["XS", "Small", "Medium", "Large", "X Large", "XXL"];

type DescriptionForm = {
  intro: string;
  detailsTitle: string;
  details: string[];
};

export default function AddProductModal({ onAdd, onCancel }: AddModalProps) {
  const { createProductMultipart, loading, error } = useProducts();

  // ----- Form State -----
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>(""); // user enters major units (e.g., 79)
  const [stock, setStock] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string>("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [colorsInput, setColorsInput] = useState<string>("");

  const colors = useMemo(
    () => colorsInput.split(",").map(s => s.trim()).filter(Boolean),
    [colorsInput]
  );

  const [description, setDescription] = useState<DescriptionForm>({
    intro: "",
    detailsTitle: "Product Details",
    details: [""],
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [errMsg, setErrMsg] = useState<string>("");

  // ----- File preview cleanup -----
  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  // ----- Handlers -----
  const handleSizeChange = (size: string, checked: boolean) => {
    setSizes(prev => checked ? Array.from(new Set([...prev, size])) : prev.filter(s => s !== size));
  };

  const handleAddDetail = () => setDescription(d => ({ ...d, details: [...d.details, ""] }));
  const handleDetailChange = (idx: number, value: string) =>
    setDescription(d => {
      const next = [...d.details];
      next[idx] = value;
      return { ...d, details: next };
    });
  const handleRemoveDetail = (idx: number) =>
    setDescription(d => {
      const next = d.details.slice();
      next.splice(idx, 1);
      return { ...d, details: next.length ? next : [""] };
    });

  // helper at top (near imports)
  const formatBytes = (n: number) => {
    if (!n) return "0 B";
    const k = 1024, sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(n) / Math.log(k));
    return `${(n / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
  };

  // replace handleFilesSelect
  const handleFilesSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);

    setFiles(prev => [...prev, ...selected]);
    setPreviews(prev => [
      ...prev,
      ...selected.map(f => URL.createObjectURL(f)),
    ]);

    // allow choosing the same file again
    e.currentTarget.value = "";
  };

  // replace removeImageAt
  const removeImageAt = (i: number) => {
    setFiles(prev => {
      const copy = prev.slice();
      copy.splice(i, 1);
      return copy;
    });
    setPreviews(prev => {
      const copy = prev.slice();
      const [removed] = copy.splice(i, 1);
      if (removed) URL.revokeObjectURL(removed);
      return copy;
    });
  };

  // Minimal client-side validation
  const validate = () => {
    if (!title.trim()) return "Title is required.";
    if (!price || isNaN(Number(price))) return "Valid price is required.";
    if (!categoryId || categoryId.length < 10) return "Valid categoryId (ObjectId) is required.";
    if (files.length === 0) return "At least one product image is required.";
    if (!description.intro.trim()) return "Description intro is required.";
    if (!description.detailsTitle.trim()) return "Description detailsTitle is required.";
    return "";
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrMsg("");

    const v = validate();
    if (v) return setErrMsg(v);

    // ⚠️ PRICE UNITS:
    // If your backend expects "DT" as major units, send Number(price).
    // If it expects "cents", send Math.round(Number(price) * 100).
    const priceToSend = Number(price); // or Math.round(Number(price) * 100)

    try {
      const created = await createProductMultipart({
        title,
        price: priceToSend,
        stock,
        categoryId,
        sizes,
        colors,
        description: {
          intro: description.intro,
          detailsTitle: description.detailsTitle,
          details: description.details.filter(Boolean),
        },
        images: files,
      });

      onAdd(created);
    } catch (err: any) {
      setErrMsg(err.message || "Something went wrong");
    }
  };

  return (
    <div className={styles.modal} role="dialog" aria-modal="true">
      <form className={styles.modalContent} onSubmit={onSubmit}>
        <h2>Add New Product</h2>

        {(errMsg || error) && <div className={styles.error}>{errMsg || error}</div>}

        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Counterfeit - Black"
        />

        <div className={styles.grid2}>
          <div>
            <label>Price (TND)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="79"
            />
          </div>

          <div>
            <label>Stock</label>
            <input
              type="number"
              min={0}
              value={stock}
              onChange={e => setStock(Number(e.target.value))}
              placeholder="20"
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
                onChange={e => handleSizeChange(size, e.target.checked)}
              />
              <span className={styles.checkmark} />
              {size}
            </label>
          ))}
        </div>

        <label>Colors (comma separated)</label>
        <input
          type="text"
          value={colorsInput}
          onChange={e => setColorsInput(e.target.value)}
          placeholder="Black, White"
        />

        <div className={styles.hr} />

        <h3>Description</h3>
        <label>Intro</label>
        <textarea
          className={styles.textarea}
          value={description.intro}
          onChange={e => setDescription(d => ({ ...d, intro: e.target.value }))}
          placeholder="The Counterfeit Tee carries a vandalized 50DT note across the chest..."
        />

        <label>Details Title</label>
        <input
          type="text"
          value={description.detailsTitle}
          onChange={e => setDescription(d => ({ ...d, detailsTitle: e.target.value }))}
          placeholder="Product Details"
        />

        <label>Details (bullets)</label>
        <div className={styles.detailsList}>
          {description.details.map((item, i) => (
            <div key={i} className={styles.detailRow}>
              <input
                type="text"
                value={item}
                onChange={e => handleDetailChange(i, e.target.value)}
                placeholder={`Detail #${i + 1}`}
              />
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => handleRemoveDetail(i)}
                aria-label="Remove detail"
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" className={styles.addDetailBtn} onClick={handleAddDetail}>
            + Add Detail
          </button>
        </div>

        <div className={styles.hr} />

        <h3>Images</h3>

        <div className={styles.uploader}>
          {/* Accessible dropzone */}
          <label className={styles.dropzone}>
            <input type="file" accept="image/*" multiple onChange={handleFilesSelect} />
            <div className={styles.dzText}>
              <strong>Click to upload</strong> or drag & drop images
            </div>
          </label>

          {/* Gallery */}
          <div className={styles.gallery}>
            {previews.map((src, i) => (
              <div key={src} className={styles.tile}>
                <img className={styles.thumb} src={src} alt={`preview-${i}`} />
                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => removeImageAt(i)}
                    aria-label="Remove image"
                    title="Remove"
                  >
                    🗑️
                  </button>
                </div>
                <div className={styles.meta}>
                  <span className={styles.name}>{files[i]?.name || `image-${i + 1}`}</span>
                  <span className={styles.size}>{files[i] ? formatBytes(files[i].size) : "—"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>


        <div className={styles.modalActions}>
          <button type="submit" disabled={loading || !title.trim() || !price || !categoryId || !files.length}>
            {loading ? "Saving..." : "Add Product"}
          </button>

          <button type="button" onClick={onCancel} className={styles.secondaryBtn}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
