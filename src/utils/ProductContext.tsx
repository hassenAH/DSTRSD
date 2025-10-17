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
  | { type: "SET_PRODUCT"; payload: Product }
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
        payload: err.message || "Failed to load products",
      });
    }
  };

  // GET product by ID
  const fetchProductById = async () => {
    dispatch({ type: "START" });
    try {
      const res = await api.get<Product>(`/products/68efddf998fc4a7c4e0e0743`);
      dispatch({ type: "SET_PRODUCT", payload: res.data });
    } catch (err: any) {
      dispatch({
        type: "ERROR",
        payload: err.message || "Failed to load product",
      });
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
      clearError,
    }),
    [state]
  );

  // Optional: load all products on mount
  useEffect(() => {
    fetchAllProducts().catch(() => {});
  }, []);

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
}

/* ----------------------------- Hook ----------------------------- */

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used inside ProductProvider");
  return ctx;
};
