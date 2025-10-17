// components/AddProductModal.tsx
import React, { useMemo, useState, ChangeEvent, FormEvent } from "react";
import styles from "./AddProduct.module.scss";

type AddModalProps = {
  onAdd: (serverProduct: any) => void; // product from the server response
  onCancel: () => void;
  apiUrl?: string; // e.g., "http://localhost:5000/api/products"
};

const AVAILABLE_SIZES = ["XS", "Small", "Medium", "Large", "X Large", "XXL"];

type DescriptionForm = {
  intro: string;
  detailsTitle: string;
  details: string[]; // each item is a bullet/line
};

export default function AddProductModal({
  onAdd,
  onCancel,
  apiUrl = "http://localhost:5000/api/products",
}: AddModalProps) {
  // ----- Form State -----
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [stock, setStock] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<string>("");
  const [sizes, setSizes] = useState<string[]>([]);
  const [colorsInput, setColorsInput] = useState<string>(""); // comma separated
  const colors = useMemo(
    () =>
      colorsInput
        .split(",")
        .map(s => s.trim())
        .filter(Boolean),
    [colorsInput]
  );

  const [description, setDescription] = useState<DescriptionForm>({
    intro: "",
    detailsTitle: "Product Details",
    details: [""],
  });

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string>("");

  // ----- Handlers -----
  const handleSizeChange = (size: string, checked: boolean) => {
    setSizes(prev =>
      checked ? Array.from(new Set([...prev, size])) : prev.filter(s => s !== size)
    );
  };

  const handleAddDetail = () =>
    setDescription(d => ({ ...d, details: [...d.details, ""] }));

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

  const handleFilesSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    const nextFiles = [...files, ...selected];
    setFiles(nextFiles);

    const nextPreviews = nextFiles.map(f => URL.createObjectURL(f));
    setPreviews(nextPreviews);
  };

  const removeImageAt = (i: number) => {
    const nf = files.slice();
    nf.splice(i, 1);
    setFiles(nf);
    const np = previews.slice();
    np.splice(i, 1);
    setPreviews(np);
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

  // Submit to backend
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrMsg("");

    const error = validate();
    if (error) {
      setErrMsg(error);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append(
      "description",
      JSON.stringify({
        intro: description.intro,
        detailsTitle: description.detailsTitle,
        details: description.details.filter(Boolean),
      })
    );
    formData.append("price", String(Number(price)));
    formData.append("stock", String(stock));
    formData.append("sizes", JSON.stringify(sizes));
    formData.append("colors", JSON.stringify(colors));
    formData.append("categoryId", categoryId);

    files.forEach(f => formData.append("images", f));

    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/create`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || data?.error || "Failed to create product");
      }

      // Return created product to parent
      onAdd(data.product);
    } catch (err: any) {
      setErrMsg(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modal} role="dialog" aria-modal="true">
      <form className={styles.modalContent} onSubmit={onSubmit}>
        <h2>Add New Product</h2>

        {errMsg && <div className={styles.error}>{errMsg}</div>}

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

        <label>Category ID (Mongo ObjectId)</label>
        <input
          type="text"
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          placeholder="66fc30b8e41a23c5d32aa789"
        />

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

        <label>Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFilesSelect}
        />
        {previews.length > 0 && (
          <div className={styles.imagesGrid}>
            {previews.map((src, i) => (
              <div key={i} className={styles.imageItem}>
                <img src={src} alt={`preview-${i}`} />
                <button
                  type="button"
                  className={styles.removeImgBtn}
                  onClick={() => removeImageAt(i)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={styles.modalActions}>
          <button type="submit" disabled={loading}>
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
