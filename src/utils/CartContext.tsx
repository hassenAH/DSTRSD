// src/contexts/CartContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

export type CartItem = {
    id: string | number;
    name: string;
    image: string;
    price: number;   // numeric (e.g. 69 not "69$")
    size?: string;   // e.g. "SMALL" | "MEDIUM" | "LARGE"
    qty: number;     // integer >= 1
};

type CartState = {
    items: CartItem[];
    isOpen: boolean;
};

type AddPayload = CartItem & { merge?: boolean }; // merge=true to sum qty for same id+size
type UpdateQtyPayload = { id: CartItem["id"]; size?: string; qty: number };
type RemovePayload = { id: CartItem["id"]; size?: string };

type CartAction =
    | { type: "ADD"; payload: AddPayload }
    | { type: "UPDATE_QTY"; payload: UpdateQtyPayload }
    | { type: "REMOVE"; payload: RemovePayload }
    | { type: "CLEAR" }
    | { type: "OPEN" }
    | { type: "CLOSE" }
    | { type: "TOGGLE" }
    | { type: "HYDRATE"; payload: CartState };

const initialState: CartState = { items: [], isOpen: false };

const KEY = "cart:v1";

function sameLine(a: CartItem, b: { id: CartItem["id"]; size?: string }) {
    return a.id === b.id && (a.size ?? null) === (b.size ?? null);
}

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case "ADD": {
            const { merge = true, ...item } = action.payload;
            if (!merge) return { ...state, items: [...state.items, item] };

            const idx = state.items.findIndex((it) => sameLine(it, item));
            if (idx >= 0) {
                const copy = state.items.slice();
                copy[idx] = { ...copy[idx], qty: copy[idx].qty + item.qty };
                return { ...state, items: copy, isOpen: true };
            }
            return { ...state, items: [...state.items, item], isOpen: true };
        }
        case "UPDATE_QTY": {
            const { id, size, qty } = action.payload;
            const newQty = Math.max(1, Math.floor(qty || 1));
            return {
                ...state,
                items: state.items.map((it) =>
                    sameLine(it, { id, size }) ? { ...it, qty: newQty } : it
                ),
            };
        }
        case "REMOVE": {
            const { id, size } = action.payload;
            return {
                ...state,
                items: state.items.filter((it) => !sameLine(it, { id, size })),
            };
        }
        case "CLEAR":
            return { ...state, items: [] };
        case "OPEN":
            return { ...state, isOpen: true };
        case "CLOSE":
            return { ...state, isOpen: false };
        case "TOGGLE":
            return { ...state, isOpen: !state.isOpen };
        case "HYDRATE":
            return action.payload;
        default:
            return state;
    }
}

type CartContextValue = {
    items: CartItem[];
    isOpen: boolean;
    count: number;      // total qty
    subtotal: number;   // sum of line totals
    addToCart: (item: AddPayload) => void;
    updateQty: (payload: UpdateQtyPayload) => void;
    removeFromCart: (payload: RemovePayload) => void;
    clearCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // hydrate from localStorage once
    useEffect(() => {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as CartState;
                if (parsed && Array.isArray(parsed.items)) {
                    dispatch({ type: "HYDRATE", payload: { items: parsed.items, isOpen: false } });
                }
            }
        } catch { }
    }, []);

    // persist items (not isOpen) to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(KEY, JSON.stringify({ items: state.items, isOpen: false }));
        } catch { }
    }, [state.items]);

    const count = useMemo(() => state.items.reduce((n, it) => n + it.qty, 0), [state.items]);
    const subtotal = useMemo(
        () => Math.round(state.items.reduce((s, it) => s + it.price * it.qty, 0) * 100) / 100,
        [state.items]
    );

    const value: CartContextValue = {
        items: state.items,
        isOpen: state.isOpen,
        count,
        subtotal,
        addToCart: (item) => dispatch({ type: "ADD", payload: item }),
        updateQty: (payload) => dispatch({ type: "UPDATE_QTY", payload }),
        removeFromCart: (payload) => dispatch({ type: "REMOVE", payload }),
        clearCart: () => dispatch({ type: "CLEAR" }),
        openCart: () => dispatch({ type: "OPEN" }),
        closeCart: () => dispatch({ type: "CLOSE" }),
        toggleCart: () => dispatch({ type: "TOGGLE" }),
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
