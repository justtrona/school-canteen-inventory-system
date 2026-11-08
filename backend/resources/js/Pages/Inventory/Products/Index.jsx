
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Head, Link, router } from "@inertiajs/react";

import InventoryLayout from "../../../Layouts/InventoryLayout.jsx";

import AddProductModal from "./components/AddProductModal.jsx";
import ViewProductModal from "./components/ViewProductModal.jsx";
import EditProductModal from "./components/EditProductModal.jsx";
import ArchiveProductModal from "./components/ArchiveProductModal.jsx";
import RestoreProductModal from "./components/RestoreProductModal.jsx";

import "../../../../css/products.css";

// ========================================
// QUANTITY FORMATTING
// ========================================

const COUNT_UNITS = ["pcs", "bottle", "pack", "box"];

const formatQuantity = (quantity, unit = "pcs") => {
    const value = Number(quantity ?? 0);

    if (!Number.isFinite(value)) return "—";

    return value.toLocaleString("en-PH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: COUNT_UNITS.includes(unit) ? 0 : 3,
    });
};

// ========================================
// STOCK STATUS
// ========================================

const getStockStatus = (quantity, reorderLevel) => {
    const stockQuantity = Number(quantity ?? 0);
    const threshold = Number(reorderLevel ?? 0);

    if (stockQuantity <= 0) {
        return {
            label: "Out of Stock",
            className: "out",
        };
    }

    if (threshold > 0 && stockQuantity <= threshold) {
        return {
            label: "Low Stock",
            className: "low",
        };
    }

    return {
        label: "In Stock",
        className: "available",
    };
};

// ========================================
// PRICE FORMATTING
// ========================================

const formatPrice = (price) => {
    return Number(price ?? 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

// ========================================
// PRODUCTS PAGE
// ========================================

export default function Index({
    products,
    categories = [],
    filters = {},
}) {
    // ========================================
    // FILTER STATES
    // ========================================

    const [search, setSearch] = useState(filters.search ?? "");

    const [category, setCategory] = useState(
        String(filters.category ?? "")
    );

    const [status, setStatus] = useState(
        filters.status ?? "active"
    );

    // ========================================
    // MODAL STATES
    // ========================================

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [archivingProduct, setArchivingProduct] = useState(null);
    const [restoringProduct, setRestoringProduct] = useState(null);

    // ========================================
    // ACTION MENU STATES
    // ========================================

    const [actionMenu, setActionMenu] = useState(null);
    const [isFiltering, setIsFiltering] = useState(false);

    const actionMenuRef = useRef(null);
    const actionButtonRef = useRef(null);
    const filterTimerRef = useRef(null);
    const filterRequestRef = useRef(0);

    const appliedFiltersRef = useRef({
        search: filters.search ?? "",
        category: String(filters.category ?? ""),
        status: filters.status ?? "active",
    });

    const currentFiltersRef = useRef({
        search,
        category,
        status,
    });

    currentFiltersRef.current = {
        search,
        category,
        status,
    };

    const hasActiveFilters =
        search.trim() !== "" ||
        category !== "" ||
        status !== "active";

    // ========================================
    // CLOSE ACTION MENU
    // ========================================

    const closeActionMenu = () => {
        setActionMenu(null);
    };

    // ========================================
    // TOGGLE ACTION MENU
    // ========================================

    const toggleActionMenu = (event, product) => {
        if (actionMenu?.product.id === product.id) {
            closeActionMenu();
            return;
        }

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();

        actionButtonRef.current = button;

        const menuWidth = 160;
        const menuHeight = product.archived_at ? 95 : 132;
        const viewportPadding = 8;

        const left = Math.max(
            viewportPadding,
            Math.min(
                rect.right - menuWidth,
                window.innerWidth - menuWidth - viewportPadding
            )
        );

        const spaceBelow = window.innerHeight - rect.bottom;

        const top =
            spaceBelow >= menuHeight + viewportPadding
                ? rect.bottom + 5
                : rect.top - menuHeight - 5;

        setActionMenu({
            product,
            top: Math.max(viewportPadding, top),
            left,
        });
    };

    // ========================================
    // ACTION MENU EVENT LISTENERS
    // ========================================

    useEffect(() => {
        if (!actionMenu) return;

        const handleOutsideClick = (event) => {
            const clickedMenu = actionMenuRef.current?.contains(
                event.target
            );

            const clickedButton = actionButtonRef.current?.contains(
                event.target
            );

            if (!clickedMenu && !clickedButton) {
                closeActionMenu();
            }
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                closeActionMenu();
                actionButtonRef.current?.focus();
            }
        };

        const handleScroll = () => {
            closeActionMenu();
        };

        document.addEventListener(
            "pointerdown",
            handleOutsideClick
        );

        document.addEventListener(
            "keydown",
            handleEscape
        );

        window.addEventListener(
            "scroll",
            handleScroll,
            true
        );

        window.addEventListener(
            "resize",
            handleScroll
        );

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsideClick
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );

            window.removeEventListener(
                "scroll",
                handleScroll,
                true
            );

            window.removeEventListener(
                "resize",
                handleScroll
            );
        };
    }, [actionMenu]);

    // ========================================
    // SYNC APPLIED FILTERS
    // ========================================

    useEffect(() => {
        const nextAppliedFilters = {
            search: filters.search ?? "",
            category: String(filters.category ?? ""),
            status: filters.status ?? "active",
        };

        appliedFiltersRef.current = nextAppliedFilters;

        const current = currentFiltersRef.current;

        if (
            current.search === nextAppliedFilters.search &&
            current.category === nextAppliedFilters.category &&
            current.status === nextAppliedFilters.status
        ) {
            setIsFiltering(false);
        }
    }, [
        filters.search,
        filters.category,
        filters.status,
    ]);

    // ========================================
    // CLEAR FILTER TIMER
    // ========================================

    useEffect(() => {
        return () => {
            if (filterTimerRef.current) {
                clearTimeout(filterTimerRef.current);
            }
        };
    }, []);

    // ========================================
    // REQUEST FILTERS
    // ========================================

    const requestFilters = (nextFilters, delay = 0) => {
        if (filterTimerRef.current) {
            clearTimeout(filterTimerRef.current);
        }

        const requestId = ++filterRequestRef.current;

        const normalizedFilters = {
            search: nextFilters.search.trim(),
            category: nextFilters.category,
            status: nextFilters.status,
        };

        const applied = appliedFiltersRef.current;

        if (
            normalizedFilters.search === applied.search &&
            normalizedFilters.category === applied.category &&
            normalizedFilters.status === applied.status
        ) {
            router.cancelAll();
            setIsFiltering(false);
            return;
        }

        setIsFiltering(true);

        filterTimerRef.current = setTimeout(() => {
            closeActionMenu();

            router.get(
                "/inventory/products",
                normalizedFilters,
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,

                    onFinish: () => {
                        if (
                            requestId ===
                            filterRequestRef.current
                        ) {
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
        const nextSearch = event.target.value;

        setSearch(nextSearch);

        requestFilters(
            {
                search: nextSearch,
                category,
                status,
            },
            350
        );
    };

    // ========================================
    // CATEGORY FILTER
    // ========================================

    const handleCategoryChange = (event) => {
        const nextCategory = event.target.value;

        setCategory(nextCategory);

        requestFilters({
            search,
            category: nextCategory,
            status,
        });
    };

    // ========================================
    // STATUS FILTER
    // ========================================

    const handleStatusChange = (event) => {
        const nextStatus = event.target.value;

        setStatus(nextStatus);

        requestFilters({
            search,
            category,
            status: nextStatus,
        });
    };

    // ========================================
    // RESET FILTERS
    // ========================================

    const resetFilters = () => {
        setSearch("");
        setCategory("");
        setStatus("active");

        requestFilters({
            search: "",
            category: "",
            status: "active",
        });
    };

    // ========================================
    // ADD MODAL
    // ========================================

    const openAddModal = () => {
        closeActionMenu();
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
    };

    // ========================================
    // VIEW MODAL
    // ========================================

    const openViewModal = (product) => {
        closeActionMenu();
        setSelectedProduct(product);
    };

    const closeViewModal = () => {
        setSelectedProduct(null);
    };

    // ========================================
    // EDIT MODAL
    // ========================================

    const openEditModal = (product) => {
        if (product.archived_at) return;

        closeActionMenu();
        setEditingProduct(product);
    };

    const closeEditModal = () => {
        setEditingProduct(null);
    };

    // ========================================
    // ARCHIVE MODAL
    // ========================================

    const openArchiveModal = (product) => {
        if (product.archived_at) return;

        closeActionMenu();
        setArchivingProduct(product);
    };

    const closeArchiveModal = () => {
        setArchivingProduct(null);
    };

    // ========================================
    // RESTORE MODAL
    // ========================================

    const openRestoreModal = (product) => {
        if (!product.archived_at) return;

        closeActionMenu();
        setRestoringProduct(product);
    };

    const closeRestoreModal = () => {
        setRestoringProduct(null);
    };

    // ========================================
    // RENDER
    // ========================================

    return (
        <InventoryLayout>
            <Head title="Products" />

            <div className="products-page">
                {/* ========================================
                    PAGE HEADER
                ======================================== */}

                <div className="products-page-header">
                    <div>
                        <h1>Products</h1>

                        <p>
                            Manage products and monitor their current
                            stock levels.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="products-add-button"
                        onClick={openAddModal}
                    >
                        + Add Product
                    </button>
                </div>

                {/* ========================================
                    PRODUCTS PANEL
                ======================================== */}

                <section className="products-panel">
                    {/* ========================================
                        FILTERS
                    ======================================== */}

                    <div className="products-filters">
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
                                <circle
                                    cx="11"
                                    cy="11"
                                    r="7"
                                />

                                <path d="m20 20-4-4" />
                            </svg>

                            <input
                                type="search"
                                placeholder="Search products by name or SKU..."
                                value={search}
                                onChange={handleSearchChange}
                                aria-label="Search products"
                            />
                        </div>

                        {/* CATEGORY FILTER */}

                        <div className="products-filter-select">
                            <select
                                value={category}
                                onChange={handleCategoryChange}
                                aria-label="Filter by category"
                            >
                                <option value="">
                                    All Categories
                                </option>

                                {categories.map((item) => (
                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* STATUS FILTER */}

                        <div className="products-filter-select products-status-select">
                            <select
                                value={status}
                                onChange={handleStatusChange}
                                aria-label="Filter by product archive status"
                            >
                                <option value="active">
                                    Current Products
                                </option>

                                <option value="archived">
                                    Archived Products
                                </option>
                            </select>
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

                            {hasActiveFilters && (
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

                    {/* ========================================
                        PRODUCTS TABLE
                    ======================================== */}

                    <div className="products-table-wrapper">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>PRODUCT</th>
                                    <th>CATEGORY</th>
                                    <th>PRICE</th>
                                    <th>QUANTITY</th>
                                    <th>STOCK STATUS</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.data.length > 0 ? (
                                    products.data.map((product) => {
                                        // ========================================
                                        // PRODUCT STOCK DETAILS
                                        // ========================================

                                        const stock = getStockStatus(
                                            product.quantity,
                                            product.reorder_level
                                        );

                                        const unit =
                                            product.unit_of_measure ??
                                            "pcs";

                                        const formattedQuantity =
                                            formatQuantity(
                                                product.quantity,
                                                unit
                                            );

                                        const isArchived = Boolean(
                                            product.archived_at
                                        );

                                        return (
                                            <tr key={product.id}>
                                                {/* SKU */}

                                                <td className="products-sku">
                                                    {product.sku}
                                                </td>

                                                {/* PRODUCT NAME */}

                                                <td className="products-name">
                                                    {product.name}
                                                </td>

                                                {/* CATEGORY */}

                                                <td>
                                                    {product.category?.name ??
                                                        "Uncategorized"}
                                                </td>

                                                {/* SELLING PRICE */}

                                                <td>
                                                    {formatPrice(
                                                        product.price
                                                    )}
                                                </td>

                                                {/* QUANTITY WITH UNIT */}

                                                <td>
                                                    {formattedQuantity}{" "}
                                                    {unit}
                                                </td>

                                                {/* STOCK STATUS */}

                                                <td>
                                                    <span
                                                        className={`products-stock-badge ${stock.className}`}
                                                    >
                                                        {stock.label}
                                                    </span>
                                                </td>

                                                {/* PRODUCT STATUS */}

                                                <td>
                                                    {isArchived
                                                        ? "Archived"
                                                        : product.is_active
                                                          ? "Active"
                                                          : "Inactive"}
                                                </td>

                                                {/* ACTIONS */}

                                                <td>
                                                    <button
                                                        type="button"
                                                        className="products-more-button"
                                                        onClick={(event) =>
                                                            toggleActionMenu(
                                                                event,
                                                                product
                                                            )
                                                        }
                                                        aria-label={`Actions for ${product.name}`}
                                                        aria-haspopup="menu"
                                                        aria-expanded={
                                                            actionMenu?.product.id ===
                                                            product.id
                                                        }
                                                        title="More actions"
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
                                            {status === "archived"
                                                ? "No archived products found."
                                                : "No products found."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ========================================
                        PAGINATION
                    ======================================== */}

                    <div className="products-pagination">
                        <span>
                            Showing {products.from ?? 0}–
                            {products.to ?? 0} of{" "}
                            {products.total} products
                        </span>

                        <div className="products-pagination-links">
                            {products.links.map((link, index) =>
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

            {/* ========================================
                PRODUCT ACTION MENU
            ======================================== */}

            {actionMenu &&
                createPortal(
                    <div
                        ref={actionMenuRef}
                        className="products-action-menu"
                        role="menu"
                        aria-label={`Actions for ${actionMenu.product.name}`}
                        style={{
                            top: actionMenu.top,
                            left: actionMenu.left,
                        }}
                    >
                        {/* VIEW */}

                        <button
                            type="button"
                            className="products-menu-item"
                            role="menuitem"
                            onClick={() =>
                                openViewModal(actionMenu.product)
                            }
                        >
                            View
                        </button>

                        {/* EDIT AND ARCHIVE */}

                        {!actionMenu.product.archived_at && (
                            <>
                                <button
                                    type="button"
                                    className="products-menu-item"
                                    role="menuitem"
                                    onClick={() =>
                                        openEditModal(
                                            actionMenu.product
                                        )
                                    }
                                >
                                    Edit
                                </button>

                                <div className="products-menu-divider" />

                                <button
                                    type="button"
                                    className="products-menu-item products-menu-archive"
                                    role="menuitem"
                                    onClick={() =>
                                        openArchiveModal(
                                            actionMenu.product
                                        )
                                    }
                                >
                                    Archive
                                </button>
                            </>
                        )}

                        {/* RESTORE */}

                        {actionMenu.product.archived_at && (
                            <>
                                <div className="products-menu-divider" />

                                <button
                                    type="button"
                                    className="products-menu-item"
                                    role="menuitem"
                                    onClick={() =>
                                        openRestoreModal(
                                            actionMenu.product
                                        )
                                    }
                                >
                                    Restore
                                </button>
                            </>
                        )}
                    </div>,
                    document.body
                )}

            {/* ========================================
                ADD PRODUCT MODAL
            ======================================== */}

            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                categories={categories}
            />

            {/* ========================================
                VIEW PRODUCT MODAL
            ======================================== */}

            <ViewProductModal
                isOpen={selectedProduct !== null}
                onClose={closeViewModal}
                product={selectedProduct}
            />

            {/* ========================================
                EDIT PRODUCT MODAL
            ======================================== */}

            <EditProductModal
                isOpen={editingProduct !== null}
                onClose={closeEditModal}
                product={editingProduct}
                categories={categories}
            />

            {/* ========================================
                ARCHIVE PRODUCT MODAL
            ======================================== */}

            <ArchiveProductModal
                isOpen={archivingProduct !== null}
                onClose={closeArchiveModal}
                product={archivingProduct}
            />

            {/* ========================================
                RESTORE PRODUCT MODAL
            ======================================== */}

            <RestoreProductModal
                isOpen={restoringProduct !== null}
                onClose={closeRestoreModal}
                product={restoringProduct}
            />
        </InventoryLayout>
    );
}
