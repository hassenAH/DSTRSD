// src/routes/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

export default function RequireAuth() {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) return null; // or a spinner

    if (!isAuthenticated) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }
    return <Outlet />;
}
