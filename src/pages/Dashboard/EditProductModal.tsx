// components/EditProductModal.tsx
import React, {
    useEffect,
    useMemo,
    useState,
    ChangeEvent,
    FormEvent,
} from "react";
import styles from "./EditProduct.module.scss";
import type { Product, UpdateProductInput } from "../../utils/ProductContext";
import CategorySelect from "./CategorySelect";

const AVAILABLE_SIZES = ["XS", "Small", "Medium", "Large", "X Large", "XXL"];

type EditModalProps = {
    product: Product;
    onSave: (
        updated: UpdateProductInput & {
            colorFiles?: Record<string, File[]>;
            removeImages?: Record<string, string[]>;
            categoryIds?: string[];
        }
    ) => void | Promise<void>;
    onCancel: () => void;
};

/** Local color row for editing */
type ColorRow = {
    id: string;
    name: string;
    hex?: string;
    files: File[];
    previews: string[];
};

export default function EditProductModal({
    product,
    onSave,
    onCancel,
}: EditModalProps) {
    // ---- Scalars ----
    const [title, setTitle] = useState(product.title);
    const [price, setPrice] = useState(String(product.price));
    const [categoryIds, setCategoryIds] = useState<string[]>(
        (product as any).categories?.map((c: any) => (typeof c === "string" ? c : c?._id || c)) || []
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
        product.description?.details?.length ? product.description.details : [""]
    );

    // ---- Colors (rows + existing images map) ----
    const [colorRows, setColorRows] = useState<ColorRow[]>(
        () =>
            (product.colors || []).map((cv: any) => ({
                id: crypto.randomUUID(),
                name: cv?.name || String(cv || ""),
                hex: "#000000",
                files: [],
                previews: [],
            }))
    );

    const [existingColorImages, setExistingColorImages] = useState<Record<string, string[]>>(
        () =>
            (product.colors || []).reduce((acc: Record<string, string[]>, cv: any) => {
                const name = cv?.name || String(cv || "");
                acc[name] = Array.isArray(cv?.images) ? cv.images : [];
                return acc;
            }, {})
    );

    const [removeImages, setRemoveImages] = useState<Record<string, string[]>>({});

    // ---- Cleanup object URLs ----
    useEffect(() => {
        return () => {
            colorRows.forEach((r) => r.previews.forEach((u) => URL.revokeObjectURL(u)));
        };
    }, [colorRows]);

    // ---- Sizes helpers ----
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

    // ---- Colors helpers ----
    const addColorRow = () =>
        setColorRows((prev) => [
            ...prev,
            { id: crypto.randomUUID(), name: "", hex: "#000000", files: [], previews: [] },
        ]);

    const removeColorRow = (id: string) => {
        setColorRows((prev) => {
            const row = prev.find((r) => r.id === id);
            row?.previews.forEach((u) => URL.revokeObjectURL(u));
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

    // When renaming a color, also move its existing-images bucket
    const updateColorName = (id: string, name: string) => {
        name = name.trim();
        setColorRows((prev) => prev.map((r) => (r.id === id ? { ...r, name } : r)));
        setExistingColorImages((prev) => {
            const oldName = colorRows.find((r) => r.id === id)?.name || "";
            if (!oldName || oldName === name) return prev;
            const copy = { ...prev };
            if (copy[oldName] && !copy[name]) {
                copy[name] = copy[oldName];
                delete copy[oldName];
            }
            // ensure removeImages mapping follows too
            setRemoveImages((rem) => {
                const rcopy = { ...rem };
                if (rcopy[oldName] && !rcopy[name]) {
                    rcopy[name] = rcopy[oldName];
                    delete rcopy[oldName];
                }
                return rcopy;
            });
            return copy;
        });
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
                const files = r.files.concat(added);
                const previews = r.previews.concat(added.map((f) => URL.createObjectURL(f)));
                return { ...r, files, previews };
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
                return { ...r, files, previews };
            })
        );
    };

    const removeExistingColorImage = (colorName: string, url: string) => {
        setExistingColorImages((prev) => {
            const next = { ...prev };
            next[colorName] = (next[colorName] || []).filter((x) => x !== url);
            return next;
        });
        setRemoveImages((prev) => {
            const next = { ...prev };
            next[colorName] = Array.from(new Set([...(next[colorName] || []), url]));
            return next;
        });
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
        if (!price || isNaN(Number(price))) return "Valid price is required.";
        if (!intro.trim()) return "Intro description is required.";
        if (!categoryIds.length) return "Select at least one category.";
        if (!colorsForBackend.length) return "Add at least one color.";
        return "";
    };

    // ---- Submit ----
    const submit = (e: FormEvent) => {
        e.preventDefault();
        const v = validate();
        if (v) return alert(v);

        const sizesPayload = Object.entries(sizesSelected).map(([name, stock]) => ({
            name,
            stock,
        }));

        // Build colorFiles from rows (keyed by color name)
        const colorFiles: Record<string, File[]> = {};
        colorRows.forEach((row) => {
            const name = row.name.trim();
            if (!name || row.files.length === 0) return;
            colorFiles[name] = row.files.slice(); // keep order
        });

        // Build colors with existing images (existing kept under the (possibly renamed) key)
        const colorsPayload = colorsForBackend.map((name) => ({
            name,
            images: existingColorImages[name] || [],
        }));

        const payload: UpdateProductInput & {
            colorFiles?: Record<string, File[]>;
            removeImages?: Record<string, string[]>;
            categoryIds?: string[];
        } = {
            title,
            price: Number(price),
            stock: sizesPayload.reduce((s, it) => s + (it.stock || 0), 0),
            sizes: sizesPayload,
            colors: colorsPayload,
            description: {
                intro,
                detailsTitle,
                details: details.filter(Boolean),
            },
            colorFiles,
            removeImages,
            categoryIds,
        };

        onSave(payload);
    };

    return (
        <div className={styles.modal} role="dialog" aria-modal="true">
            <form className={styles.modalContent} onSubmit={submit}>
                <h2>Edit “{product.title}”</h2>

                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Product title" />

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

                {/* ---------- Colors Editor (like Add) ---------- */}
                <div className={styles.hr} />
                <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
                    <h3 style={{ margin: 0 }}>Colors</h3>
                    <button type="button" className={styles.addDetailBtn} onClick={addColorRow}>
                        + Add Color
                    </button>
                </div>
                {!colorRows.length && (
                    <p className={styles.hint}>Add at least one color, then upload images per color.</p>
                )}

                <div style={{ display: "grid", gap: 16 }}>
                    {colorRows.map((row, idx) => {
                        const existing = existingColorImages[row.name] || [];
                        return (
                            <section key={row.id} className={styles.colorSection}>
                                <header className={styles.colorHeader}>
                                    <input
                                        type="text"
                                        value={row.name}
                                        onChange={(e) => updateColorName(row.id, e.target.value)}
                                        placeholder="Color name (e.g., Black)"
                                        aria-label="Color name"
                                    />
                                    <input
                                        type="color"
                                        value={row.hex || "#000000"}
                                        onChange={(e) => updateColorHex(row.id, e.target.value)}
                                        aria-label="Color swatch"
                                        title="Swatch (optional)"
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

                                {/* Existing images */}
                                {existing.length > 0 && (
                                    <div className={styles.gallerySmall}>
                                        {existing.map((url) => (
                                            <article key={url} className={styles.tileSmall}>
                                                <img className={styles.thumb} src={url} alt={`${row.name}-img`} />
                                                <div className={styles.actions}>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeExistingColorImage(row.name, url)}
                                                        title="Remove"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                                <div className={styles.meta}>
                                                    <span className={styles.name}>Existing</span>
                                                    <span className={styles.size}>—</span>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}

                                {/* Upload new ones */}
                                <label className={styles.dropzoneSmall}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => handleColorFilesSelect(row.id, e)}
                                    />
                                    <div className={styles.dzTextSmall}>Click to choose images</div>
                                </label>

                                <div className={styles.gallerySmall}>
                                    {row.previews.map((src, i) => (
                                        <article key={src} className={styles.tileSmall}>
                                            <img className={styles.thumb} src={src} alt={`${row.name}-preview-${i}`} />
                                            <div className={styles.actions}>
                                                <button
                                                    type="button"
                                                    onClick={() => removeColorFile(row.id, i)}
                                                    title="Remove"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                            <div className={styles.meta}>
                                                <span className={styles.name}>
                                                    {row.files[i]?.name || `image-${i + 1}`}
                                                </span>
                                                <span className={styles.size}>
                                                    {row.files[i] ? formatBytes(row.files[i].size) : "—"}
                                                </span>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        );
                    })}
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
                            <button type="button" className={styles.iconBtn} onClick={() => removeDetailAt(i)}>
                                ✕
                            </button>
                        </div>
                    ))}
                    <button type="button" className={styles.addDetailBtn} onClick={addDetail}>
                        + Add Detail
                    </button>
                </div>

                <div className={styles.modalActions}>
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={onCancel} className={styles.secondaryBtn}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
