// components/EditProductModal.tsx
"use client";

import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
    ChangeEvent,
    FormEvent,
} from "react";
import styles from "./EditProduct.module.scss";
import type { Product, UpdateProductMultipart } from "../../utils/ProductContext";
import { useProducts } from "../../utils/ProductContext";
import CategorySelect from "./CategorySelect";

const AVAILABLE_SIZES = ["XS", "Small", "Medium", "Large", "X Large", "XXL"];

type EditModalProps = {
    product: Product;
    /** Optional: if omitted, the modal will call context.updateProductMultipart itself */
    onSave?: (updated: UpdateProductMultipart) => void | Promise<void>;
    onCancel: () => void;
};

/** Local color row for editing */
type ColorRow = {
    id: string;
    name: string;
    hex?: string;
    files: File[];
    previews: string[];
    existing: string[];          // existing images from backend
    removedExisting: string[];   // ones the user deleted
    coverIndex: number | null;
};

export default function EditProductModal({
    product,
    onSave,
    onCancel,
}: EditModalProps) {
    const { updateProductMultipart, loading, error } = useProducts();

    // ---- Scalars ----
    const [title, setTitle] = useState(product.title);
    const [price, setPrice] = useState(String(product.price));
    const [categoryIds, setCategoryIds] = useState<string[]>(
        (product as any).categories?.map((c: any) =>
            typeof c === "string" ? c : c?._id || c
        ) || []
    );

    // ---- Sizes ----
    const [sizesSelected, setSizesSelected] = useState<Record<string, number>>(
        () =>
            (product.sizes || []).reduce((acc, s: any) => {
                if (typeof s === "object" && s.name) acc[s.name] = s.stock ?? 0;
                else if (typeof s === "string") acc[s] = 0;
                return acc;
            }, {} as Record<string, number>)
    );

    // ---- Description ----
    const [intro, setIntro] = useState(product.description?.intro || "");
    const [detailsTitle, setDetailsTitle] = useState(
        product.description?.detailsTitle || "Product Details"
    );
    const [details, setDetails] = useState<string[]>(
        product.description?.details?.length
            ? product.description.details
            : [""]
    );

    // ---- Colors (rows with existing + new images) ----
    const [colorRows, setColorRows] = useState<ColorRow[]>(
        () =>
            (product.colors || []).map((cv: any) => ({
                id: crypto.randomUUID(),
                name: cv?.name || String(cv || ""),
                hex: "#000000",
                files: [],
                previews: [],
                existing: Array.isArray(cv?.images) ? cv.images : [],
                removedExisting: [],
                coverIndex: null,
            }))
    );

    // Track created object URLs for safe cleanup
    const createdUrlsRef = useRef<string[]>([]);
    useEffect(() => {
        return () => {
            // Revoke all created URLs
            createdUrlsRef.current.forEach((u) => {
                try {
                    URL.revokeObjectURL(u);
                } catch { }
            });
            createdUrlsRef.current = [];
        };
    }, []);

    // ---- Sizes helpers ----
    const toggleSize = (size: string, enabled: boolean) => {
        setSizesSelected((prev) => {
            const next = { ...prev } as Record<string, number>;
            if (enabled) {
                if (!Object.prototype.hasOwnProperty.call(next, size)) next[size] = 0;
            } else {
                delete next[size];
            }
            return next;
        });
    };

    const setSizeStock = (size: string, stock: number) =>
        setSizesSelected((prev) => ({
            ...prev,
            [size]: Math.max(0, Math.floor(stock || 0)),
        }));

    // ---- Colors helpers ----
    const addColorRow = () =>
        setColorRows((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                name: "",
                hex: "#000000",
                files: [],
                previews: [],
                existing: [],
                removedExisting: [],
                coverIndex: null,
            },
        ]);

    const removeColorRow = (id: string) => {
        setColorRows((prev) => {
            const row = prev.find((r) => r.id === id);
            // cleanup previews for this row
            row?.previews.forEach((u) => {
                try {
                    URL.revokeObjectURL(u);
                } catch { }
            });
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

    // When renaming a color
    const updateColorName = (id: string, name: string) => {
        name = name.trim();
        setColorRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, name } : r))
        );
    };

    const updateColorHex = (id: string, hex: string) => {
        setColorRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, hex } : r))
        );
    };

    const handleColorFilesSelect = (id: string, e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const added = Array.from(e.target.files);
        setColorRows((prev) =>
            prev.map((r) => {
                if (r.id !== id) return r;
                const files = r.files.concat(added);
                const previews = r.previews.concat(
                    added.map((f) => {
                        const url = URL.createObjectURL(f);
                        createdUrlsRef.current.push(url);
                        return url;
                    })
                );
                const coverIndex =
                    r.coverIndex == null && files.length > 0 ? 0 : r.coverIndex;
                return { ...r, files, previews, coverIndex };
            })
        );
        e.currentTarget.value = "";
    };

    const setCover = (id: string, idx: number) => {
        setColorRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, coverIndex: idx } : r))
        );
    };

    const removeColorFile = (id: string, idx: number) => {
        setColorRows((prev) =>
            prev.map((r) => {
                if (r.id !== id) return r;
                const files = r.files.slice();
                const previews = r.previews.slice();
                const url = previews[idx];
                if (url) {
                    try {
                        URL.revokeObjectURL(url);
                    } catch { }
                    createdUrlsRef.current = createdUrlsRef.current.filter(
                        (u) => u !== url
                    );
                }
                files.splice(idx, 1);
                previews.splice(idx, 1);
                let coverIndex = r.coverIndex;
                if (coverIndex != null) {
                    if (idx === coverIndex) coverIndex = files.length ? 0 : null;
                    else if (idx < coverIndex) coverIndex = coverIndex - 1;
                }
                return { ...r, files, previews, coverIndex };
            })
        );
    };

    const removeExistingColorImage = (id: string, url: string) => {
        setColorRows((prev) =>
            prev.map((r) => {
                if (r.id !== id) return r;
                return {
                    ...r,
                    existing: r.existing.filter((x) => x !== url),
                    removedExisting: [...r.removedExisting, url],
                };
            })
        );
    };

    // ---- Description helpers ----
    const addDetail = () => setDetails((prev) => [...prev, ""]);
    const updateDetailAt = (i: number, v: string) =>
        setDetails((prev) => prev.map((d, idx) => (idx === i ? v : d)));
    const removeDetailAt = (i: number) =>
        setDetails((prev) => {
            const copy = prev.slice();
            copy.splice(i, 1);
            return copy.length ? copy : [""];
        });

    // ---- Derived ----
    const colorsForBackend = useMemo(
        () => colorRows.map((r) => r.name.trim()).filter(Boolean),
        [colorRows]
    );

    const formatBytes = (n: number) => {
        if (!n) return "0 B";
        const k = 1024,
            sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(n) / Math.log(k));
        return `${(n / Math.pow(k, i)).toFixed(i ? 1 : 0)} ${sizes[i]}`;
    };

    // ---- Validation ----
    const validate = () => {
        if (!title.trim()) return "Title is required.";
        const n = Number(price);
        if (price.trim() === "" || Number.isNaN(n) || n < 0)
            return "Valid non-negative price is required.";
        if (!intro.trim()) return "Intro description is required.";
        if (!categoryIds.length) return "Select at least one category.";
        if (!colorsForBackend.length) return "Add at least one color.";
        return "";
    };

    const canSubmit = validate() === "";

    // ---- Submit ----
    const submit = async (e: FormEvent) => {
        e.preventDefault();
        const v = validate();
        if (v) return alert(v);

        const sizesPayload = Object.entries(sizesSelected).map(
            ([name, stock]) => ({ name, stock })
        );

        // Build colorFiles and removeImages from rows (keyed by color name)
        const colorFiles: Record<string, File[]> = {};
        const removeImages: Record<string, string[]> = {};

        colorRows.forEach((row) => {
            const name = row.name.trim();
            if (!name) return;

            // new files
            if (row.files.length > 0) {
                let ordered = row.files.slice();
                if (row.coverIndex != null && row.files[row.coverIndex]) {
                    const cover = row.files[row.coverIndex];
                    ordered = [
                        cover,
                        ...row.files.filter((_, i) => i !== row.coverIndex),
                    ];
                }
                colorFiles[name] = ordered;
            }

            // existing images to delete
            if (row.removedExisting.length > 0) {
                removeImages[name] = row.removedExisting;
            }
        });

        const payload: UpdateProductMultipart = {
            title: title.trim(),
            price: Number(price),
            categories: categoryIds,
            sizes: sizesPayload,
            colors: colorsForBackend, // names only: conveys renames and order
            description: {
                intro,
                detailsTitle,
                details: details.map((d) => d.trim()).filter(Boolean),
            },
            removeImages,
            colorFiles,
        };

        try {
            if (onSave) await onSave(payload);
            else await updateProductMultipart(product._id, payload);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.modal} role="dialog" aria-modal="true">
            <form className={styles.modalContent} onSubmit={submit}>
                <h2>Edit “{product.title}”</h2>

                {error && <div className={styles.error}>{String(error)}</div>}

                <label>Title</label>
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Product title"
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
                        <CategorySelect
                            multiple
                            value={categoryIds}
                            onChange={setCategoryIds}
                        />
                    </div>
                </div>

                <label>Sizes (enable and set stock)</label>
                <div className={styles.sizesGrid}>
                    {AVAILABLE_SIZES.map((size) => {
                        const enabled = Object.prototype.hasOwnProperty.call(
                            sizesSelected,
                            size
                        );
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
                                    onChange={(e) =>
                                        setSizeStock(size, Number(e.target.value))
                                    }
                                    placeholder="stock"
                                    disabled={!enabled}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* ---------- Colors Editor ---------- */}
                <div className={styles.hr} />
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <h3 style={{ margin: 0 }}>Colors</h3>
                    <button
                        type="button"
                        className={styles.addDetailBtn}
                        onClick={addColorRow}
                    >
                        + Add Color
                    </button>
                </div>
                {!colorRows.length && (
                    <p className={styles.hint}>
                        Add at least one color, then upload images per color.
                    </p>
                )}

                <div style={{ display: "grid", gap: 16 }}>
                    {colorRows.map((row, idx) => (
                        <section
                            key={row.id}
                            className={styles.colorSection}
                            aria-label={`Color ${row.name || idx + 1}`}
                            style={{
                                border: "1px dashed var(--border,#4444)",
                                borderRadius: 12,
                                padding: 12,
                            }}
                        >
                            <header
                                className={styles.colorHeader}
                                style={{
                                    display: "flex",
                                    gap: 12,
                                    alignItems: "center",
                                }}
                            >
                                <input
                                    type="text"
                                    value={row.name}
                                    onChange={(e) =>
                                        updateColorName(row.id, e.target.value)
                                    }
                                    placeholder="Color name (e.g., Black)"
                                    aria-label="Color name"
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="color"
                                    value={row.hex || "#000000"}
                                    onChange={(e) => updateColorHex(row.id, e.target.value)}
                                    aria-label="Color swatch"
                                    title="Swatch (optional)"
                                    style={{
                                        width: 40,
                                        height: 36,
                                        padding: 0,
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                />
                                <div
                                    style={{
                                        marginLeft: "auto",
                                        display: "inline-flex",
                                        gap: 6,
                                    }}
                                >
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

                            {/* Existing images */}
                            {row.existing.length > 0 && (
                                <div
                                    className={styles.gallerySmall}
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "repeat(auto-fill, minmax(140px, 1fr))",
                                        gap: 12,
                                        marginTop: 12,
                                    }}
                                >
                                    {row.existing.map((url) => (
                                        <article
                                            key={url}
                                            className={styles.tileSmall}
                                            style={{ position: "relative" }}
                                        >
                                            <img
                                                className={styles.thumb}
                                                src={url}
                                                alt={`${row.name}-img`}
                                                style={{
                                                    width: "100%",
                                                    height: 120,
                                                    objectFit: "cover",
                                                }}
                                            />
                                            <div
                                                className={styles.actions}
                                                style={{
                                                    position: "absolute",
                                                    inset: 8,
                                                    display: "flex",
                                                    justifyContent: "flex-end",
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeExistingColorImage(row.id, url)
                                                    }
                                                    title="Remove"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                            <div
                                                className={styles.meta}
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    padding: "6px 8px",
                                                    fontSize: 12,
                                                }}
                                            >
                                                <span className={styles.name}>Existing</span>
                                                <span className={styles.size}>—</span>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}

                            {/* Upload new ones */}
                            <label
                                className={styles.dropzoneSmall}
                                style={{
                                    display: "grid",
                                    placeItems: "center",
                                    padding: 16,
                                    border: "1px solid var(--border,#4444)",
                                    borderRadius: 12,
                                    marginTop: 8,
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleColorFilesSelect(row.id, e)}
                                />
                                <div className={styles.dzTextSmall}>
                                    Click to choose images
                                </div>
                            </label>

                            <div
                                className={styles.gallerySmall}
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(auto-fill, minmax(140px, 1fr))",
                                    gap: 12,
                                    marginTop: 12,
                                }}
                            >
                                {row.previews.map((src, i) => {
                                    const isCover = row.coverIndex === i;
                                    return (
                                        <article
                                            key={src}
                                            className={styles.tileSmall}
                                            style={{
                                                position: "relative",
                                                border: `2px solid ${isCover ? "var(--accent,#2563eb)" : "transparent"
                                                    }`,
                                                borderRadius: 12,
                                                overflow: "hidden",
                                                outline: "1px solid var(--border,#4444)",
                                            }}
                                        >
                                            <img
                                                className={styles.thumb}
                                                src={src}
                                                alt={`${row.name}-preview-${i}`}
                                                style={{
                                                    width: "100%",
                                                    height: 120,
                                                    objectFit: "cover",
                                                }}
                                            />
                                            <div
                                                className={styles.actions}
                                                style={{
                                                    position: "absolute",
                                                    inset: 8,
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    gap: 6,
                                                }}
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setCover(row.id, i)}
                                                    title="Set cover"
                                                    style={{
                                                        padding: "4px 8px",
                                                        borderRadius: 999,
                                                        border: "none",
                                                        background: "rgba(0,0,0,0.6)",
                                                        color: "#fff",
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    {isCover ? "Cover ✓" : "Set cover"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removeColorFile(row.id, i)}
                                                    title="Remove"
                                                    style={{
                                                        padding: "4px 8px",
                                                        borderRadius: 999,
                                                        border: "none",
                                                        background: "rgba(0,0,0,0.6)",
                                                        color: "#fff",
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div
                                                className={styles.meta}
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    padding: "6px 8px",
                                                    fontSize: 12,
                                                }}
                                            >
                                                <span className={styles.name}>{product.title}</span>
                                                <span className={styles.size}>
                                                    {formatBytes(row.files[i]?.size || 0)}
                                                </span>
                                            </div>
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
                    value={intro}
                    onChange={(e) => setIntro(e.target.value)}
                    placeholder="Intro..."
                />

                <label>Details Title</label>
                <input
                    value={detailsTitle}
                    onChange={(e) => setDetailsTitle(e.target.value)}
                    placeholder="Product Details"
                />

                <label>Details (bullets)</label>
                <div className={styles.detailsList}>
                    {details.map((d, i) => (
                        <div key={i} className={styles.detailRow}>
                            <input
                                value={d}
                                onChange={(e) => updateDetailAt(i, e.target.value)}
                                placeholder={`Detail #${i + 1}`}
                            />
                            <button
                                type="button"
                                className={styles.iconBtn}
                                onClick={() => removeDetailAt(i)}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className={styles.addDetailBtn}
                        onClick={addDetail}
                    >
                        + Add Detail
                    </button>
                </div>

                <div className={styles.modalActions}>
                    <button type="submit" disabled={!canSubmit || loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className={styles.secondaryBtn}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
