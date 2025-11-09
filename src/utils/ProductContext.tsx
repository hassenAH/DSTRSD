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
  // Backend returns categories as ObjectId strings (not populated)
  categories: string[];
  sizes: SizeVariant[];
  colors: ColorVariant[];
  __v?: number;
  // optional, front-end convenience
  stock?: number;
};

/** Form payload (before we convert to FormData) */
export type CreateProductMultipart = {
  title: string;
  price: number;
  categories: string[];               // <- aligned with backend
  sizes: SizeVariant[];               // [{name, stock}]
  colors: string[];                   // names only; we convert to [{name}]
  description: {
    intro: string;
    detailsTitle: string;
    details?: string[];
  };
  colorFiles?: { [colorName: string]: File[] }; // images per color name
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
  updateProduct: (id: string, data: UpdateProductInput) => Promise<Product>;
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

  const fetchAllProducts = async () => {
    dispatch({ type: "START" });
    try {
      const res = await api.get<Product[]>("/products");
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

  /** POST /products — FormData aligned to backend (colors indexed + colorImages<i>) */
  const createProductMultipart = async (data: CreateProductMultipart) => {
    dispatch({ type: "START" });

    try {
      const fd = new FormData();

      // primitives
      fd.set("title", String(data.title ?? "").trim());
      fd.set("price", String(Number(data.price)));

      // categories: backend expects "categories" as a JSON array (or CSV)
      fd.set("categories", JSON.stringify((data.categories || []).map(String)));

      // sizes: [{ name, stock }]
      const sizesPayload = (Array.isArray(data.sizes) ? data.sizes : [])
        .map(s => ({
          name: String(s?.name ?? "").trim(),
          stock: Math.max(0, Number(s?.stock ?? 0)),
        }))
        .filter(s => s.name);
      fd.set("sizes", JSON.stringify(sizesPayload));

      // colors: must be array of objects [{ name }]
      const colorNames = (Array.isArray(data.colors) ? data.colors : [])
        .map((c) => String(c || "").trim())
        .filter(Boolean);
      const colorsPayload = colorNames.map((name) => ({ name }));
      fd.set("colors", JSON.stringify(colorsPayload));

      // description
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

      // files: colorImages0, colorImages1, ... (order matches colors array above)
      if (data.colorFiles) {
        colorNames.forEach((name, index) => {
          const files = data.colorFiles?.[name] || [];
          if (Array.isArray(files) && files.length) {
            const field = `colorImages${index}`;
            files.forEach((f) => fd.append(field, f));
          }
        });
      }

      // NOTE: If your route is '/products/create', change this URL.
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
      updateProduct,
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
