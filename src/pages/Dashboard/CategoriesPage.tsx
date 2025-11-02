import { useMemo, useState } from "react";
import { useCategories, type Category } from "../../utils/CategoryContext";
import styles from "./CategoriesPage.module.scss";

export default function CategoriesPage() {
    const { categories, create, update, remove, loading, error } = useCategories();

    // UI state
    const [activeId, setActiveId] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [renameId, setRenameId] = useState<string | null>(null);

    // Add form
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    // Rename inline
    const [renameValue, setRenameValue] = useState("");

    const activeCategory: Category | null = useMemo(
        () => categories.find(c => c._id === activeId) || null,
        [categories, activeId]
    );

    const onSubmitAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        await create({ name: name.trim(), description: description.trim() || undefined });
        setName("");
        setDescription("");
        setShowAdd(false);
    };

    const startRename = (c: Category) => {
        setRenameId(c._id);
        setRenameValue(c.name);
    };

    const submitRename = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!renameId) return;
        await update(renameId, { name: renameValue.trim() });
        setRenameId(null);
    };

    const confirmDelete = async (id: string) => {
        if (window.confirm("Delete this category?")) {
            // If you want to block deletion when products exist, add back-end validation
            await remove(id);
            if (activeId === id) setActiveId(null);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Categories</h1>
                {error && <p className={styles.error}>{error}</p>}
            </header>

            <nav className={styles.categoryChips} aria-label="Categories">
                {categories.map((c) => (
                    <div key={c._id} className={styles.categoryItem}>
                        <button
                            className={`${styles.chip} ${activeId === c._id ? styles.chip__active : ""}`}
                            onClick={() => setActiveId(c._id)}
                            title={c.description || c.name}
                        >
                            {c.name}
                        </button>

                        <div className={styles.iconBtn}>
                            <button
                                type="button"
                                className={styles.icon}
                                aria-label="Rename"
                                onClick={() => startRename(c)}
                                title="Rename category"
                            >
                                ✏️
                            </button>
                            <button
                                type="button"
                                className={styles.icon}
                                aria-label="Delete"
                                onClick={() => confirmDelete(c._id)}
                                title="Delete category"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    className={`${styles.chip} ${styles.addCategoryBtn}`}
                    title="Add Category"
                    onClick={() => setShowAdd((v) => !v)}
                >
                    + Add Category
                </button>
            </nav>

            {showAdd && (
                <form className={styles.addForm} onSubmit={onSubmitAdd}>
                    <div className={styles.formRow}>
                        <input
                            className={styles.input}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Category name (e.g., Men)"
                        />
                        <input
                            className={styles.input}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description (optional)"
                        />
                    </div>
                    <div className={styles.actions}>
                        <button type="submit" disabled={loading || !name.trim()}>
                            {loading ? "Saving..." : "Create"}
                        </button>
                        <button type="button" className={styles.secondary} onClick={() => setShowAdd(false)}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {renameId && (
                <form className={styles.renameBar} onSubmit={submitRename}>
                    <span>Rename:</span>
                    <input
                        className={styles.input}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        placeholder="New name"
                        autoFocus
                    />
                    <button type="submit" disabled={loading || !renameValue.trim()}>
                        Save
                    </button>
                    <button type="button" className={styles.secondary} onClick={() => setRenameId(null)}>
                        Cancel
                    </button>
                </form>
            )}

            <main className={styles.body}>
                {loading && <div className={styles.skeleton} />}
                {!loading && !categories.length && <p className={styles.muted}>No categories yet.</p>}

                {activeCategory && (
                    <section className={styles.card}>
                        <h3 className={styles.cardTitle}>{activeCategory.name}</h3>
                        <p className={styles.cardDesc}>
                            {activeCategory.description || <span className={styles.muted}>No description.</span>}
                        </p>
                        {activeCategory.parentCategory && (
                            <p className={styles.cardMeta}>
                                Parent: <b>{activeCategory.parentCategory.name}</b>
                            </p>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}
