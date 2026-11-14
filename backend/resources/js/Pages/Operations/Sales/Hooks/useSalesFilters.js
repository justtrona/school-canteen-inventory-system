
import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";

export default function useSalesFilters(filters = {}) {
    const currentSearch = filters.search ?? "";
    const currentFrom = filters.date_from ?? "";
    const currentTo = filters.date_to ?? "";

    const [search, setSearch] = useState(currentSearch);
    const [dateFrom, setDateFrom] = useState(currentFrom);
    const [dateTo, setDateTo] = useState(currentTo);

    useEffect(() => {
        setSearch(currentSearch);
        setDateFrom(currentFrom);
        setDateTo(currentTo);
    }, [currentSearch, currentFrom, currentTo]);

    const applyFilters = (values) => {
        const params = {};

        if (values.search.trim()) {
            params.search = values.search.trim();
        }

        if (values.dateFrom) {
            params.date_from = values.dateFrom;
        }

        if (values.dateTo) {
            params.date_to = values.dateTo;
        }

        router.get("/sales", params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (dateFrom && dateTo && dateFrom > dateTo) {
            return;
        }

        applyFilters({
            search,
            dateFrom,
            dateTo,
        });
    };

    const clearFilters = () => {
        setSearch("");
        setDateFrom("");
        setDateTo("");

        applyFilters({
            search: "",
            dateFrom: "",
            dateTo: "",
        });
    };

    const hasActiveFilters = Boolean(
        currentSearch || currentFrom || currentTo
    );

    const invalidDateRange = Boolean(
        dateFrom && dateTo && dateFrom > dateTo
    );

    return {
        search,
        setSearch,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        handleSubmit,
        clearFilters,
        hasActiveFilters,
        invalidDateRange,
    };
}
