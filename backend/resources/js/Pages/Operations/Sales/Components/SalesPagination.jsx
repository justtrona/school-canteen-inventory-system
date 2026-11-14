
import React from "react";
import { Link } from "@inertiajs/react";
import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import {
    formatNumber,
} from "../Utils/formatters.js";

export default function SalesPagination({
    sales = {},
}) {
    const total = Number(sales.total) || 0;
    const currentPage = Number(sales.current_page) || 1;
    const lastPage = Number(sales.last_page) || 1;

    if (total === 0) {
        return null;
    }

    return (
        <div className="sales-pagination">
            <div className="sales-pagination-info">
                Showing{" "}
                <strong>{formatNumber(sales.from ?? 0)}</strong>
                {" - "}
                <strong>{formatNumber(sales.to ?? 0)}</strong>
                {" of "}
                <strong>{formatNumber(total)}</strong>
                {" sales"}
            </div>

            <div className="sales-pagination-controls">
                {sales.prev_page_url ? (
                    <Link
                        href={sales.prev_page_url}
                        preserveScroll
                        className="sales-page-button"
                    >
                        <ChevronLeft size={15} />
                        Previous
                    </Link>
                ) : (
                    <button
                        type="button"
                        className="sales-page-button"
                        disabled
                    >
                        <ChevronLeft size={15} />
                        Previous
                    </button>
                )}

                <span className="sales-page-indicator">
                    Page {currentPage} of {lastPage}
                </span>

                {sales.next_page_url ? (
                    <Link
                        href={sales.next_page_url}
                        preserveScroll
                        className="sales-page-button"
                    >
                        Next
                        <ChevronRight size={15} />
                    </Link>
                ) : (
                    <button
                        type="button"
                        className="sales-page-button"
                        disabled
                    >
                        Next
                        <ChevronRight size={15} />
                    </button>
                )}
            </div>
        </div>
    );
}
