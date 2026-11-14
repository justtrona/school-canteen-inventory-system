
import React from "react";
import { ChevronDown, X } from "lucide-react";

import { TRANSACTION_STATUSES } from "../Utils/constants.js";

export default function TransactionFilters({
    appliedStatus,
    hasActiveFilters,
    handleStatusChange,
    clearFilters,
}) {
    return (
        <div className="pos-filter-actions">
            <div className="pos-status-filter">
                <select
                    id="pos-status-filter"
                    value={appliedStatus}
                    onChange={handleStatusChange}
                    aria-label="Filter transactions by status"
                >
                    {TRANSACTION_STATUSES.map((status) => (
                        <option
                            key={status.value}
                            value={status.value}
                        >
                            {status.label}
                        </option>
                    ))}
                </select>

                <ChevronDown
                    size={15}
                    strokeWidth={1.8}
                    aria-hidden="true"
                />
            </div>

            {hasActiveFilters && (
                <button
                    type="button"
                    className="pos-reset-filters"
                    onClick={clearFilters}
                >
                    <X size={15} />
                    <span>Clear Filters</span>
                </button>
            )}
        </div>
    );
}
