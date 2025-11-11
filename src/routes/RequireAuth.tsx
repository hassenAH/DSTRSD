// src/routes/RequireAuth.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

export default function RequireAuth() {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) return null; // or a loader/spinner

    if (!isAuthenticated) {
        // send them to login, and remember where they came from
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
