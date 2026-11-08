
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Head, Link, router } from "@inertiajs/react";

import InventoryLayout from "../../../Layouts/InventoryLayout.jsx";

import AddStockOutModal from "./Components/AddStockOutModal.jsx";
import ViewStockOutModal from "./Components/ViewStockOutModal.jsx";

import "../../../../css/products.css";

const COUNT_UNITS = ["pcs", "bottle", "pack", "box"];

// ========================================
// FORMAT QUANTITY
// ========================================

const formatQuantity = (quantity, unit = "pcs") => {
    const number = Number(quantity ?? 0);

    if (!Number.isFinite(number)) return "—";

    return number.toLocaleString("en-PH", {
        maximumFractionDigits: COUNT_UNITS.includes(unit) ? 0 : 3,
    });
};

// ========================================
// FORMAT DATE
// ========================================

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

// ========================================
// FORMAT REASON
// ========================================

const formatReason = (reason) => {
    if (!reason) return "—";

    return reason.split(" - ")[0];
};

// ========================================
// STOCK OUT PAGE
// ========================================

export default function Index({
    stockOuts,
    products = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search ?? "");

    const [addOpen, setAddOpen] = useState(false);
    const [viewingMovement, setViewingMovement] = useState(null);

    const [actionMenu, setActionMenu] = useState(null);
    const [isFiltering, setIsFiltering] = useState(false);

    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const timerRef = useRef(null);
    const requestRef = useRef(0);

    const appliedRef = useRef({
        search: filters.search ?? "",
    });

    const currentRef = useRef({
        search,
    });

    currentRef.current = { search };

    // ========================================
    // CLOSE ACTION MENU
    // ========================================

    const closeActionMenu = () => {
        setActionMenu(null);
    };

    // ========================================
    // TOGGLE ACTION MENU
    // ========================================

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

    // ========================================
    // ACTION MENU LISTENERS
    // ========================================

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

            document.removeEventListener("keydown", onKeyDown);

            window.removeEventListener("scroll", onScroll, true);
            window.removeEventListener("resize", onScroll);
        };
    }, [actionMenu]);

    // ========================================
    // SYNC FILTERS
    // ========================================

    useEffect(() => {
        const next = {
            search: filters.search ?? "",
        };

        appliedRef.current = next;

        if (currentRef.current.search === next.search) {
            setIsFiltering(false);
        }
    }, [filters.search]);

    // ========================================
    // CLEANUP
    // ========================================

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    // ========================================
    // REQUEST FILTERS
    // ========================================

    const requestFilters = (nextFilters, delay = 0) => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        const requestId = ++requestRef.current;

        const normalized = {
            search: nextFilters.search.trim(),
        };

        if (
            normalized.search === appliedRef.current.search
        ) {
            router.cancelAll();
            setIsFiltering(false);
            return;
        }

        setIsFiltering(true);

        timerRef.current = setTimeout(() => {
            closeActionMenu();

            router.get(
                "/inventory/stock-out",
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

    // ========================================
    // SEARCH
    // ========================================

    const handleSearchChange = (event) => {
        const value = event.target.value;

        setSearch(value);

        requestFilters(
            { search: value },
            350
        );
    };

    // ========================================
    // RESET FILTERS
    // ========================================

    const resetFilters = () => {
        setSearch("");

        requestFilters({
            search: "",
        });
    };

    const hasFilters = search.trim() !== "";

    // ========================================
    // VIEW TRANSACTION
    // ========================================

    const openViewModal = (movement) => {
        closeActionMenu();
        setViewingMovement(movement);
    };

    // ========================================
    // RENDER
    // ========================================

    return (
        <InventoryLayout>
            <Head title="Stock Out" />

            <div className="products-page">

                {/* PAGE HEADER */}

                <div className="products-page-header">
                    <div>
                        <h1>Stock Out</h1>

                        <p>
                            Manage inventory deductions and record
                            products removed from the school canteen.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="products-add-button"
                        onClick={() => {
                            closeActionMenu();
                            setAddOpen(true);
                        }}
                    >
                        + Add Stock Out
                    </button>
                </div>

                {/* MAIN PANEL */}

                <section className="products-panel">

                    {/* FILTERS */}

                    <div className="products-filters">
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
                                placeholder="Search product, SKU or reason..."
                                value={search}
                                onChange={handleSearchChange}
                                aria-label="Search Stock Out transactions"
                            />
                        </div>

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
                                    Reset filters
                                </button>
                            )}
                        </div>
                    </div>

                    {/* STOCK OUT TABLE */}

                    <div className="products-table-wrapper">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>REFERENCE</th>
                                    <th>DATE RELEASED</th>
                                    <th>PRODUCT</th>
                                    <th>SKU</th>
                                    <th>REASON</th>
                                    <th>QUANTITY</th>
                                    <th>RELEASED BY</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>

                            <tbody>
                                {stockOuts.data.length > 0 ? (
                                    stockOuts.data.map((movement) => {
                                        const unit =
                                            movement.product
                                                ?.unit_of_measure ?? "pcs";

                                        const quantity = Math.abs(
                                            Number(
                                                movement.quantity_change ?? 0
                                            )
                                        );

                                        return (
                                            <tr key={movement.id}>
                                                {/* REFERENCE */}

                                                <td className="products-sku">
                                                    SO-
                                                    {String(movement.id).padStart(
                                                        6,
                                                        "0"
                                                    )}
                                                </td>

                                                {/* DATE */}

                                                <td>
                                                    {formatDate(
                                                        movement.created_at
                                                    )}
                                                </td>

                                                {/* PRODUCT */}

                                                <td className="products-name">
                                                    {movement.product?.name ??
                                                        "Unknown Product"}
                                                </td>

                                                {/* SKU */}

                                                <td className="products-sku">
                                                    {movement.product?.sku ??
                                                        "—"}
                                                </td>

                                                {/* REASON */}

                                                <td>
                                                    {formatReason(
                                                        movement.reason
                                                    )}
                                                </td>

                                                {/* QUANTITY */}

                                                <td>
                                                    <span>
                                                        -
                                                        {formatQuantity(
                                                            quantity,
                                                            unit
                                                        )}{" "}
                                                        {unit}
                                                    </span>
                                                </td>

                                                {/* RELEASED BY */}

                                                <td>
                                                    {movement.user?.name ??
                                                        "—"}
                                                </td>

                                                {/* ACTIONS */}

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="products-more-button"
                                                        aria-label={`Actions for stock out ${movement.id}`}
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
                                            colSpan={8}
                                            className="products-empty"
                                        >
                                            No Stock Out transactions found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}

                    <div className="products-pagination">
                        <span>
                            Showing {stockOuts.from ?? 0}–
                            {stockOuts.to ?? 0} of{" "}
                            {stockOuts.total} transactions
                        </span>

                        <div className="products-pagination-links">
                            {stockOuts.links.map((link, index) =>
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
                        aria-label="Stock Out actions"
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

            {/* ADD STOCK OUT MODAL */}

            <AddStockOutModal
                isOpen={addOpen}
                onClose={() => setAddOpen(false)}
                products={products}
            />

            {/* VIEW STOCK OUT MODAL */}

            <ViewStockOutModal
                isOpen={viewingMovement !== null}
                onClose={() => setViewingMovement(null)}
                movement={viewingMovement}
            />
        </InventoryLayout>
    );
}
