import axios from "axios";

const api = axios.create({
    baseURL: "https://distressed.africa/api",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
        // Add any required headers here
    },
    // withCredentials: true, // Uncomment if using cookies for auth
});

// Request interceptor - for adding auth tokens, etc.
api.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if needed
        // const token = localStorage.getItem('authToken');
        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }
        
        console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
        return config;
    },
    (error) => {
        console.error("Request error:", error);
        return Promise.reject(error);
    }
);

// Response interceptor - improved error handling
api.interceptors.response.use(
    (response) => {
        console.log(`Response received:`, response.status, response.data);
        return response;
    },
    (error) => {
        console.error("API Error:", {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        let errorMessage = "Network error";
        
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;
            
            switch (status) {
                case 400:
                    errorMessage = data?.message || "Bad Request";
                    break;
                case 401:
                    errorMessage = data?.message || "Unauthorized";
                    // Optional: redirect to login
                    // window.location.href = '/login';
                    break;
                case 403:
                    errorMessage = data?.message || "Forbidden";
                    break;
                case 404:
                    errorMessage = data?.message || "Resource not found";
                    break;
                case 500:
                    errorMessage = data?.message || "Internal server error";
                    break;
                default:
                    errorMessage = data?.message || `Error: ${status}`;
            }
        } else if (error.request) {
            // Request was made but no response received
            errorMessage = "No response from server. Please check your connection.";
        } else {
            // Something else happened
            errorMessage = error.message || "Unknown error occurred";
        }

        return Promise.reject(new Error(errorMessage));
    }
);

export default api;