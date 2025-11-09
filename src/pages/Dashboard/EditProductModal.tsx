// components/EditProductModal.tsx
import React, {
    useEffect,
    useMemo,
    useState,
    ChangeEvent,
    FormEvent,
    Fragment,
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

export default function EditProductModal({
    product,
    onSave,
    onCancel,
}: EditModalProps) {
    // ---- Scalars ----
    const [title, setTitle] = useState(product.title);
    const [price, setPrice] = useState(String(product.price));
    const [categoryIds, setCategoryIds] = useState<string[]>(
        product.categories?.map((c) => c) || []
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

    // ---- Colors ----
    const [colorsInput, setColorsInput] = useState(
        (product.colors || []).map((c: any) => c.name || c).join(", ")
    );
    const colors = useMemo(
        () => colorsInput.split(",").map((s) => s.trim()).filter(Boolean),
        [colorsInput]
    );

    // ---- Description ----
    const [intro, setIntro] = useState(product.description?.intro || "");
    const [detailsTitle, setDetailsTitle] = useState(
        product.description?.detailsTitle || "Product Details"
    );
    const [details, setDetails] = useState(
        product.description?.details?.length ? product.description.details : [""]
    );

    // ---- Color images ----
    const [colorFiles, setColorFiles] = useState<Record<string, File[]>>({});
    const [colorPreviews, setColorPreviews] = useState<Record<string, string[]>>(
        {}
    );
    const [existingColorImages, setExistingColorImages] = useState<
        Record<string, string[]>
    >(
        () =>
            (product.colors || []).reduce((acc, colorVariant: any) => {
                acc[colorVariant.name || colorVariant] = colorVariant.images || [];
                return acc;
            }, {} as Record<string, string[]>)
    );

    const [removeImages, setRemoveImages] = useState<Record<string, string[]>>({});

    // ---- Clean up previews ----
    useEffect(() => {
        return () => {
            Object.values(colorPreviews)
                .flat()
                .forEach((url) => URL.revokeObjectURL(url));
        };
    }, [colorPreviews]);

    // ---- Maintain color keys ----
    useEffect(() => {
        setColorFiles((prev) => {
            const next = { ...prev };
            colors.forEach((c) => {
                if (!next[c]) next[c] = [];
            });
            Object.keys(next).forEach((k) => {
                if (!colors.includes(k)) delete next[k];
            });
            return next;
        });
        setColorPreviews((prev) => {
            const next = { ...prev };
            colors.forEach((c) => {
                if (!next[c]) next[c] = [];
            });
            Object.keys(next).forEach((k) => {
                if (!colors.includes(k)) delete next[k];
            });
            return next;
        });
    }, [colorsInput]);

    // ---- Helpers ----
    const formatBytes = (n: number) => {
        if (!n) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
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
        setSizesSelected((prev) => ({ ...prev, [size]: Math.max(0, stock || 0) }));

    // ---- Color images handlers ----
    const handleColorFilesSelect = (
        color: string,
        e: ChangeEvent<HTMLInputElement>
    ) => {
        if (!e.target.files) return;
        const added = Array.from(e.target.files);
        setColorFiles((prev) => {
            const next = { ...prev };
            next[color] = (next[color] || []).concat(added);
            return next;
        });
        setColorPreviews((prev) => {
            const next = { ...prev };
            next[color] = (next[color] || []).concat(
                added.map((f) => URL.createObjectURL(f))
            );
            return next;
        });
        e.currentTarget.value = "";
    };

    const removeColorFile = (color: string, index: number) => {
        setColorFiles((prev) => {
            const next = { ...prev };
            const arr = next[color] ? next[color].slice() : [];
            if (arr[index]) arr.splice(index, 1);
            next[color] = arr;
            return next;
        });
        setColorPreviews((prev) => {
            const next = { ...prev };
            const arr = next[color] ? next[color].slice() : [];
            const [removed] = arr.splice(index, 1);
            if (removed) URL.revokeObjectURL(removed);
            next[color] = arr;
            return next;
        });
    };

    const removeExistingColorImage = (color: string, url: string) => {
        setExistingColorImages((prev) => {
            const next = { ...prev };
            next[color] = (next[color] || []).filter((x) => x !== url);
            return next;
        });
        setRemoveImages((prev) => {
            const next = { ...prev };
            next[color] = Array.from(new Set([...(next[color] || []), url]));
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

    // ---- Validation ----
    const validate = () => {
        if (!title.trim()) return "Title is required.";
        if (!price || isNaN(Number(price))) return "Valid price is required.";
        if (!intro.trim()) return "Intro description is required.";
        if (!categoryIds.length) return "Select at least one category.";
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

        const payload: UpdateProductInput & {
            colorFiles?: Record<string, File[]>;
            removeImages?: Record<string, string[]>;
            categoryIds?: string[];
        } = {
            title,
            price: Number(price),
            stock: sizesPayload.reduce((s, it) => s + (it.stock || 0), 0),
            sizes: sizesPayload,
            colors: colors.map((c) => ({
                name: c,
                images: existingColorImages[c] || [],
            })),
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
                <input value={title} onChange={(e) => setTitle(e.target.value)} />

                <div className={styles.grid2}>
                    <div>
                        <label>Price (TND)</label>
                        <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
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
                    value={colorsInput}
                    onChange={(e) => setColorsInput(e.target.value)}
                    placeholder="Black, White"
                />

                <div className={styles.hr} />
                <h3>Description</h3>

                <label>Intro</label>
                <textarea
                    className={styles.textarea}
                    value={intro}
                    onChange={(e) => setIntro(e.target.value)}
                />

                <label>Details Title</label>
                <input
                    value={detailsTitle}
                    onChange={(e) => setDetailsTitle(e.target.value)}
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

                <div className={styles.hr} />
                <h3>Images (per color)</h3>

                {colors.map((c) => (
                    <Fragment key={c}>
                        <div className={styles.colorSection}>
                            <div className={styles.colorHeader}>
                                <strong>{c}</strong>
                                <small className={styles.hint}>
                                    Upload images for {c} (multiple allowed)
                                </small>
                            </div>

                            {/* Existing color images */}
                            <div className={styles.gallerySmall}>
                                {(existingColorImages[c] || []).map((url) => (
                                    <div key={url} className={styles.tileSmall}>
                                        <img className={styles.thumb} src={url} alt={`${c}-img`} />
                                        <div className={styles.actions}>
                                            <button
                                                type="button"
                                                onClick={() => removeExistingColorImage(c, url)}
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
                            </div>

                            {/* Upload new ones */}
                            <label className={styles.dropzoneSmall}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={(e) => handleColorFilesSelect(c, e)}
                                />
                                <div className={styles.dzTextSmall}>
                                    Click to choose images for {c}
                                </div>
                            </label>

                            <div className={styles.gallerySmall}>
                                {(colorPreviews[c] || []).map((src, i) => (
                                    <div key={src} className={styles.tileSmall}>
                                        <img
                                            className={styles.thumb}
                                            src={src}
                                            alt={`${c}-preview-${i}`}
                                        />
                                        <div className={styles.actions}>
                                            <button
                                                type="button"
                                                onClick={() => removeColorFile(c, i)}
                                                title="Remove"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        <div className={styles.meta}>
                                            <span className={styles.name}>
                                                {(colorFiles[c] && colorFiles[c][i]?.name) ||
                                                    `image-${i + 1}`}
                                            </span>
                                            <span className={styles.size}>
                                                {(colorFiles[c] && colorFiles[c][i])
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
                    <button type="submit">Save Changes</button>
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
