import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Head, Link, router } from "@inertiajs/react";

import InventoryLayout from "../../../Layouts/InventoryLayout.jsx";
import ViewStockHistoryModal from "./Components/ViewStockHistoryModal.jsx";

import "../../../../css/products.css";
import "../../../../css/stock-history.css";

const COUNT_UNITS = ["pcs", "bottle", "pack", "box"];

const formatQuantity = (value, unit = "pcs") => {
    const number = Number(value ?? 0);

    if (!Number.isFinite(number)) return "—";

    return number.toLocaleString("en-PH", {
        maximumFractionDigits: COUNT_UNITS.includes(unit) ? 0 : 3,
    });
};

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(
        /^\d{4}-\d{2}-\d{2}$/.test(value)
            ? `${value}T12:00:00`
            : value
    );

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

const formatDateLabel = (value) => {
    if (!value) return "Select date";

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export default function Index({
    stockHistory,
    filters = {},
    movementTypes = [],
}) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [type, setType] = useState(filters.type ?? "all");

    const [dateFrom, setDateFrom] = useState(
        filters.date_from ?? ""
    );

    const [dateTo, setDateTo] = useState(
        filters.date_to ?? ""
    );

    const [viewingMovement, setViewingMovement] = useState(null);
    const [actionMenu, setActionMenu] = useState(null);
    const [isFiltering, setIsFiltering] = useState(false);

    const menuRef = useRef(null);
    const buttonRef = useRef(null);

    const dateFromInputRef = useRef(null);
    const dateToInputRef = useRef(null);

    const timerRef = useRef(null);
    const requestRef = useRef(0);

    const appliedRef = useRef({
        search: filters.search ?? "",
        type: filters.type ?? "all",
        date_from: filters.date_from ?? "",
        date_to: filters.date_to ?? "",
    });

    const currentRef = useRef({
        search,
        type,
        date_from: dateFrom,
        date_to: dateTo,
    });

    currentRef.current = {
        search,
        type,
        date_from: dateFrom,
        date_to: dateTo,
    };

    const hasFilters =
        search.trim() !== "" ||
        type !== "all" ||
        dateFrom !== "" ||
        dateTo !== "";

    // Open native browser date picker.

    const openDatePicker = (inputRef) => {
        const input = inputRef.current;

        if (!input) return;

        try {
            if (typeof input.showPicker === "function") {
                input.showPicker();
            } else {
                input.focus();
                input.click();
            }
        } catch {
            input.focus();
            input.click();
        }
    };

    // Action menu.

    const closeActionMenu = () => {
        setActionMenu(null);
    };

    const toggleActionMenu = (event, movement) => {
        if (actionMenu?.movement.id === movement.id) {
            closeActionMenu();
            return;
        }

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();

        buttonRef.current = button;

        const menuWidth = 160;
        const menuHeight = 45;
        const padding = 8;

        const left = Math.max(
            padding,
            Math.min(
                rect.right - menuWidth,
                window.innerWidth - menuWidth - padding
            )
        );

        const spaceBelow = window.innerHeight - rect.bottom;

        const top =
            spaceBelow >= menuHeight + padding
                ? rect.bottom + 5
                : rect.top - menuHeight - 5;

        setActionMenu({
            movement,
            top: Math.max(padding, top),
            left,
        });
    };

    // Action menu listeners.

    useEffect(() => {
        if (!actionMenu) return;

        const onPointerDown = (event) => {
            const clickedMenu = menuRef.current?.contains(
                event.target
            );

            const clickedButton = buttonRef.current?.contains(
                event.target
            );

            if (!clickedMenu && !clickedButton) {
                closeActionMenu();
            }
        };

        const onKeyDown = (event) => {
            if (event.key === "Escape") {
                closeActionMenu();
                buttonRef.current?.focus();
            }
        };

        const onScroll = () => closeActionMenu();

        document.addEventListener("pointerdown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        window.addEventListener("scroll", onScroll, true);
        window.addEventListener("resize", onScroll);

        return () => {
            document.removeEventListener(
                "pointerdown",
                onPointerDown
            );

            document.removeEventListener(
                "keydown",
                onKeyDown
            );

            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", onScroll);
        };
    }, [actionMenu]);

    // Sync filters.

    useEffect(() => {
        const next = {
            search: filters.search ?? "",
            type: filters.type ?? "all",
            date_from: filters.date_from ?? "",
            date_to: filters.date_to ?? "",
        };

        appliedRef.current = next;

        const current = currentRef.current;

        if (
            current.search === next.search &&
            current.type === next.type &&
            current.date_from === next.date_from &&
            current.date_to === next.date_to
        ) {
            setIsFiltering(false);
        }
    }, [
        filters.search,
        filters.type,
        filters.date_from,
        filters.date_to,
    ]);

    // Cleanup.

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    // Filter request.

    const requestFilters = (nextFilters, delay = 0) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        const requestId = ++requestRef.current;

        const normalized = {
            search: nextFilters.search.trim(),
            type: nextFilters.type,
            date_from: nextFilters.date_from,
            date_to: nextFilters.date_to,
        };

        const unchanged =
            normalized.search === appliedRef.current.search &&
            normalized.type === appliedRef.current.type &&
            normalized.date_from === appliedRef.current.date_from &&
            normalized.date_to === appliedRef.current.date_to;

        if (unchanged) {
            router.cancelAll();
            setIsFiltering(false);
            return;
        }

        setIsFiltering(true);

        timerRef.current = setTimeout(() => {
            closeActionMenu();

            router.get(
                "/inventory/stock-history",
                normalized,
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,

                    onFinish: () => {
                        if (requestId === requestRef.current) {
                            setIsFiltering(false);
                        }
                    },
                }
            );
        }, delay);
    };

    // Filter handlers.

    const handleSearchChange = (event) => {
        const value = event.target.value;

        setSearch(value);

        requestFilters(
            {
                search: value,
                type,
                date_from: dateFrom,
                date_to: dateTo,
            },
            350
        );
    };

    const handleTypeChange = (event) => {
        const value = event.target.value;

        setType(value);

        requestFilters({
            search,
            type: value,
            date_from: dateFrom,
            date_to: dateTo,
        });
    };

    const handleDateFromChange = (event) => {
        const value = event.target.value;

        setDateFrom(value);

        requestFilters({
            search,
            type,
            date_from: value,
            date_to: dateTo,
        });
    };

    const handleDateToChange = (event) => {
        const value = event.target.value;

        setDateTo(value);

        requestFilters({
            search,
            type,
            date_from: dateFrom,
            date_to: value,
        });
    };

    // Reset filters.

    const resetFilters = () => {
        setSearch("");
        setType("all");
        setDateFrom("");
        setDateTo("");

        requestFilters({
            search: "",
            type: "all",
            date_from: "",
            date_to: "",
        });
    };

    // View transaction.

    const openViewModal = (movement) => {
        closeActionMenu();
        setViewingMovement(movement);
    };

    return (
        <InventoryLayout>
            <Head title="Stock History" />

            <div className="products-page">
                <div className="products-page-header">
                    <div>
                        <h1>Stock History</h1>

                        <p>
                            View and monitor all recorded inventory movements.
                        </p>
                    </div>
                </div>

                <section className="products-panel">

                    {/* FILTERS */}

                    <div className="products-filters stock-history-filters">

                        {/* SEARCH */}

                        <div className="products-search-field">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <circle cx="11" cy="11" r="7" />
                                <path d="m20 20-4-4" />
                            </svg>

                            <input
                                type="search"
                                placeholder="Search reference, product or SKU..."
                                value={search}
                                onChange={handleSearchChange}
                                aria-label="Search stock history"
                            />
                        </div>

                        {/* MOVEMENT TYPE */}

                        <div className="products-filter-select stock-history-type">
                            <select
                                value={type}
                                onChange={handleTypeChange}
                                aria-label="Filter by movement type"
                            >
                                {movementTypes.map((item) => (
                                    <option
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* DATE FILTER */}

                        <div className="stock-history-date-filter">

                            {/* FROM DATE */}

                            <div className="stock-history-date-control">
                                <button
                                    type="button"
                                    className="stock-history-date-trigger"
                                    onClick={() =>
                                        openDatePicker(dateFromInputRef)
                                    }
                                    aria-label="Choose starting date"
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <rect
                                            x="3"
                                            y="5"
                                            width="18"
                                            height="16"
                                            rx="2"
                                        />

                                        <path d="M16 3v4M8 3v4M3 10h18" />
                                    </svg>

                                    <span>
                                        {dateFrom
                                            ? formatDateLabel(dateFrom)
                                            : "From"}
                                    </span>
                                </button>

                                <input
                                    ref={dateFromInputRef}
                                    type="date"
                                    className="stock-history-hidden-date"
                                    value={dateFrom}
                                    max={dateTo || undefined}
                                    onChange={handleDateFromChange}
                                    aria-label="Starting date"
                                    tabIndex={-1}
                                />
                            </div>

                            <span className="stock-history-date-separator">
                                —
                            </span>

                            {/* TO DATE */}

                            <div className="stock-history-date-control">
                                <button
                                    type="button"
                                    className="stock-history-date-trigger"
                                    onClick={() =>
                                        openDatePicker(dateToInputRef)
                                    }
                                    aria-label="Choose ending date"
                                >
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <rect
                                            x="3"
                                            y="5"
                                            width="18"
                                            height="16"
                                            rx="2"
                                        />

                                        <path d="M16 3v4M8 3v4M3 10h18" />
                                    </svg>

                                    <span>
                                        {dateTo
                                            ? formatDateLabel(dateTo)
                                            : "To"}
                                    </span>
                                </button>

                                <input
                                    ref={dateToInputRef}
                                    type="date"
                                    className="stock-history-hidden-date"
                                    value={dateTo}
                                    min={dateFrom || undefined}
                                    onChange={handleDateToChange}
                                    aria-label="Ending date"
                                    tabIndex={-1}
                                />
                            </div>
                        </div>

                        {/* FILTER ACTIONS */}

                        <div className="products-filter-actions">
                            {isFiltering && (
                                <span
                                    className="products-filter-loading"
                                    role="status"
                                >
                                    Updating...
                                </span>
                            )}

                            {hasFilters && (
                                <button
                                    type="button"
                                    className="products-reset-button"
                                    onClick={resetFilters}
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>

                    {/* HISTORY TABLE */}

                    <div className="products-table-wrapper">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>REFERENCE</th>
                                    <th>DATE</th>
                                    <th>PRODUCT</th>
                                    <th>SKU</th>
                                    <th>MOVEMENT</th>
                                    <th>QUANTITY CHANGE</th>
                                    <th>PREVIOUS STOCK</th>
                                    <th>REMAINING STOCK</th>
                                    <th>RECORDED BY</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>

                            <tbody>
                                {stockHistory.data.length > 0 ? (
                                    stockHistory.data.map((movement) => {
                                        const isStockIn =
                                            movement.type === "stock_in";

                                        const receipt =
                                            movement.stock_in_receipt;

                                        const unit =
                                            movement.product?.unit_of_measure ??
                                            "pcs";

                                        const quantity = Math.abs(
                                            Number(
                                                movement.quantity_change ?? 0
                                            )
                                        );

                                        const reference = isStockIn
                                            ? receipt?.reference_number ??
                                              `SI-${String(movement.id).padStart(6, "0")}`
                                            : `SO-${String(movement.id).padStart(6, "0")}`;

                                        const transactionDate = isStockIn
                                            ? receipt?.received_at ??
                                              movement.created_at
                                            : movement.created_at;

                                        return (
                                            <tr key={movement.id}>
                                                <td className="products-sku">
                                                    {reference}
                                                </td>

                                                <td>
                                                    {formatDate(transactionDate)}
                                                </td>

                                                <td className="products-name">
                                                    {movement.product?.name ??
                                                        "Unknown Product"}
                                                </td>

                                                <td className="products-sku">
                                                    {movement.product?.sku ?? "—"}
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            isStockIn
                                                                ? "sc-view-badge-success"
                                                                : "sc-view-badge-warning"
                                                        }
                                                    >
                                                        {isStockIn
                                                            ? "Stock In"
                                                            : "Stock Out"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {isStockIn ? "+" : "-"}
                                                    {formatQuantity(
                                                        quantity,
                                                        unit
                                                    )}{" "}
                                                    {unit}
                                                </td>

                                                <td>
                                                    {formatQuantity(
                                                        movement.quantity_before,
                                                        unit
                                                    )}{" "}
                                                    {unit}
                                                </td>

                                                <td>
                                                    {formatQuantity(
                                                        movement.quantity_after,
                                                        unit
                                                    )}{" "}
                                                    {unit}
                                                </td>

                                                <td>
                                                    {movement.user?.name ?? "—"}
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="products-more-button"
                                                        aria-label={`Actions for transaction ${reference}`}
                                                        aria-haspopup="menu"
                                                        aria-expanded={
                                                            actionMenu?.movement.id ===
                                                            movement.id
                                                        }
                                                        onClick={(event) =>
                                                            toggleActionMenu(
                                                                event,
                                                                movement
                                                            )
                                                        }
                                                    >
                                                        <svg
                                                            width="18"
                                                            height="18"
                                                            viewBox="0 0 24 24"
                                                            fill="currentColor"
                                                            aria-hidden="true"
                                                        >
                                                            <circle
                                                                cx="12"
                                                                cy="5"
                                                                r="1.8"
                                                            />

                                                            <circle
                                                                cx="12"
                                                                cy="12"
                                                                r="1.8"
                                                            />

                                                            <circle
                                                                cx="12"
                                                                cy="19"
                                                                r="1.8"
                                                            />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="products-empty"
                                        >
                                            No stock history records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}

                    <div className="products-pagination">
                        <span>
                            Showing {stockHistory.from ?? 0}–
                            {stockHistory.to ?? 0} of{" "}
                            {stockHistory.total} transactions
                        </span>

                        <div className="products-pagination-links">
                            {stockHistory.links.map((link, index) =>
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        preserveScroll
                                        className={`products-page-link ${
                                            link.active ? "active" : ""
                                        }`}
                                    >
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Link>
                                ) : (
                                    <span
                                        key={index}
                                        className="products-page-link disabled"
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {/* ACTION MENU */}

            {actionMenu &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="products-action-menu"
                        role="menu"
                        aria-label="Stock History actions"
                        style={{
                            top: actionMenu.top,
                            left: actionMenu.left,
                        }}
                    >
                        <button
                            type="button"
                            role="menuitem"
                            className="products-menu-item"
                            onClick={() =>
                                openViewModal(actionMenu.movement)
                            }
                        >
                            View
                        </button>
                    </div>,
                    document.body
                )}

            {/* VIEW MODAL */}

            <ViewStockHistoryModal
                isOpen={viewingMovement !== null}
                onClose={() => setViewingMovement(null)}
                movement={viewingMovement}
            />
        </InventoryLayout>
    );
}