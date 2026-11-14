
import React from "react";
import {
    Search,
    CalendarDays,
    RotateCcw,
} from "lucide-react";

export default function SalesFilters({
    controls,
}) {
    return (
        <div className="sales-filter-container">
            <form
                className="sales-toolbar"
                onSubmit={controls.handleSubmit}
            >
                <div className="sales-search-control">
                    <Search size={16} strokeWidth={1.8} />

                    <input
                        type="text"
                        value={controls.search}
                        onChange={(event) =>
                            controls.setSearch(event.target.value)
                        }
                        placeholder="Search transaction number..."
                        aria-label="Search sales transactions"
                    />
                </div>

                <div className="sales-date-filters">
                    <div className="sales-date-control">
                        <CalendarDays
                            size={15}
                            strokeWidth={1.8}
                        />

                        <input
                            type="date"
                            value={controls.dateFrom}
                            max={controls.dateTo || undefined}
                            onChange={(event) =>
                                controls.setDateFrom(
                                    event.target.value
                                )
                            }
                            aria-label="From date"
                        />
                    </div>

                    <span className="sales-date-separator">
                        to
                    </span>

                    <div className="sales-date-control">
                        <CalendarDays
                            size={15}
                            strokeWidth={1.8}
                        />

                        <input
                            type="date"
                            value={controls.dateTo}
                            min={controls.dateFrom || undefined}
                            onChange={(event) =>
                                controls.setDateTo(
                                    event.target.value
                                )
                            }
                            aria-label="To date"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="sales-search-button"
                    disabled={controls.invalidDateRange}
                >
                    Search
                </button>

                {controls.hasActiveFilters && (
                    <button
                        type="button"
                        className="sales-clear-button"
                        onClick={controls.clearFilters}
                    >
                        <RotateCcw size={14} />
                        Clear
                    </button>
                )}
            </form>

            {controls.invalidDateRange && (
                <p className="sales-filter-error">
                    The From date cannot be later than the To date.
                </p>
            )}
        </div>
    );
}
