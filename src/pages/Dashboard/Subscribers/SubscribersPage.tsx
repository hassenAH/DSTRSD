// src/components/Dashboard/SubscribersPage.tsx

import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import styles from "./SubscribersPage.module.scss";

import { useSubscribers } from "../../../utils/SubscriberContext";
import DashboardSidebar from "../Sidebar/SidebarDashboard";

export default function SubscribersPage() {
    const { subscribers, loading, error, refresh } = useSubscribers();

    // 🔍 1) Search state
    const [search, setSearch] = useState("");

    const normalizedSearch = search.trim().toLowerCase();

    // derived list (filter by email or date string)
    const filteredSubscribers = useMemo(
        () =>
            !normalizedSearch
                ? subscribers
                : subscribers.filter((s) => {
                    const emailMatch = s.email?.toLowerCase().includes(normalizedSearch);
                    const dateStr = new Date(s.createdAt).toLocaleDateString();
                    return emailMatch || dateStr.includes(normalizedSearch);
                }),
        [subscribers, normalizedSearch]
    );

    // 📋 2) Copy all filtered emails to clipboard
    const handleCopyEmails = async () => {
        if (!filteredSubscribers.length) {
            toast.error("No subscribers to copy");
            return;
        }

        const emails = filteredSubscribers.map((s) => s.email).join(", ");

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(emails);
            } else {
                // fallback
                const textarea = document.createElement("textarea");
                textarea.value = emails;
                textarea.style.position = "fixed";
                textarea.style.left = "-9999px";
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }
            toast.success("Emails copied to clipboard");
        } catch (err) {
            console.error(err);
            toast.error("Failed to copy emails");
        }
    };

    // 📁 3) Export filtered subscribers as CSV
    const handleExportCSV = () => {
        if (!filteredSubscribers.length) {
            toast.error("No subscribers to export");
            return;
        }

        const header = ["index", "email", "createdAt", "id"];
        const rows = filteredSubscribers.map((s, idx) => [
            String(idx + 1),
            s.email,
            new Date(s.createdAt).toISOString(),
            s._id,
        ]);

        const csvContent =
            [header, ...rows]
                .map((row) =>
                    row
                        .map((value) => {
                            const safe = value.replace(/"/g, '""');
                            return `"${safe}"`;
                        })
                        .join(",")
                )
                .join("\n") + "\n";

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        const date = new Date().toISOString().slice(0, 10);
        link.href = url;
        link.setAttribute("download", `subscribers-${date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("CSV export started");
    };

    return (
        <div className={styles.dashboardLayout}>
            <DashboardSidebar />

            <div className={styles.dashboardContent}>
                <header className={styles.header}>
                    <div>
                        <h1>Subscribers</h1>
                        <p className={styles.subHeader}>
                            Total: {subscribers.length} • Showing: {filteredSubscribers.length}
                        </p>
                    </div>

                    <div className={styles.headerActions}>
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search by email or date..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={handleCopyEmails}
                            disabled={loading || !subscribers.length}
                        >
                            Copy emails
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryBtn}
                            onClick={handleExportCSV}
                            disabled={loading || !subscribers.length}
                        >
                            Export CSV
                        </button>
                        <button
                            type="button"
                            className={styles.refreshBtn}
                            onClick={refresh}
                            disabled={loading}
                        >
                            {loading ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </header>

                {loading && <p>Loading subscribers...</p>}
                {error && <p className={styles.error}>{error}</p>}

                {!loading && !error && (
                    <div className={styles.tableContainer}>
                        {filteredSubscribers.length === 0 ? (
                            <p className={styles.empty}>No subscribers found.</p>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Email</th>
                                        <th>Subscribed At</th>
                                        <th>ID (last 6)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubscribers.map((s, index) => (
                                        <tr key={s._id}>
                                            <td className={styles.mono}>{index + 1}</td>
                                            <td>{s.email}</td>
                                            <td>
                                                {new Date(s.createdAt).toLocaleString(undefined, {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "2-digit",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </td>
                                            <td className={styles.mono}>
                                                {s._id ? s._id.slice(-6) : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
