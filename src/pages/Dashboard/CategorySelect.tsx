// components/CategorySelect.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCategories } from "../../utils/CategoryContext";

/** Single-select props */
type SingleProps = {
    multiple?: false;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    size?: number;
    required?: boolean;
    name?: string;
    error?: string;
};

/** Multi-select props */
type MultiProps = {
    multiple: true;
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    size?: number;
    required?: boolean;
    name?: string;
    error?: string;
};

type Props = SingleProps | MultiProps;

export default function CategorySelect(props: Props) {
    const { categories, fetchAll, loading } = useCategories();

    useEffect(() => {
        if (!categories.length) void fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (props.multiple) {
        return (
            <MultiSelect
                {...(props as MultiProps)}
                categories={categories}
                loading={loading}
            />
        );
    }

    return (
        <SingleSelect
            {...(props as SingleProps)}
            categories={categories}
            loading={loading}
        />
    );
}

/* ------------------------------------------------------------------ */
/* SingleSelect                                                        */
/* ------------------------------------------------------------------ */

function SingleSelect({
    value,
    onChange,
    placeholder,
    disabled,
    className,
    size,
    required,
    name,
    error,
    categories,
    loading,
}: SingleProps & { categories: { _id: string; name: string }[]; loading: boolean }) {
    const isDisabled = disabled || loading;
    const selectedValue = value ?? "";

    return (
        <div className={className} style={{ display: "grid", gap: 6 }}>
            <select
                value={selectedValue}
                onChange={(e) => onChange(e.target.value)}
                disabled={isDisabled}
                size={size}
                required={required}
                name={name}
                aria-describedby={error ? `${name || "category"}-error` : undefined}
                style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border,#4444)" }}
            >
                <option value="" disabled>
                    {loading ? "Loading…" : placeholder ?? "Select category"}
                </option>
                {categories.length === 0 && !loading ? (
                    <option value="" disabled>
                        No categories
                    </option>
                ) : (
                    categories.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.name}
                        </option>
                    ))
                )}
            </select>
            {error && (
                <small id={`${name || "category"}-error`} style={{ color: "var(--red,#e11d48)" }}>
                    {error}
                </small>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* MultiSelect — fixed: trigger is a DIV (combobox), so chip remove buttons
   are no longer nested inside a <button> (which caused hydration errors).  */
/* ------------------------------------------------------------------ */

function MultiSelect({
    value,
    onChange,
    disabled,
    className,
    required,
    name,
    error,
    categories,
    loading,
}: MultiProps & { categories: { _id: string; name: string }[]; loading: boolean }) {
    const isDisabled = disabled || loading;
    const selected = value ?? [];

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const triggerRef = useRef<HTMLDivElement | null>(null);
    const listRef = useRef<HTMLUListElement | null>(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return categories;
        return categories.filter((c) => c.name.toLowerCase().includes(q));
    }, [categories, query]);

    const toggleValue = (id: string) => {
        const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
        onChange(next);
    };

    const selectAll = () => onChange(filtered.map((c) => c._id));
    const clearAll = () => onChange([]);

    // outside click
    useEffect(() => {
        if (!open) return;
        const onDoc = (e: MouseEvent) => {
            const t = e.target as Node;
            if (triggerRef.current?.contains(t) || listRef.current?.parentElement?.contains(t)) return;
            setOpen(false);
        };
        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, [open]);

    // keyboard nav
    const [activeIndex, setActiveIndex] = useState(0);
    useEffect(() => {
        if (!open) return;
        setActiveIndex(0);
    }, [open, filtered.length]);

    const onTriggerKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
        if (!open) {
            if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOpen(true);
                setTimeout(() => listRef.current?.focus(), 0);
            }
            if (e.key === "Backspace" && selected.length) {
                // remove last selected chip
                onChange(selected.slice(0, -1));
            }
            return;
        }
        if (e.key === "Escape") {
            e.preventDefault();
            setOpen(false);
            triggerRef.current?.focus();
        }
    };

    const labelById = useMemo(() => {
        const m = new Map<string, string>();
        categories.forEach((c) => m.set(c._id, c.name));
        return m;
    }, [categories]);

    const selectedLabels = selected.map((id) => ({ id, label: labelById.get(id) || id }));
    const hiddenValue = JSON.stringify(selected);
    const invalid = !!required && selected.length === 0;
    const describedBy = error ? `${name || "categories"}-error` : undefined;

    return (
        <div className={className} style={{ display: "grid", gap: 6 }}>
            {/* Trigger — DIV with combobox semantics */}
            <div
                ref={triggerRef}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={`${name || "categories"}-listbox`}
                aria-describedby={describedBy}
                tabIndex={isDisabled ? -1 : 0}
                onClick={() => !isDisabled && setOpen((s) => !s)}
                onKeyDown={onTriggerKeyDown}
                data-invalid={invalid || undefined}
                style={{
                    minHeight: 40,
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: `1px solid ${invalid ? "var(--red,#e11d48)" : "var(--border,#4444)"}`,
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                    cursor: isDisabled ? "not-allowed" : "pointer",
                }}
            >
                {selected.length === 0 ? (
                    <span style={{ opacity: 0.6 }}>
                        {loading ? "Loading…" : "Select categories"}
                        {required ? " *" : ""}
                    </span>
                ) : (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {selectedLabels.slice(0, 3).map(({ id, label }) => (
                            <span
                                key={id}
                                style={{
                                    padding: "2px 8px",
                                    borderRadius: 999,
                                    border: "1px solid var(--chip,#5554)",
                                    fontSize: 12,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                }}
                            >
                                {label}
                                {/* This button is now legal (not nested inside a button) */}
                                <button
                                    type="button"
                                    aria-label={`Remove ${label}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleValue(id);
                                    }}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        cursor: "pointer",
                                        fontSize: 14,
                                        lineHeight: 1,
                                    }}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        {selected.length > 3 && (
                            <span style={{ opacity: 0.8, fontSize: 12 }}>+{selected.length - 3} more</span>
                        )}
                    </div>
                )}
                <span style={{ marginLeft: "auto", display: "inline-flex", gap: 8 }}>
                    {selected.length > 0 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                clearAll();
                            }}
                            aria-label="Clear selected"
                            title="Clear"
                            style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                opacity: 0.8,
                            }}
                        >
                            ✕
                        </button>
                    )}
                    <span aria-hidden>▾</span>
                </span>
            </div>

            {/* Panel */}
            {open && (
                <div role="dialog" aria-modal="false" style={{ position: "relative", zIndex: 20 }}>
                    <div
                        style={{
                            position: "absolute",
                            marginTop: 6,
                            insetInlineStart: 0,
                            minWidth: "100%",
                            maxHeight: 280,
                            overflow: "hidden",
                            borderRadius: 10,
                            border: "1px solid var(--border,#4444)",
                            background: "var(--panel, rgba(0,0,0,0.05))",
                            backdropFilter: "blur(6px)",
                            boxShadow: "0 6px 28px rgba(0,0,0,0.18)",
                        }}
                    >
                        <div style={{ padding: 8, display: "grid", gap: 8 }}>
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search categories…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") {
                                        e.preventDefault();
                                        setOpen(false);
                                        triggerRef.current?.focus();
                                    }
                                }}
                                aria-label="Search categories"
                                aria-invalid={invalid || undefined}
                                style={{
                                    width: "100%",
                                    padding: "8px 10px",
                                    borderRadius: 8,
                                    border: `1px solid ${invalid ? "var(--red,#e11d48)" : "var(--border,#4444)"}`,
                                    background: "transparent",
                                }}
                            />
                            <div style={{ display: "flex", gap: 8 }}>
                                <button
                                    type="button"
                                    onClick={selectAll}
                                    disabled={filtered.length === 0}
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: 8,
                                        border: "1px solid var(--border,#4444)",
                                        background: "transparent",
                                        cursor: filtered.length ? "pointer" : "not-allowed",
                                    }}
                                >
                                    Select all
                                </button>
                                <button
                                    type="button"
                                    onClick={clearAll}
                                    disabled={selected.length === 0}
                                    style={{
                                        padding: "6px 10px",
                                        borderRadius: 8,
                                        border: "1px solid var(--border,#4444)",
                                        background: "transparent",
                                        cursor: selected.length ? "pointer" : "not-allowed",
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <ul
                            ref={listRef}
                            id={`${name || "categories"}-listbox`}
                            role="listbox"
                            aria-multiselectable={true}
                            tabIndex={-1}
                            style={{ listStyle: "none", margin: 0, padding: 6, maxHeight: 200, overflow: "auto" }}
                        >
                            {loading ? (
                                <li style={{ padding: "8px 10px", opacity: 0.7 }}>Loading…</li>
                            ) : filtered.length === 0 ? (
                                <li style={{ padding: "8px 10px", opacity: 0.7 }}>No results</li>
                            ) : (
                                filtered.map((c) => {
                                    const checked = selected.includes(c._id);
                                    return (
                                        <li
                                            key={c._id}
                                            role="option"
                                            aria-selected={checked}
                                            onClick={() => toggleValue(c._id)}
                                            style={{
                                                padding: "8px 10px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 8,
                                                cursor: "pointer",
                                                borderRadius: 8,
                                            }}
                                        >
                                            <input type="checkbox" readOnly checked={checked} tabIndex={-1} aria-hidden />
                                            <span>{c.name}</span>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </div>
                </div>
            )}

            {(error || (required && selected.length === 0)) && (
                <small id={`${name || "categories"}-error`} style={{ color: "var(--red,#e11d48)" }}>
                    {error || "At least one category is required."}
                </small>
            )}

            {name && <input type="hidden" name={name} value={hiddenValue} />}
        </div>
    );
}
