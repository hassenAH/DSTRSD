// src/utils/SubscriberContext.tsx
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import api from "./axios";

export interface Subscriber {
    _id: string;
    email: string;
    createdAt: string;
    updatedAt?: string;
}

interface SubscriberContextValue {
    subscribers: Subscriber[];
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    subscribe: (email: string) => Promise<void>; // ✅ new
}

const SubscriberContext = createContext<SubscriberContextValue | undefined>(
    undefined
);

export function SubscriberProvider({ children }: { children: ReactNode }) {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscribers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get<Subscriber[]>("/subscribers"); // GET /api/subscribers
            setSubscribers(res.data);
        } catch (err: any) {
            console.error("Failed to load subscribers:", err);
            setError(
                err?.response?.data?.message ||
                err.message ||
                "Failed to load subscribers"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // ✅ subscribe action
    const subscribe = useCallback(
        async (email: string) => {
            try {
                await api.post("/subscribe", { email }); // POST /api/subscribe
                // refresh list after successful subscribe
                await fetchSubscribers();
            } catch (err) {
                // let the caller (Popup) handle the error
                throw err;
            }
        },
        [fetchSubscribers]
    );

    useEffect(() => {
        fetchSubscribers();
    }, [fetchSubscribers]);

    const value = useMemo(
        () => ({
            subscribers,
            loading,
            error,
            refresh: fetchSubscribers,
            subscribe, // ✅ expose it
        }),
        [subscribers, loading, error, fetchSubscribers, subscribe]
    );

    return (
        <SubscriberContext.Provider value={value}>
            {children}
        </SubscriberContext.Provider>
    );
}

export function useSubscribers(): SubscriberContextValue {
    const ctx = useContext(SubscriberContext);
    if (!ctx) {
        throw new Error(
            "useSubscribers must be used within a SubscriberProvider"
        );
    }
    return ctx;
}
