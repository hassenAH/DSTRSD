import { useState } from "react";
import styles from "./Dashboard.module.scss";
import DeleteModal from "./DeleteProductModal";
import EditModal from "./EditProductModal";
import AddProductModal from "./AddProductModal";
import DashboardSidebar from "./Sidebar/SidebarDashboard";
export type Product = {
  id: number;
  name: string;
  price: string;
  image: string;
  description?: string;
  sizes?: string[];
  quantity?: number;
};

type CategoryType = "Clothes" | "Accessories" | "Women";

export default function DashboardPage() {
  const productData: Record<CategoryType, Array<Product>> = {
    Clothes: [
      { id: 1, name: "BASIC TEE", price: "69DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", description: "The Counterfeit Tee ...", sizes: ["S", "M", "L"], quantity: 10 },
      { id: 2, name: "SLIM FIT SHIRT", price: "89DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", description: "The Counterfeit Tee ...", sizes: ["S", "M", "L"], quantity: 10 },
      { id: 3, name: "COTTON HOODIE", price: "79DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", description: "The Counterfeit Tee ...", sizes: ["S", "M", "L"], quantity: 10 },
      { id: 4, name: "CASUAL PANTS", price: "99DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", description: "The Counterfeit Tee ...", sizes: ["S", "M", "L"], quantity: 10 },
      { id: 5, name: "DENIM JACKET", price: "129DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", description: "Stylish denim jacket", sizes: ["S", "M", "L"], quantity: 5 },
    ],
    Accessories: [
      { id: 11, name: "LEATHER BELT", price: "49 DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", description: "Soft cotton tee", sizes: ["S", "M", "L"], quantity: 10 },
      { id: 12, name: "CANVAS BAG", price: "79 DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", description: "Soft cotton tee", sizes: ["S", "M", "L"], quantity: 10 },
      { id: 13, name: "CLASSIC WATCH", price: "199 DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", description: "Soft cotton tee", sizes: ["S", "M", "L"], quantity: 10 },
    ],
    Women: [
      { id: 21, name: "SILK BLOUSE", price: "119 DT", image: "https://api.builder.io/api/v1/image/assets/TEMP/245e0cc00bf0dc89fe40b6c9f6d4b3cdc6311ea3?width=652", description: "Elegant silk blouse", sizes: ["S", "M"], quantity: 7 },
    ],
  };

  const [activeCategory, setActiveCategory] = useState<CategoryType>("Clothes");
  const [products, setProducts] = useState<Product[]>(productData[activeCategory]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCategoryChange = (category: CategoryType) => {
    setActiveCategory(category);
    setProducts(productData[category]);
    setEditingProduct(null);
  };

  const handleAddProductClick = () => {
    setShowAddModal(true);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [...prev, newProduct]);
    setShowAddModal(false);
  };

  const handleCancelAdd = () => {
    setShowAddModal(false);
  };
  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeletingProduct(null);
  };

  const handleUpdate = (id: number, updated: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    setEditingProduct(null);
  };



  return (
    <div className={styles.dashboardLayout}>
      <DashboardSidebar
      />

      <div className={styles.dashboardContent}>
        <header className={styles.header}>
          <h1>Dashboard</h1>
          <nav className={styles.categoryChips} aria-label="Categories">
            {(["Clothes", "Accessories", "Women"] as CategoryType[]).map((c) => (
              <div key={c} className={styles.categoryItem}>
                {/* Bouton de la catégorie */}
                <button
                  className={`${styles.chip} ${c === activeCategory ? styles.chip__active : ""}`}
                  onClick={() => handleCategoryChange(c)}
                >
                  {c}
                </button>

                {/* Bouton icônes aligné et même largeur */}
                <button className={styles.iconBtn}>
                  <span onClick={() => console.log("Edit category", c)}>✏️</span>
                  <span onClick={() => console.log("Delete category", c)}>🗑️</span>
                </button>
              </div>
            ))}

            {/* Ajouter nouvelle catégorie */}
            <button
              className={`${styles.chip} ${styles.addCategoryBtn}`}
              title="Add Category"
            >
              add Categorie
            </button>
          </nav>

          <button className={styles.addBtn} onClick={handleAddProductClick}>
            + Add Product
          </button>
        </header>



        <main className={styles.grid}>
          {products.map((p) => (
            <div key={p.id} className={styles.card}>
              <img src={p.image} alt={p.name} className={styles.image} />
              <h3>{p.name}</h3>
              <p>{p.price}</p>
              {p.description && <p>{p.description}</p>}
              {p.sizes && <p>Sizes: {p.sizes.join(", ")}</p>}
              {p.quantity !== undefined && <p>Quantity: {p.quantity}</p>}

              <div className={styles.actions}>
                <button onClick={() => setEditingProduct(p)}>✏️</button>
                <button onClick={() => setDeletingProduct(p)}>🗑️</button>
              </div>
            </div>
          ))}
        </main>

        {deletingProduct && (
          <DeleteModal
            productName={deletingProduct.name}
            onConfirm={() => handleDelete(deletingProduct.id)}
            onCancel={() => setDeletingProduct(null)}
          />
        )}

        {editingProduct && (
          <EditModal
            product={editingProduct}
            onSave={(updated) => handleUpdate(updated.id, updated)}
            onCancel={() => setEditingProduct(null)}
          />
        )}
        {/* Modal d'ajout */}
        {showAddModal && (
          <AddProductModal onAdd={handleAddProduct} onCancel={handleCancelAdd} />
        )}
      </div>
    </div>
  );
}
