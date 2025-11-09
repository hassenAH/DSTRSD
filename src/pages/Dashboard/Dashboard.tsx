import { useState } from "react";
import styles from "./Dashboard.module.scss";
import DeleteModal from "./DeleteProductModal";

import AddProductModal from "./AddProductModal";
import DashboardSidebar from "./Sidebar/SidebarDashboard";

// IMPORTANT: use the context Product type, not the local one
import { useProducts, type Product, CreateProductMultipart } from "../../utils/ProductContext";
import CategoriesPage from "./CategoriesPage";


export default function DashboardPage() {
  const {
    products,
    loading,
    error,
    createProductMultipart,
    updateProduct,
    deleteProduct,
  } = useProducts();


  // UI state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);



  const handleAddProductClick = () => setShowAddModal(true);
  const handleCancelAdd = () => setShowAddModal(false);

  // CREATE
  const handleAddProduct = async (form: CreateProductMultipart) => {
    // You can add validation here before submit
    await createProductMultipart(form);
    setShowAddModal(false);
  };



  const handleUpdate = async (id: string, updated: any) => {
    // If there are files → use multipart endpoint
    if (updated.imagesFiles?.length || updated.removeImages?.length) {
      // ---- Option A: build FormData here and call your API directly ----
      const fd = new FormData();
      if (updated.title) fd.set("title", updated.title);
      if (typeof updated.price === "number") fd.set("price", String(updated.price));
      if (typeof updated.stock === "number") fd.set("stock", String(updated.stock));
      if (updated.sizes) fd.set("sizes", JSON.stringify(updated.sizes));
      if (updated.colors) fd.set("colors", JSON.stringify(updated.colors));
      if (updated.categoryId) fd.set("categoryId", updated.categoryId);
      if (updated.description) fd.set("description", JSON.stringify(updated.description));
      if (updated.removeImages) fd.set("removeImages", JSON.stringify(updated.removeImages));
      (updated.imagesFiles || []).forEach((f: File) => fd.append("images", f));

      // call your axios instance (example route)
      // await api.patch(`/products/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });

      // ---- Option B: expose updateProductMultipart in context and call it ----
      // await updateProductMultipart(id, updated);
    } else {
      // Plain JSON PATCH (no image changes)
      await updateProduct(id, updated);
    }
    setEditingProduct(null);
  };


  // DELETE
  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setDeletingProduct(null);
  };

  return (
    <div className={styles.dashboardLayout}>
      <DashboardSidebar />

      <div className={styles.dashboardContent}>
        <header className={styles.header}>
          <h1>Dashboard</h1>
          <CategoriesPage />

          <button className={styles.addBtn} onClick={handleAddProductClick}>
            + Add Product
          </button>
        </header>

        {loading && <p>Loading…</p>}
        {error && <p className={styles.error}>{error}</p>}

        <main className={styles.grid}>
          {products.map((p) => (
            <div key={p._id} className={styles.card}>
              <img src={p.colors[0]?.images[0]} alt={p.title} className={styles.image} />
              <h3>{p.title}</h3>
              <p>{(p.price).toFixed(2)} DT</p>
              {p.description?.intro && <p>{p.description.intro}</p>}
              {p.sizes?.length > 0 && <p>Sizes: {p.sizes.join(", ")}</p>}
              <p>Stock: {p.stock}</p>

              <div className={styles.actions}>
                <button onClick={() => setEditingProduct(p)}>edit</button>
                <button onClick={() => setDeletingProduct(p)}>delete</button>
              </div>
            </div>
          ))}
        </main>

        {/* Delete Modal */}
        {deletingProduct && (
          <DeleteModal
            productName={deletingProduct.title}
            onConfirm={() => handleDelete(deletingProduct._id)}
            onCancel={() => setDeletingProduct(null)}
          />
        )}

        {/* Edit Modal 
        {editingProduct && (
          <EditModal
            product={editingProduct}
            onSave={(updated) => handleUpdate(editingProduct._id, updated)}
            onCancel={() => setEditingProduct(null)}
          />

        )}*/}

        {/* Add Modal */}
        {showAddModal && (
          <AddProductModal
            onAdd={(form) => handleAddProduct(form as CreateProductMultipart)}
            onCancel={handleCancelAdd}
          />
        )}
      </div>
    </div>
  );
}
