import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import api from "./axios";

export type Category = {
    _id: string;
    name: string;
    description?: string;
    parentCategory?: { _id: string; name: string } | null;
};

type CreateCategoryInput = {
    name: string;
    description?: string;
    parentCategory?: string | null; // parent _id
};

type UpdateCategoryInput = Partial<CreateCategoryInput>;

type State = {
    categories: Category[];
    current: Category | null;
    loading: boolean;
    error: string | null;
};

type Action =
    | { type: "START" }
    | { type: "SET_ALL"; payload: Category[] }
    | { type: "SET_ONE"; payload: Category | null }
    | { type: "ADD"; payload: Category }
    | { type: "UPDATE"; payload: Category }
    | { type: "REMOVE"; payload: string }
    | { type: "ERROR"; payload: string }
    | { type: "CLEAR_ERROR" };

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "START":
            return { ...state, loading: true, error: null };
        case "SET_ALL":
            return { ...state, categories: action.payload, loading: false };
        case "SET_ONE":
            return { ...state, current: action.payload, loading: false };
        case "ADD":
            return { ...state, categories: [action.payload, ...state.categories], loading: false };
        case "UPDATE":
            return {
                ...state,
                categories: state.categories.map(c => (c._id === action.payload._id ? action.payload : c)),
                loading: false,
            };
        case "REMOVE":
            return { ...state, categories: state.categories.filter(c => c._id !== action.payload), loading: false };
        case "ERROR":
            return { ...state, loading: false, error: action.payload };
        case "CLEAR_ERROR":
            return { ...state, error: null };
        default:
            return state;
    }
}

type CtxShape = {
    categories: Category[];
    current: Category | null;
    loading: boolean;
    error: string | null;

    fetchAll: () => Promise<void>;
    fetchById: (id: string) => Promise<void>;
    create: (data: CreateCategoryInput) => Promise<Category>;
    update: (id: string, data: UpdateCategoryInput) => Promise<Category>;
    remove: (id: string) => Promise<void>;
    clearError: () => void;
};

const CategoryCtx = createContext<CtxShape | null>(null);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, {
        categories: [],
        current: null,
        loading: false,
        error: null,
    });

    const fetchAll = async () => {
        dispatch({ type: "START" });
        try {
            const res = await api.get<Category[]>("/categories");
            dispatch({ type: "SET_ALL", payload: res.data });
        } catch (err: any) {
            dispatch({ type: "ERROR", payload: err.response?.data?.error || err.message || "Failed to load categories" });
        }
    };

    const fetchById = async (id: string) => {
        dispatch({ type: "START" });
        try {
            const res = await api.get<Category>(`/categories/${id}`);
            dispatch({ type: "SET_ONE", payload: res.data });
        } catch (err: any) {
            dispatch({ type: "ERROR", payload: err.response?.data?.error || err.message || "Failed to load category" });
        }
    };

    const create = async (data: CreateCategoryInput) => {
        dispatch({ type: "START" });
        try {
            const res = await api.post<{ message: string; category: Category }>("/categories/create", data);
            dispatch({ type: "ADD", payload: res.data.category });
            return res.data.category;
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message || "Failed to create category";
            dispatch({ type: "ERROR", payload: msg });
            throw new Error(msg);
        }
    };

    const update = async (id: string, data: UpdateCategoryInput) => {
        dispatch({ type: "START" });
        try {
            const res = await api.patch<Category>(`/categories/${id}`, data);
            dispatch({ type: "UPDATE", payload: res.data });
            return res.data;
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message || "Failed to update category";
            dispatch({ type: "ERROR", payload: msg });
            throw new Error(msg);
        }
    };

    const remove = async (id: string) => {
        dispatch({ type: "START" });
        try {
            await api.delete(`/categories/${id}`);
            dispatch({ type: "REMOVE", payload: id });
        } catch (err: any) {
            const msg = err.response?.data?.error || err.message || "Failed to delete category";
            dispatch({ type: "ERROR", payload: msg });
            throw new Error(msg);
        }
    };

    const clearError = () => dispatch({ type: "CLEAR_ERROR" });

    const value = useMemo<CtxShape>(
        () => ({
            categories: state.categories,
            current: state.current,
            loading: state.loading,
            error: state.error,
            fetchAll,
            fetchById,
            create,
            update,
            remove,
            clearError,
        }),
        [state]
    );

    useEffect(() => {
        fetchAll().catch(() => { });
    }, []);

    return <CategoryCtx.Provider value={value}>{children}</CategoryCtx.Provider>;
}

export const useCategories = () => {
    const ctx = useContext(CategoryCtx);
    if (!ctx) throw new Error("useCategories must be used inside CategoryProvider");
    return ctx;
};
