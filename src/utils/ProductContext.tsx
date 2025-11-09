import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import api from "./axios";

/* ----------------------------- Types ----------------------------- */

export type ProductDescription = {
  intro: string;
  detailsTitle: string;
  details?: string[];
};

export type SizeVariant = {
  name: string;
  stock: number;
};

export type ColorVariant = {
  name: string;
  images: string[];
};

export type Product = {
  _id: string;
  title: string;
  description: ProductDescription;
  price: number;
  categories: string[];
  sizes: SizeVariant[];
  colors: ColorVariant[];
  __v?: number;
  stock?: number;
};

// utils/ProductContext.tsx (types section)
export type ColorCreate = {
  name: string;
  files?: File[];
};

export type CreateProductMultipart = {
  title: string;
  price: number;
  categories: string[];
  sizes: SizeVariant[];
  // ⬇️ merged: one array, each with name + files
  colors: ColorCreate[];
  description: {
    intro: string;
    detailsTitle: string;
    details?: string[];
  };
};

/** Update payload for multipart update (with images/removals) */
export type UpdateProductMultipart = {
  title?: string;
  price?: number;
  categories?: string[];
  sizes?: SizeVariant[];
  colors?: string[]; // names (new order & renames)
  description?: ProductDescription;
  /** Existing image URLs to delete, keyed by color name */
  removeImages?: Record<string, string[]>;
  /** Newly uploaded files keyed by color name */
  colorFiles?: Record<string, File[]>;
};

export type UpdateProductInput = Partial<Omit<Product, "_id" | "__v">>;

type ProductState = {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;
};

/* ----------------------------- Reducer ----------------------------- */

type Action =
  | { type: "START" }
  | { type: "SET_PRODUCTS"; payload: Product[] }
  | { type: "SET_PRODUCT"; payload: Product | null }
  | { type: "ADD_PRODUCT"; payload: Product }
  | { type: "UPDATE_PRODUCT"; payload: Product }
  | { type: "REMOVE_PRODUCT"; payload: string }
  | { type: "ERROR"; payload: string }
  | { type: "CLEAR_ERROR" };

function reducer(state: ProductState, action: Action): ProductState {
  switch (action.type) {
    case "START":
      return { ...state, loading: true, error: null };
    case "SET_PRODUCTS":
      return { ...state, products: action.payload, loading: false };
    case "SET_PRODUCT":
      return { ...state, currentProduct: action.payload, loading: false };
    case "ADD_PRODUCT":
      return { ...state, products: [action.payload, ...state.products], loading: false };
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) => (p._id === action.payload._id ? action.payload : p)),
        loading: false,
      };
    case "REMOVE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p._id !== action.payload),
        loading: false,
      };
    case "ERROR":
      return { ...state, loading: false, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

/* ----------------------------- Context ----------------------------- */

type ProductContextShape = {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;

  fetchAllProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;

  createProductMultipart: (data: CreateProductMultipart) => Promise<Product>;
  /** JSON-only updates (no file changes) */
  updateProduct: (id: string, data: UpdateProductInput) => Promise<Product>;
  /** Multipart updates: image uploads/removals + fields */
  updateProductMultipart: (id: string, data: UpdateProductMultipart) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;

  clearError: () => void;
};

const ProductContext = createContext<ProductContextShape | null>(null);

/* ----------------------------- Provider ----------------------------- */

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    products: [],
    currentProduct: null,
    loading: false,
    error: null,
  });

  /* -------- Simple: backend returns ALL products -------- */
  const fetchAllProducts = async () => {
    dispatch({ type: "START" });
    try {
      const res = await api.get<Product[]>("/products"); // simple list
      dispatch({ type: "SET_PRODUCTS", payload: res.data });
    } catch (err: any) {
      dispatch({
        type: "ERROR",
        payload: err.response?.data?.message || err.message || "Failed to load products",
      });
    }
  };

  const fetchProductById = async (id: string) => {
    dispatch({ type: "START" });
    try {
      const res = await api.get<Product>(`/products/${id}`);
      dispatch({ type: "SET_PRODUCT", payload: res.data });
    } catch (err: any) {
      dispatch({
        type: "ERROR",
        payload: err.response?.data?.message || err.message || "Failed to load product",
      });
    }
  };

  // utils/ProductContext.tsx
  const createProductMultipart = async (data: CreateProductMultipart) => {
    dispatch({ type: "START" });

    try {
      const fd = new FormData();

      // primitives
      fd.set("title", String(data.title ?? "").trim());
      fd.set("price", String(Number(data.price)));

      // arrays / objects (as JSON)
      fd.set("categories", JSON.stringify((data.categories || []).map(String)));

      const sizesPayload = (Array.isArray(data.sizes) ? data.sizes : [])
        .map((s) => ({
          name: String(s?.name ?? "").trim(),
          stock: Math.max(0, Number(s?.stock ?? 0)),
        }))
        .filter((s) => s.name);
      fd.set("sizes", JSON.stringify(sizesPayload));

      // ⬇️ NEW: derive names from merged color objects
      const colors = Array.isArray(data.colors) ? data.colors : [];
      const colorNames = colors
        .map((c) => String(c?.name || "").trim())
        .filter(Boolean);

      // backend expects names array (or objects), we'll keep names array
      fd.set("colors", JSON.stringify(colorNames));

      fd.set(
        "description",
        JSON.stringify({
          intro: String(data.description?.intro ?? "").trim(),
          detailsTitle: String(data.description?.detailsTitle ?? "").trim(),
          details: Array.isArray(data.description?.details)
            ? data.description.details.map((d) => String(d ?? "").trim()).filter(Boolean)
            : [],
        })
      );

      // ⬇️ Append files per color name: colorFiles[ColorName]
      for (const c of colors) {
        const name = String(c?.name || "").trim();
        if (!name || !Array.isArray(c?.files)) continue;
        for (const f of c.files!) {
          fd.append(`colorFiles[${name}]`, f);
        }
      }

      // IMPORTANT: post to /products (your controller is wired there)
      const res = await api.post<Product>("/products/create", fd);
      const created = res.data;
      dispatch({ type: "ADD_PRODUCT", payload: created });
      return created;
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Failed to create product";
      dispatch({ type: "ERROR", payload: msg });
      throw new Error(msg);
    }
  };

  /* ---------------------- UPDATE (JSON only) ---------------------- */
  const updateProduct = async (id: string, data: UpdateProductInput) => {
    dispatch({ type: "START" });
    try {
      const res = await api.put<Product>(`/products/${id}`, data);
      dispatch({ type: "UPDATE_PRODUCT", payload: res.data });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update product";
      dispatch({ type: "ERROR", payload: msg });
      throw new Error(msg);
    }
  };

  /* -------------------- UPDATE (multipart full) ------------------- */
  const updateProductMultipart = async (id: string, data: UpdateProductMultipart) => {
    dispatch({ type: "START" });
    try {
      const fd = new FormData();

      // Only set fields that are provided (backend treats missing as "no change")
      if (data.title != null) fd.set("title", String(data.title).trim());
      if (data.price != null) fd.set("price", String(Number(data.price)));

      if (data.categories) {
        fd.set("categories", JSON.stringify(data.categories.map(String)));
      }
      if (data.sizes) {
        const sizesPayload = data.sizes
          .map((s) => ({
            name: String(s?.name ?? "").trim(),
            stock: Math.max(0, Number(s?.stock ?? 0)),
          }))
          .filter((s) => s.name);
        fd.set("sizes", JSON.stringify(sizesPayload));
      }
      if (data.colors) {
        const colorNames = data.colors.map((c) => String(c || "").trim()).filter(Boolean);
        fd.set("colors", JSON.stringify(colorNames));
      }
      if (data.description) {
        fd.set(
          "description",
          JSON.stringify({
            intro: String(data.description.intro ?? "").trim(),
            detailsTitle: String(data.description.detailsTitle ?? "").trim(),
            details: Array.isArray(data.description.details)
              ? data.description.details.map((d) => String(d ?? "").trim()).filter(Boolean)
              : [],
          })
        );
      }
      if (data.removeImages) {
        fd.set("removeImages", JSON.stringify(data.removeImages));
      }
      if (data.colorFiles) {
        // If colors provided, we’ll use that order; otherwise append for whatever keys exist
        const keys =
          data.colors?.map((n) => String(n).trim()).filter(Boolean) ||
          Object.keys(data.colorFiles);
        for (const name of keys) {
          const files = data.colorFiles[name] || [];
          files.forEach((f) => fd.append(`colorFiles[${name}]`, f));
        }
      }

      const res = await api.put<Product>(`/products/${id}`, fd);
      dispatch({ type: "UPDATE_PRODUCT", payload: res.data });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update product";
      dispatch({ type: "ERROR", payload: msg });
      throw new Error(msg);
    }
  };

  const deleteProduct = async (id: string) => {
    dispatch({ type: "START" });
    try {
      await api.delete(`/products/${id}`);
      dispatch({ type: "REMOVE_PRODUCT", payload: id });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete product";
      dispatch({ type: "ERROR", payload: msg });
      throw new Error(msg);
    }
  };

  const clearError = () => dispatch({ type: "CLEAR_ERROR" });

  const value = useMemo<ProductContextShape>(
    () => ({
      products: state.products,
      currentProduct: state.currentProduct,
      loading: state.loading,
      error: state.error,

      fetchAllProducts,
      fetchProductById,

      createProductMultipart,
      updateProduct,            // keep for metadata-only updates
      updateProductMultipart,   // use when images/removals are involved
      deleteProduct,

      clearError,
    }),
    [state]
  );

  useEffect(() => {
    fetchAllProducts().catch(() => { });
  }, []);

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

/* ----------------------------- Hook ----------------------------- */

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductProvider");
  return ctx;
};
