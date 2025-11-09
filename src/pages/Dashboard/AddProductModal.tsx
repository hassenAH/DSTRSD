// components/AddProduct.tsx
import React, {
  useMemo,
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  Fragment,
} from "react";
import styles from "./AddProduct.module.scss";
import { useProducts } from "../../utils/ProductContext";
import CategorySelect from "./CategorySelect";
import type { CreateProductMultipart } from "../../utils/ProductContext";

// align with your backend accepted sizes
const AVAILABLE_SIZES = ["XS", "Small", "Medium", "Large", "X Large", "XXL"];

type DescriptionForm = {
  intro: string;
  detailsTitle: string;
  details: string[];
};

type Props = {
  onAdd?: (serverProduct: any) => void;
  onCancel?: () => void;
};

export default function AddProduct({ onAdd, onCancel }: Props) {
  const { createProductMultipart, loading, error } = useProducts();

  // ----- Form State -----
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [sizesSelected, setSizesSelected] = useState<Record<string, number>>({});
  const [colorsInput, setColorsInput] = useState<string>("");

  const colors = useMemo(
    () => colorsInput.split(",").map((s) => s.trim()).filter(Boolean),
    [colorsInput]
  );

  const [description, setDescription] = useState<DescriptionForm>({
    intro: "",
    detailsTitle: "Product Details",
    details: [""],
  });

  // Per-color files and previews
  const [colorFiles, setColorFiles] = useState<Record<string, File[]>>({});
  const [colorPreviews, setColorPreviews] = useState<Record<string, string[]>>({});
  const [errMsg, setErrMsg] = useState<string>("");

  // Keep the files/previews in sync with the colors list
  useEffect(() => {
    setColorFiles((prev) => {
      const next = { ...prev };
      colors.forEach((c) => { if (!next[c]) next[c] = []; });
      Object.keys(next).forEach((k) => { if (!colors.includes(k)) delete next[k]; });
      return next;
    });
    setColorPreviews((prev) => {
      const next = { ...prev };
      colors.forEach((c) => { if (!next[c]) next[c] = []; });
      Object.keys(next).forEach((k) => { if (!colors.includes(k)) delete next[k]; });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorsInput]);

  // Clean URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(colorPreviews).flat().forEach((url) => URL.revokeObjectURL(url));
    };
  }, [colorPreviews]);

  // ----- Helpers -----
  const formatBytes = (n: number) => {
    if (!n) return "0 B";
    const k = 1024, sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(n) / Math.log(k));
    return `${(n / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
  };

  const toggleSize = (size: string, enabled: boolean) => {
    setSizesSelected((prev) => {
      const next = { ...prev };
      if (enabled) {
        if (!next[size]) next[size] = 0;
      } else {
        delete next[size];
      }
      return next;
    });
  };

  const setSizeStock = (size: string, stock: number) =>
    setSizesSelected((prev) => ({ ...prev, [size]: Math.max(0, Math.floor(stock || 0)) }));

  const handleColorFilesSelect = (color: string, e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const added = Array.from(e.target.files);
    setColorFiles((prev) => {
      const next = { ...(prev || {}) };
      next[color] = (next[color] || []).concat(added);
      return next;
    });
    setColorPreviews((prev) => {
      const next = { ...(prev || {}) };
      next[color] = (next[color] || []).concat(added.map((f) => URL.createObjectURL(f)));
      return next;
    });
    e.currentTarget.value = "";
  };

  const removeColorFile = (color: string, index: number) => {
    setColorFiles((prev) => {
      const next = { ...(prev || {}) };
      const arr = next[color] ? next[color].slice() : [];
      if (arr[index]) arr.splice(index, 1);
      next[color] = arr;
      return next;
    });
    setColorPreviews((prev) => {
      const next = { ...(prev || {}) };
      const arr = next[color] ? next[color].slice() : [];
      const [removed] = arr.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed);
      next[color] = arr;
      return next;
    });
  };

  // Description helpers
  const handleAddDetail = () =>
    setDescription((d) => ({ ...d, details: [...d.details, ""] }));

  const handleDetailChange = (idx: number, value: string) =>
    setDescription((d) => {
      const next = [...d.details];
      next[idx] = value;
      return { ...d, details: next };
    });

  const handleRemoveDetail = (idx: number) =>
    setDescription((d) => {
      const next = d.details.slice();
      next.splice(idx, 1);
      return { ...d, details: next.length ? next : [""] };
    });

  // Validation
  const validate = () => {
    if (!title.trim()) return "Title is required.";
    if (!price || isNaN(Number(price))) return "Valid price is required.";
    if (!categoryIds.length) return "Please pick at least one category.";
    if (!colors.length) return "At least one color is required.";
    const hasImages = colors.some((c) => (colorFiles[c] || []).length > 0);
    if (!hasImages) return "Upload at least one image for one of the colors.";
    if (!description.intro.trim()) return "Description intro is required.";
    if (!description.detailsTitle.trim()) return "Description detailsTitle is required.";
    return "";
  };

  // Submit
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrMsg("");
    const v = validate();
    if (v) return setErrMsg(v);

    const sizesPayload = Object.entries(sizesSelected).map(([name, stock]) => ({
      name,
      stock,
    }));

    const payload: CreateProductMultipart = {
      title: title.trim(),
      price: Number(price),
      categories: categoryIds,    // <- aligned with backend
      sizes: sizesPayload,
      colors,                     // names only; context converts to [{name}]
      description: {
        intro: description.intro,
        detailsTitle: description.detailsTitle,
        details: description.details.filter(Boolean),
      },
      colorFiles: {},
    };

    colors.forEach((c) => {
      if ((colorFiles[c] || []).length) {
        payload.colorFiles![c] = colorFiles[c];
      }
    });

    try {
      const created = await createProductMultipart(payload);
      onAdd?.(created);
      // Optional: clear form
      setTitle("");
      setPrice("");
      setCategoryIds([]);
      setSizesSelected({});
      setColorsInput("");
      setDescription({ intro: "", detailsTitle: "Product Details", details: [""] });
      setColorFiles({});
      setColorPreviews({});
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
          onChange={(e) => setTitle(e.target.value)}
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
              onChange={(e) => setPrice(e.target.value)}
              placeholder="79"
            />
          </div>

          <div>
            <label>Categories</label>
            <CategorySelect multiple value={categoryIds} onChange={setCategoryIds} size={6} />
          </div>
        </div>

        <label>Sizes (enable and set stock)</label>
        <div className={styles.sizesGrid}>
          {AVAILABLE_SIZES.map((size) => {
            const enabled = Object.prototype.hasOwnProperty.call(sizesSelected, size);
            return (
              <div className={styles.sizeRow} key={size}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={!!enabled}
                    onChange={(e) => toggleSize(size, e.target.checked)}
                  />
                  <span className={styles.checkmark} />
                  {size}
                </label>
                <input
                  type="number"
                  min={0}
                  value={enabled ? String(sizesSelected[size]) : ""}
                  onChange={(e) => setSizeStock(size, Number(e.target.value))}
                  placeholder="stock"
                  disabled={!enabled}
                />
              </div>
            );
          })}
        </div>

        <label>Colors (comma separated)</label>
        <input
          type="text"
          value={colorsInput}
          onChange={(e) => setColorsInput(e.target.value)}
          placeholder="Black, White"
        />

        <div className={styles.hr} />

        <h3>Description</h3>
        <label>Intro</label>
        <textarea
          className={styles.textarea}
          value={description.intro}
          onChange={(e) => setDescription((d) => ({ ...d, intro: e.target.value }))}
          placeholder="The Counterfeit Tee carries a vandalized 50DT note across the chest..."
        />

        <label>Details Title</label>
        <input
          type="text"
          value={description.detailsTitle}
          onChange={(e) => setDescription((d) => ({ ...d, detailsTitle: e.target.value }))}
          placeholder="Product Details"
        />

        <label>Details (bullets)</label>
        <div className={styles.detailsList}>
          {description.details.map((item, i) => (
            <div key={i} className={styles.detailRow}>
              <input
                type="text"
                value={item}
                onChange={(e) => handleDetailChange(i, e.target.value)}
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

        <h3>Images (per color)</h3>
        {!colors.length && (
          <p className={styles.hint}>Enter colors above to upload images for each color.</p>
        )}

        {colors.map((c) => (
          <Fragment key={c}>
            <div className={styles.colorSection}>
              <div className={styles.colorHeader}>
                <strong>{c}</strong>
                <small className={styles.hint}>Upload images for {c} (multiple allowed)</small>
              </div>
              <label className={styles.dropzoneSmall}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleColorFilesSelect(c, e)}
                />
                <div className={styles.dzTextSmall}>Click to choose images for {c}</div>
              </label>

              <div className={styles.gallerySmall}>
                {(colorPreviews[c] || []).map((src, i) => (
                  <div key={src} className={styles.tileSmall}>
                    <img className={styles.thumb} src={src} alt={`${c}-preview-${i}`} />
                    <div className={styles.actions}>
                      <button
                        type="button"
                        onClick={() => removeColorFile(c, i)}
                        aria-label={`Remove ${c} image ${i + 1}`}
                        title="Remove"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className={styles.meta}>
                      <span className={styles.name}>
                        {(colorFiles[c] && colorFiles[c][i]?.name) || `image-${i + 1}`}
                      </span>
                      <span className={styles.size}>
                        {colorFiles[c] && colorFiles[c][i]
                          ? formatBytes(colorFiles[c][i].size)
                          : "—"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Fragment>
        ))}

        <div className={styles.modalActions}>
          <button
            type="submit"
            disabled={
              loading ||
              !title.trim() ||
              !price ||
              !categoryIds.length ||
              colors.length === 0
            }
          >
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
