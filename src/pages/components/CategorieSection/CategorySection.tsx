import React, { useState } from "react";
import "./CategorySection.scss";
import accessories from "../../../assets/images/accessories.webp";
import women from "../../../assets/images/women.webp";
import clothes from "../../../assets/images/clothes.webp";

interface Category {
    title: string;
    image: string;
    link: string;
    clickable?: boolean;
}

const categories: Category[] = [
    {
        title: "Clothes",
        image: clothes,
        link: "/products",
        clickable: true,
    },
    {
        title: "Women",
        image: women,
        link: "/products",
        clickable: false,
    },
    {
        title: "Accessories",
        image: accessories,
        link: "/products",
        clickable: false,
    },
];

const CategorySection: React.FC = () => {
    const [tempTitles, setTempTitles] = useState<{ [key: number]: string }>({});

    const handleClick = (index: number, clickable?: boolean) => {
        if (clickable) return; // allow navigation normally

        // For non-clickable: show "Coming Soon"
        setTempTitles((prev) => ({ ...prev, [index]: "Coming Soon" }));

        // Reset after 2 seconds
        setTimeout(() => {
            setTempTitles((prev) => ({ ...prev, [index]: categories[index].title }));
        }, 2000);
    };

    return (
        <section className="category-section">
            <div className="category-grid">
                {categories.map((cat, index) => {
                    const currentTitle = tempTitles[index] || cat.title;

                    const CardContent = (
                        <div
                            className="category-image"
                            style={{ backgroundImage: `url(${cat.image})` }}
                        >
                            <div className="category-overlay"></div>
                            <h2 className="category-title">{currentTitle}</h2>
                        </div>
                    );

                    // Non-clickable cards → <div>, clickable → <a>
                    return cat.clickable ? (
                        <a
                            key={index}
                            href={cat.link}
                            className="category-card"
                            aria-label={`Shop ${cat.title}`}
                        >
                            {CardContent}
                        </a>
                    ) : (
                        <div
                            key={index}
                            className="category-card non-clickable"
                            role="button"
                            onClick={() => handleClick(index, cat.clickable)}
                            tabIndex={0}
                            aria-label={`${cat.title} — Coming soon`}
                        >
                            {CardContent}
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default CategorySection;
