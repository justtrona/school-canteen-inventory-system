
import React from "react";
import { ChevronDown, X } from "lucide-react";

import { ORDER_STATUSES } from "../Utils/constants.js";

export default function OrderFilters({
    appliedStatus,
    hasActiveFilters,
    handleStatusChange,
    clearFilters,
}) {
    return (
        <div className="orders-filter-actions">
            <div className="orders-status-filter">
                <select
                    id="orders-status-filter"
                    value={appliedStatus}
                    onChange={handleStatusChange}
                    aria-label="Filter orders by status"
                >
                    {ORDER_STATUSES.map((status) => (
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
                    className="orders-reset-filters"
                    onClick={clearFilters}
                >
                    <X size={15} />
                    <span>Clear Filters</span>
                </button>
            )}
        </div>
    );
}
