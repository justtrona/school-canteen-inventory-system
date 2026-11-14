
import React from "react";
import { ListFilter, RotateCcw } from "lucide-react";

import { PAYMENT_STATUSES } from "../Utils/constants.js";

export default function PaymentFilters({
    status,
    onStatusChange,
    onClear,
    hasActiveFilters,
}) {
    return (
        <div className="payments-filters">
            <div className="payments-status-filter">
                <ListFilter
                    size={16}
                    strokeWidth={1.8}
                />

                <select
                    value={status}
                    onChange={(event) =>
                        onStatusChange(event.target.value)
                    }
                    aria-label="Filter payments by status"
                >
                    {PAYMENT_STATUSES.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {hasActiveFilters && (
                <button
                    type="button"
                    className="payments-clear-button"
                    onClick={onClear}
                >
                    <RotateCcw
                        size={14}
                        strokeWidth={1.8}
                    />
                    Clear
                </button>
            )}
        </div>
    );
}
