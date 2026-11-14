
import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

export default function usePaymentFilters(filters = {}) {
    const currentSearch = filters.search ?? "";
    const currentStatus = filters.status ?? "all";

    const [search, setSearch] = useState(currentSearch);
    const [status, setStatus] = useState(currentStatus);

    useEffect(() => {
        setSearch(currentSearch);
        setStatus(currentStatus);
    }, [currentSearch, currentStatus]);

    const applyFilters = (nextSearch, nextStatus) => {
        const params = {};

        const cleanedSearch = nextSearch.trim();

        if (cleanedSearch) {
            params.search = cleanedSearch;
        }

        if (nextStatus !== "all") {
            params.status = nextStatus;
        }

        router.get("/payments", params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearch = (event) => {
        event.preventDefault();
        applyFilters(search, status);
    };

    const handleStatusChange = (nextStatus) => {
        setStatus(nextStatus);
        applyFilters(search, nextStatus);
    };

    const clearFilters = () => {
        setSearch("");
        setStatus("all");
        applyFilters("", "all");
    };

    const hasActiveFilters =
        currentSearch !== "" || currentStatus !== "all";

    return {
        search,
        setSearch,
        status,
        handleSearch,
        handleStatusChange,
        clearFilters,
        hasActiveFilters,
    };
}
