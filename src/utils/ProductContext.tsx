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
  detailsTitle?: string;
  details?: string[];
};

export type ProductCategory = {
  _id: string;
  name: string;
  description?: string;
};
export type CreateProductMultipart = {
  title: string;
  price: number;      // in minor units or major depending on your API; see note below
  stock: number;
  categoryId: string; // backend expects categoryId for relation
  sizes: string[];
  colors: string[];
  description: {
    intro: string;
    detailsTitle?: string;
    details?: string[];
  };
  images: File[];     // <— files from the form
};
export type Product = {
  _id: string;
  title: string;
  description: ProductDescription;
  price: number;
  stock: number;
  category: ProductCategory;
  images: string[];
  sizes: string[];
  colors: string[];
  __v?: number;
};

// For creating/updating from forms
export type CreateProductInput = Omit<Product, "_id" | "__v">;
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
  | { type: "REMOVE_PRODUCT"; payload: string } // product _id
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

/* ----------------------------- Context Shape ----------------------------- */

type ProductContextShape = {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  error: string | null;

  // Reads
  fetchAllProducts: () => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;

  // Mutations

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

  // GET all products
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

  // GET product by ID
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

  // POST /products
  const createProductMultipart = async (data: CreateProductMultipart) => {
    dispatch({ type: "START" });
    try {
      const fd = new FormData();
      fd.set("title", data.title);
      fd.set("price", String(data.price));   // NOTE: if backend expects cents, pass cents here
      fd.set("stock", String(data.stock));
      fd.set("categoryId", data.categoryId);
      fd.set("sizes", JSON.stringify(data.sizes));
      fd.set("colors", JSON.stringify(data.colors));
      fd.set(
        "description",
        JSON.stringify({
          intro: data.description.intro,
          detailsTitle: data.description.detailsTitle,
          details: data.description.details ?? [],
        })
      );
      data.images.forEach((file) => fd.append("images", file));

      // If your route is POST /products/create:
      const res = await api.post<Product>("/products/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch({ type: "ADD_PRODUCT", payload: res.data });
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to create product";
      dispatch({ type: "ERROR", payload: msg });
      throw new Error(msg);
    }
  };

  // PATCH /products/:id (or PUT)
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

  // DELETE /products/:id
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
      currentProduct: state.products[0],
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
