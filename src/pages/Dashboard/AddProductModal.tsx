// components/AddProduct.tsx
import React, {
  useMemo,
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  Fragment,
  useRef,
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

/** New: structured color row */
type ColorRow = {
  id: string;            // local uid
  name: string;          // what backend stores
  hex?: string;          // optional UI-only swatch (not sent unless you choose to later)
  files: File[];         // images for this color
  previews: string[];    // object URLs for the files
  coverIndex: number | null; // which image is the "cover" (sent 1st)
};

export default function AddProduct({ onAdd, onCancel }: Props) {
  const { createProductMultipart, loading, error } = useProducts();

  // ----- Form State -----
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<string>("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [sizesSelected, setSizesSelected] = useState<Record<string, number>>({});

  // REPLACED: old comma field -> rich color rows
  const [colorRows, setColorRows] = useState<ColorRow[]>([]);

  const [description, setDescription] = useState<DescriptionForm>({
    intro: "",
    detailsTitle: "Product Details",
    details: [""],
  });

  const [errMsg, setErrMsg] = useState<string>("");

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      colorRows.forEach((row) => row.previews.forEach((url) => URL.revokeObjectURL(url)));
    };
  }, [colorRows]);

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

  // ----- Color rows UI -----
  const addColorRow = () => {
    setColorRows((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "",
        hex: "#000000",
        files: [],
        previews: [],
        coverIndex: null,
      },
    ]);
  };

  const removeColorRow = (id: string) => {
    setColorRows((prev) => {
      const row = prev.find((r) => r.id === id);
      row?.previews.forEach((url) => URL.revokeObjectURL(url));
      return prev.filter((r) => r.id !== id);
    });
  };

  const moveColorRow = (id: string, dir: -1 | 1) => {
    setColorRows((prev) => {
      const idx = prev.findIndex((r) => r.id === id);
      if (idx < 0) return prev;
      const to = idx + dir;
      if (to < 0 || to >= prev.length) return prev;
      const arr = prev.slice();
      const [row] = arr.splice(idx, 1);
      arr.splice(to, 0, row);
      return arr;
    });
  };

  const updateColorName = (id: string, name: string) => {
    setColorRows((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)));
  };

  const updateColorHex = (id: string, hex: string) => {
    setColorRows((prev) => prev.map((r) => (r.id === id ? { ...r, hex } : r)));
  };

  const handleColorFilesSelect = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const added = Array.from(e.target.files);
    setColorRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const newFiles = r.files.concat(added);
        const newPreviews = r.previews.concat(added.map((f) => URL.createObjectURL(f)));
        const coverIndex =
          r.coverIndex == null && newFiles.length > 0 ? 0 : r.coverIndex;
        return { ...r, files: newFiles, previews: newPreviews, coverIndex };
      })
    );
    e.currentTarget.value = "";
  };

  const removeColorFile = (id: string, idx: number) => {
    setColorRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const files = r.files.slice();
        const previews = r.previews.slice();
        if (previews[idx]) URL.revokeObjectURL(previews[idx]);
        files.splice(idx, 1);
        previews.splice(idx, 1);

        let coverIndex = r.coverIndex;
        if (coverIndex != null) {
          if (idx === coverIndex) coverIndex = files.length ? 0 : null; // reset to first if removed
          else if (idx < coverIndex) coverIndex = coverIndex - 1; // shift left
        }
        return { ...r, files, previews, coverIndex };
      })
    );
  };

  const setCover = (id: string, idx: number) => {
    setColorRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, coverIndex: idx } : r))
    );
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

  // Derived plain colors (names only) for backend
  const colorsForBackend = useMemo(
    () => colorRows.map((r) => r.name.trim()).filter(Boolean),
    [colorRows]
  );

  // Validation
  const validate = () => {
    if (!title.trim()) return "Title is required.";
    if (!price || isNaN(Number(price))) return "Valid price is required.";
    if (!categoryIds.length) return "Please pick at least one category.";

    // Require at least one color with a name
    const namedColors = colorRows.filter(r => r.name.trim());
    if (!namedColors.length) return "At least one color is required.";

    // If a row has files, it must have a name
    const unnamedWithFiles = colorRows.some(r => r.files.length && !r.name.trim());
    if (unnamedWithFiles) return "Please name each color that has images.";

    const hasAnyImage = colorRows.some((r) => r.files.length > 0);
    if (!hasAnyImage) return "Upload at least one image for one of the colors.";

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
    // Build colorFiles with cover first for each color
    const colorFiles: Record<string, File[]> = {};
    colorRows.forEach((row) => {
      const name = row.name.trim();
      if (!name) return;
      if (row.files.length === 0) return;
      let ordered = row.files.slice();
      if (row.coverIndex != null && row.files[row.coverIndex]) {
        const cover = row.files[row.coverIndex];
        ordered = [cover, ...row.files.filter((_, i) => i !== row.coverIndex)];
      }
      colorFiles[name] = ordered;
    });
    const colorsMerged = colorRows
      .filter((row) => row.name.trim()) // only named colors
      .map((row) => {
        let files = row.files.slice();
        if (row.coverIndex != null && row.files[row.coverIndex]) {
          const cover = row.files[row.coverIndex];
          files = [cover, ...row.files.filter((_, i) => i !== row.coverIndex)];
        }
        return {
          name: row.name.trim(),
          files,
        };
      });

    const payload: CreateProductMultipart = {
      title: title.trim(),
      price: Number(price),
      categories: categoryIds,
      sizes: sizesPayload,
      colors: colorsMerged, // ⬅️ merged array
      description: {
        intro: description.intro,
        detailsTitle: description.detailsTitle,
        details: description.details.filter(Boolean),
      },
    };

    try {
      const created = await createProductMultipart(payload);
      onAdd?.(created);
      // clear…
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
            <CategorySelect multiple value={categoryIds} onChange={setCategoryIds} />
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

        {/* -------- Colors Editor -------- */}
        <div className={styles.hr} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Colors</h3>
          <button
            type="button"
            className={styles.addDetailBtn}
            onClick={addColorRow}
            title="Add color"
          >
            + Add Color
          </button>
        </div>
        {!colorRows.length && (
          <p className={styles.hint}>Add at least one color, then upload images per color.</p>
        )}

        <div style={{ display: "grid", gap: 16 }}>
          {colorRows.map((row, idx) => (
            <section
              key={row.id}
              className={styles.colorSection}
              aria-label={`Color ${row.name || idx + 1}`}
              style={{ border: "1px dashed var(--border,#4444)", borderRadius: 12, padding: 12 }}
            >
              <header
                className={styles.colorHeader}
                style={{ display: "flex", gap: 12, alignItems: "center" }}
              >
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => updateColorName(row.id, e.target.value)}
                  placeholder="Color name (e.g., Black)"
                  aria-label="Color name"
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid var(--border,#4444)",
                  }}
                />
                <input
                  type="color"
                  value={row.hex || "#000000"}
                  onChange={(e) => updateColorHex(row.id, e.target.value)}
                  aria-label="Color swatch"
                  title="Swatch (optional)"
                  style={{ width: 40, height: 36, padding: 0, border: "none", cursor: "pointer" }}
                />
                <div style={{ marginLeft: "auto", display: "inline-flex", gap: 6 }}>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => moveColorRow(row.id, -1)}
                    disabled={idx === 0}
                    title="Move up"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => moveColorRow(row.id, +1)}
                    disabled={idx === colorRows.length - 1}
                    title="Move down"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className={styles.iconBtn}
                    onClick={() => removeColorRow(row.id)}
                    title="Remove color"
                    aria-label="Remove color"
                  >
                    ✕
                  </button>
                </div>
              </header>

              <small className={styles.hint}>
                Upload images for {row.name || "this color"}. First image will be used as cover.
              </small>

              <label
                className={styles.dropzoneSmall}
                style={{
                  display: "grid",
                  placeItems: "center",
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid var(--border,#4444)",
                  cursor: "pointer",
                  marginTop: 8,
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleColorFilesSelect(row.id, e)}
                />
                <div className={styles.dzTextSmall}>Click to choose images</div>
              </label>

              {/* Gallery */}
              <div
                className={styles.gallerySmall}
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                  gap: 12,
                  marginTop: 12,
                }}
              >
                {row.previews.map((src, i) => {
                  const isCover = row.coverIndex === i;
                  return (
                    <article
                      key={src}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Delete" || e.key === "Backspace") {
                          e.preventDefault();
                          removeColorFile(row.id, i);
                        } else if (e.key === "Enter") {
                          e.preventDefault();
                          setCover(row.id, i);
                        }
                      }}
                      className={styles.tileSmall}
                      style={{
                        border: `2px solid ${isCover ? "var(--accent,#2563eb)" : "transparent"}`,
                        borderRadius: 12,
                        overflow: "hidden",
                        outline: "1px solid var(--border,#4444)",
                        position: "relative",
                      }}
                    >
                      <img
                        className={styles.thumb}
                        src={src}
                        alt={`${row.name || "color"} image ${i + 1}${isCover ? " (cover)" : ""}`}
                        style={{ width: "100%", height: 120, objectFit: "cover", display: "block" }}
                      />

                      <div
                        // if your CSS module .actions hides this, remove className or ensure it doesn't set display:none
                        className={styles.actions}
                        style={{
                          position: "absolute",
                          inset: 8,
                          display: "flex",
                          gap: 6,
                          justifyContent: "space-between",
                          alignItems: "center",
                          pointerEvents: "none", // keep parent non-interactive
                          zIndex: 2,             // make sure it's above the image
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setCover(row.id, i)}
                          aria-label="Set cover"
                          title="Set cover"
                          style={{
                            pointerEvents: "auto",
                            padding: "4px 8px",
                            borderRadius: 999,
                            border: "none",
                            background: "rgba(0,0,0,0.6)",
                            color: "#fff",             // <-- fix: visible text color
                            fontSize: 12,
                          }}
                        >
                          {isCover ? "Cover ✓" : "Set cover"}
                        </button>

                        <button
                          type="button"
                          onClick={() => removeColorFile(row.id, i)}
                          aria-label={`Remove ${row.name} image ${i + 1}`}
                          title="Remove"
                          style={{
                            pointerEvents: "auto",
                            padding: "4px 8px",
                            borderRadius: 999,
                            border: "none",
                            background: "rgba(0,0,0,0.6)",
                            color: "#fff",             // <-- fix: remove the stray '#', keep text white
                            fontSize: 12,
                          }}
                        >
                          Remove
                        </button>
                      </div>

                      <footer
                        className={styles.meta}
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 8px",
                          fontSize: 12,
                        }}
                      >
                        <span className={styles.name} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {row.files[i]?.name || `image-${i + 1}`}
                        </span>
                        <span className={styles.size}>
                          {row.files[i] ? formatBytes(row.files[i].size) : "—"}
                        </span>
                      </footer>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

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



        <div className={styles.modalActions}>
          <button
            type="submit"
            disabled={
              loading ||
              !title.trim() ||
              !price ||
              !categoryIds.length ||
              colorRows.every(r => !r.name.trim()) // at least one named color
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
