// components/CategorySelect.tsx
import React, { useEffect } from "react";
import { useCategories } from "../../utils/CategoryContext";

/** Single-select props */
type SingleProps = {
    multiple?: false;
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    size?: number;      // visible rows in dropdown (browser-dependent)
    required?: boolean; // for forms
};

/** Multi-select props */
type MultiProps = {
    multiple: true;
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string; // ignored in multiple mode
    disabled?: boolean;
    className?: string;
    size?: number;
    required?: boolean;
};

type Props = SingleProps | MultiProps;

export default function CategorySelect(props: Props) {
    const { categories, fetchAll, loading } = useCategories();

    useEffect(() => {
        if (!categories.length) void fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (props.multiple) {
            const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
            (props.onChange as (v: string[]) => void)(selected);
        } else {
            (props.onChange as (v: string) => void)(e.target.value);
        }
    };

    const selectedValue = props.multiple
        ? (props.value as string[] | undefined) ?? []
        : (props.value as string | undefined) ?? "";

    const isDisabled = props.disabled || loading;

    return (
        <select
            multiple={!!props.multiple}
            value={selectedValue}
            onChange={handleChange}
            disabled={isDisabled}
            className={props.className}
            size={props.size}
            required={props.required && !props.multiple} // HTML 'required' only applies to single-select
        >
            {/* Single-select placeholder */}
            {!props.multiple && (
                <option value="" disabled>
                    {loading ? "Loading…" : props.placeholder ?? "Select category"}
                </option>
            )}

            {/* Options */}
            {categories.length === 0 && !loading ? (
                // Optional: show an empty marker (disabled)
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
    );
}
