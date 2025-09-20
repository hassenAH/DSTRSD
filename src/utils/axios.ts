import axios from "axios";

const api = axios.create({
    baseURL: "/api", // e.g. https://api.yourapp.tn
    timeout: 15000,
    // If your backend sets httpOnly cookies for auth, enable:
    // withCredentials: true,
});

// Optional: response error normalization
api.interceptors.response.use(
    r => r,
    err => {
        const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Network error";
        return Promise.reject(new Error(msg));
    }
);

export default api;
