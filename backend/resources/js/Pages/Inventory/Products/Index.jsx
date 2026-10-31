import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Head, Link, router } from "@inertiajs/react";

import InventoryLayout from "../../../Layouts/InventoryLayout.jsx";

import AddProductModal from "./components/AddProductModal.jsx";
import ViewProductModal from "./components/ViewProductModal.jsx";
import EditProductModal from "./components/EditProductModal.jsx";
import ArchiveProductModal from "./components/ArchiveProductModal.jsx";

import "../../../../css/products.css";

export default function Index({
    products,
    categories = [],
    filters = {},
}) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [category, setCategory] = useState(
        String(filters.category ?? "")
    );
    const [status, setStatus] = useState(filters.status ?? "active");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [archivingProduct, setArchivingProduct] = useState(null);

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

    const closeActionMenu = () => {
        setActionMenu(null);
    };

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

        document.addEventListener("pointerdown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);
        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", handleScroll);

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsideClick
            );
            document.removeEventListener("keydown", handleEscape);
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleScroll);
        };
    }, [actionMenu]);

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
    }, [filters.search, filters.category, filters.status]);

    useEffect(() => {
        return () => {
            if (filterTimerRef.current) {
                clearTimeout(filterTimerRef.current);
            }
        };
    }, []);

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
                        if (requestId === filterRequestRef.current) {
                            setIsFiltering(false);
                        }
                    },
                }
            );
        }, delay);
    };

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

    const handleCategoryChange = (event) => {
        const nextCategory = event.target.value;

        setCategory(nextCategory);

        requestFilters({
            search,
            category: nextCategory,
            status,
        });
    };

    const handleStatusChange = (event) => {
        const nextStatus = event.target.value;

        setStatus(nextStatus);

        requestFilters({
            search,
            category,
            status: nextStatus,
        });
    };

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

    const openAddModal = () => {
        closeActionMenu();
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
    };

    const openViewModal = (product) => {
        closeActionMenu();
        setSelectedProduct(product);
    };

    const closeViewModal = () => {
        setSelectedProduct(null);
    };

    const openEditModal = (product) => {
        if (product.archived_at) return;

        closeActionMenu();
        setEditingProduct(product);
    };

    const closeEditModal = () => {
        setEditingProduct(null);
    };

    const openArchiveModal = (product) => {
        if (product.archived_at) return;

        closeActionMenu();
        setArchivingProduct(product);
    };

    const closeArchiveModal = () => {
        setArchivingProduct(null);
    };

    const handleRestoreProduct = (product) => {
        if (!product.archived_at) return;

        closeActionMenu();

        const confirmed = window.confirm(
            `Are you sure you want to restore "${product.name}"?\n\n` +
            "The product will return to the current catalog as Inactive."
        );

        if (!confirmed) return;

        router.patch(
            `/inventory/products/${product.id}/restore`,
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const getStockStatus = (quantity) => {
        const stockQuantity = Number(quantity ?? 0);

        if (stockQuantity <= 0) {
            return {
                label: "Out of Stock",
                className: "out",
            };
        }

        if (stockQuantity <= 10) {
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

    const formatPrice = (price) => {
        return Number(price ?? 0).toLocaleString("en-PH", {
            style: "currency",
            currency: "PHP",
        });
    };

    return (
        <InventoryLayout>
            <Head title="Products" />

            <div className="products-page">
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

                <section className="products-panel">
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
                                placeholder="Search products by name or SKU..."
                                value={search}
                                onChange={handleSearchChange}
                                aria-label="Search products"
                            />
                        </div>

                        <div className="products-filter-select">
                            <select
                                value={category}
                                onChange={handleCategoryChange}
                                aria-label="Filter by category"
                            >
                                <option value="">All Categories</option>

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
                                        const stock = getStockStatus(
                                            product.quantity
                                        );

                                        const isArchived = Boolean(
                                            product.archived_at
                                        );

                                        return (
                                            <tr key={product.id}>
                                                <td className="products-sku">
                                                    {product.sku}
                                                </td>

                                                <td className="products-name">
                                                    {product.name}
                                                </td>

                                                <td>
                                                    {product.category?.name ??
                                                        "Uncategorized"}
                                                </td>

                                                <td>
                                                    {formatPrice(
                                                        product.price
                                                    )}
                                                </td>

                                                <td>
                                                    {product.quantity}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`products-stock-badge ${stock.className}`}
                                                    >
                                                        {stock.label}
                                                    </span>
                                                </td>

                                                <td>
                                                    {isArchived
                                                        ? "Archived"
                                                        : product.is_active
                                                          ? "Active"
                                                          : "Inactive"}
                                                </td>

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

                        {!actionMenu.product.archived_at && (
                            <>
                                <button
                                    type="button"
                                    className="products-menu-item"
                                    role="menuitem"
                                    onClick={() =>
                                        openEditModal(actionMenu.product)
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
                                        openArchiveModal(actionMenu.product)
                                    }
                                >
                                    Archive
                                </button>
                            </>
                        )}

                        {actionMenu.product.archived_at && (
                            <>
                                <div className="products-menu-divider" />

                                <button
                                    type="button"
                                    className="products-menu-item"
                                    role="menuitem"
                                    onClick={() =>
                                        handleRestoreProduct(
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

            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                categories={categories}
            />

            <ViewProductModal
                isOpen={selectedProduct !== null}
                onClose={closeViewModal}
                product={selectedProduct}
            />

            <EditProductModal
                isOpen={editingProduct !== null}
                onClose={closeEditModal}
                product={editingProduct}
                categories={categories}
            />

            <ArchiveProductModal
                isOpen={archivingProduct !== null}
                onClose={closeArchiveModal}
                product={archivingProduct}
            />
        </InventoryLayout>
    );
}