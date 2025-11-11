import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import api from "./axios";

type User = {
    id: string;
    email: string;
    name?: string;
};

type AuthState = {
    user: User | null;
    token: string | null;
    loading: boolean;
};

type LoginArgs = { email: string; password: string; remember?: boolean };
type AuthContextShape = {
    user: User | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (args: LoginArgs) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextShape | null>(null);
const TOKEN_KEY = "auth:token";
const USER_KEY = "auth:user";

type Action =
    | { type: "START" }
    | { type: "LOGIN"; payload: { user: User; token: string } }
    | { type: "LOGOUT" };

function reducer(state: AuthState, action: Action): AuthState {
    switch (action.type) {
        case "START":
            return { ...state, loading: true };
        case "LOGIN":
            return { user: action.payload.user, token: action.payload.token, loading: false };
        case "LOGOUT":
            return { user: null, token: null, loading: false };
        default:
            return state;
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(reducer, { user: null, token: null, loading: false });

    // Rehydrate on mount (prefer localStorage, fallback sessionStorage)
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
        if (storedToken && storedUser) {
            try {
                const user: User = JSON.parse(storedUser);
                dispatch({ type: "LOGIN", payload: { user, token: storedToken } });
            } catch {
                // bad parse -> clear
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
                sessionStorage.removeItem(TOKEN_KEY);
                sessionStorage.removeItem(USER_KEY);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = async ({ email, password, remember }: LoginArgs) => {
        dispatch({ type: "START" });
        try {
            // ---- Option A: Bearer token API (most common) ----
            // Expected response shape (example):
            // { token: "jwt-or-session", user: { id: "u_1", email: "...", name: "..." } }
            const res = await api.post("/users/login", { email, password });

            // Extract with fallbacks for common field names
            const token: string =
                res.data?.refreshToken ||
                res.data?.accessToken ||
                res.headers?.authorization?.replace(/^Bearer\s+/i, "") ||
                "";

            if (!token) throw new Error("Missing token in response.");

            const user: User = {
                id: String(res.data?.user?.id ?? "u_unknown"),
                email: String(res.data?.user?.email ?? email),
                name: res.data?.user?.name ?? email.split("@")[0],
            };

            // Persist based on remember
            const storage = remember ? localStorage : sessionStorage;
            storage.setItem(TOKEN_KEY, token);
            storage.setItem(USER_KEY, JSON.stringify(user));

            // Clear the other storage to avoid conflicts
            (remember ? sessionStorage : localStorage).removeItem(TOKEN_KEY);
            (remember ? sessionStorage : localStorage).removeItem(USER_KEY);

            dispatch({ type: "LOGIN", payload: { user, token } });

            // ---- Option B: Cookie-based session (httpOnly) ----
            // If your backend sets a cookie and returns user only:
            // const res = await api.post("/auth/login", { email, password }, { withCredentials: true });
            // const user: User = res.data.user; // token stays null, rely on cookie
            // dispatch({ type: "LOGIN", payload: { user, token: "cookie-session" } });

        } catch (err: any) {
            // You can surface this in the SignIn page
            // Optionally: map status codes:
            // if (axios.isAxiosError(err) && err.response?.status === 401) ...
            dispatch({ type: "LOGOUT" });
            throw err; // let UI show err.message
        }
    };
    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
        dispatch({ type: "LOGOUT" });
    };

    const value = useMemo<AuthContextShape>(
        () => ({
            user: state.user,
            token: state.token,
            loading: state.loading,
            isAuthenticated: !!state.token,
            login,
            logout,
        }),
        [state.user, state.token, state.loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
