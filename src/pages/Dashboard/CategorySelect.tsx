import { useEffect } from "react";
import { useCategories } from "../../utils/CategoryContext";

type Props = {
    value?: string;                 // selected category _id
    onChange: (id: string) => void;
    placeholder?: string;
    disabled?: boolean;
};

export default function CategorySelect({ value, onChange, placeholder = "Select a category", disabled }: Props) {
    const { categories, fetchAll, loading } = useCategories();

    useEffect(() => {
        if (!categories.length) fetchAll().catch(() => { });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <select value={value || ""} onChange={e => onChange(e.target.value)} disabled={disabled || loading}>
            <option value="" disabled>
                {placeholder}
            </option>
            {categories.map(c => (
                <option key={c._id} value={c._id}>
                    {c.name}
                </option>
            ))}
        </select>
    );
}
