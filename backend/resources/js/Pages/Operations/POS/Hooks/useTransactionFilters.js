
import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

export default function useTransactionFilters(filters = {}) {
    const appliedSearch = filters.search ?? "";
    const appliedStatus = filters.status ?? "all";

    const [search, setSearch] = useState(appliedSearch);

    useEffect(() => {
        setSearch(appliedSearch);
    }, [appliedSearch]);

    const applyFilters = (searchValue, statusValue) => {
        const query = searchValue.trim();
        const params = {};

        if (query !== "") {
            params.search = query;
        }

        if (statusValue !== "all") {
            params.status = statusValue;
        }

        router.get("/pos", params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSearch = (event) => {
        event.preventDefault();
        applyFilters(search, appliedStatus);
    };

    const handleStatusChange = (event) => {
        applyFilters(search, event.target.value);
    };

    const clearSearch = () => {
        setSearch("");
        applyFilters("", appliedStatus);
    };

    const clearFilters = () => {
        setSearch("");
        applyFilters("", "all");
    };

    const hasActiveFilters =
        appliedSearch !== "" || appliedStatus !== "all";

    return {
        search,
        setSearch,
        appliedStatus,
        hasActiveFilters,
        handleSearch,
        handleStatusChange,
        clearSearch,
        clearFilters,
    };
}
