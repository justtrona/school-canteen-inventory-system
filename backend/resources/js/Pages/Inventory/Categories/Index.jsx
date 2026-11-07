
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Head, Link, router } from "@inertiajs/react";

import InventoryLayout from "../../../Layouts/InventoryLayout.jsx";

import AddCategoryModal from "./components/AddCategoryModal.jsx";
import ViewCategoryModal from "./components/ViewCategoryModal.jsx";
import EditCategoryModal from "./components/EditCategoryModal.jsx";
import DeactivateCategoryModal from "./components/DeactivateCategoryModal.jsx";
import ReactivateCategoryModal from "./components/ReactivateCategoryModal.jsx";

import "../../../../css/products.css";
import "../../../../css/categories.css";

export default function Index({ categories, filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [status, setStatus] = useState(filters.status ?? "active");
    const [isFiltering, setIsFiltering] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deactivatingCategory, setDeactivatingCategory] = useState(null);
    const [reactivatingCategory, setReactivatingCategory] = useState(null);

    const [actionMenu, setActionMenu] = useState(null);

    const actionMenuRef = useRef(null);
    const actionButtonRef = useRef(null);
    const filterTimerRef = useRef(null);
    const filterRequestRef = useRef(0);

    const appliedFiltersRef = useRef({
        search: filters.search ?? "",
        status: filters.status ?? "active",
    });

    const currentFiltersRef = useRef({ search, status });
    currentFiltersRef.current = { search, status };

    const hasActiveFilters =
        search.trim() !== "" || status !== "active";

    const closeActionMenu = () => setActionMenu(null);

    const toggleActionMenu = (event, category) => {
        if (actionMenu?.category.id === category.id) {
            closeActionMenu();
            return;
        }

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();

        actionButtonRef.current = button;

        const menuWidth = 160;
        const menuHeight = category.is_active ? 132 : 95;
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
            category,
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

        const handleScroll = () => closeActionMenu();

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
        const applied = {
            search: filters.search ?? "",
            status: filters.status ?? "active",
        };

        appliedFiltersRef.current = applied;

        const current = currentFiltersRef.current;

        if (
            current.search.trim() === applied.search &&
            current.status === applied.status
        ) {
            setIsFiltering(false);
        }
    }, [filters.search, filters.status]);

    useEffect(() => {
        return () => clearTimeout(filterTimerRef.current);
    }, []);

    const requestFilters = (nextFilters, delay = 0) => {
        clearTimeout(filterTimerRef.current);

        const requestId = ++filterRequestRef.current;

        const normalized = {
            search: nextFilters.search.trim(),
            status: nextFilters.status,
        };

        const applied = appliedFiltersRef.current;

        if (
            normalized.search === applied.search &&
            normalized.status === applied.status
        ) {
            setIsFiltering(false);
            return;
        }

        setIsFiltering(true);

        filterTimerRef.current = setTimeout(() => {
            closeActionMenu();

            router.get(
                "/inventory/categories",
                normalized,
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
            { search: nextSearch, status },
            350
        );
    };

    const handleStatusChange = (event) => {
        const nextStatus = event.target.value;

        setStatus(nextStatus);

        requestFilters({
            search,
            status: nextStatus,
        });
    };

    const resetFilters = () => {
        setSearch("");
        setStatus("active");

        requestFilters({
            search: "",
            status: "active",
        });
    };

    const openViewModal = (category) => {
        closeActionMenu();
        setSelectedCategory(category);
    };

    const openEditModal = (category) => {
        if (!category.is_active) return;

        closeActionMenu();
        setEditingCategory(category);
    };

    const openDeactivateModal = (category) => {
        if (!category.is_active) return;

        closeActionMenu();
        setDeactivatingCategory(category);
    };

    const openReactivateModal = (category) => {
        if (category.is_active) return;

        closeActionMenu();
        setReactivatingCategory(category);
    };

    return (
        <InventoryLayout>
            <Head title="Categories" />

            <div className="products-page categories-page">
                <div className="products-page-header">
                    <div>
                        <h1>Categories</h1>
                        <p>
                            Organize and manage your product categories.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="products-add-button"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        + Add Category
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
                                placeholder="Search categories by name or SKU prefix..."
                                value={search}
                                onChange={handleSearchChange}
                                aria-label="Search categories"
                            />
                        </div>

                        <div className="products-filter-select products-status-select">
                            <select
                                value={status}
                                onChange={handleStatusChange}
                                aria-label="Filter category status"
                            >
                                <option value="active">
                                    Active Categories
                                </option>
                                <option value="inactive">
                                    Inactive Categories
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
                        <table className="products-table categories-table">
                            <thead>
                                <tr>
                                    <th>CATEGORY</th>
                                    <th>SKU PREFIX</th>
                                    <th>DESCRIPTION</th>
                                    <th>PRODUCTS</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>

                            <tbody>
                                {categories.data.length > 0 ? (
                                    categories.data.map((category) => (
                                        <tr key={category.id}>
                                            <td className="products-name">
                                                {category.name}
                                            </td>

                                            <td className="products-sku">
                                                {category.sku_prefix}
                                            </td>

                                            <td className="categories-description">
                                                {category.description || "—"}
                                            </td>

                                            <td>
                                                {category.products_count ?? 0}
                                            </td>

                                            <td>
                                                {category.is_active
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
                                                            category
                                                        )
                                                    }
                                                    aria-label={`Actions for ${category.name}`}
                                                    aria-haspopup="menu"
                                                    aria-expanded={
                                                        actionMenu?.category.id ===
                                                        category.id
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
                                                        <circle cx="12" cy="5" r="1.8" />
                                                        <circle cx="12" cy="12" r="1.8" />
                                                        <circle cx="12" cy="19" r="1.8" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="products-empty"
                                        >
                                            {status === "inactive"
                                                ? "No inactive categories found."
                                                : "No categories found."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="products-pagination">
                        <span>
                            Showing {categories.from ?? 0}–
                            {categories.to ?? 0} of{" "}
                            {categories.total} categories
                        </span>

                        <div className="products-pagination-links">
                            {categories.links.map((link, index) =>
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
                        aria-label={`Actions for ${actionMenu.category.name}`}
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
                                openViewModal(actionMenu.category)
                            }
                        >
                            View
                        </button>

                        {actionMenu.category.is_active ? (
                            <>
                                <button
                                    type="button"
                                    className="products-menu-item"
                                    role="menuitem"
                                    onClick={() =>
                                        openEditModal(actionMenu.category)
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
                                        openDeactivateModal(actionMenu.category)
                                    }
                                >
                                    Deactivate
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="products-menu-divider" />

                                <button
                                    type="button"
                                    className="products-menu-item"
                                    role="menuitem"
                                    onClick={() =>
                                        openReactivateModal(actionMenu.category)
                                    }
                                >
                                    Reactivate
                                </button>
                            </>
                        )}
                    </div>,
                    document.body
                )}

            <AddCategoryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <ViewCategoryModal
                isOpen={selectedCategory !== null}
                onClose={() => setSelectedCategory(null)}
                category={selectedCategory}
            />

            <EditCategoryModal
                isOpen={editingCategory !== null}
                onClose={() => setEditingCategory(null)}
                category={editingCategory}
            />

            <DeactivateCategoryModal
                isOpen={deactivatingCategory !== null}
                onClose={() => setDeactivatingCategory(null)}
                category={deactivatingCategory}
            />

            <ReactivateCategoryModal
                isOpen={reactivatingCategory !== null}
                onClose={() => setReactivatingCategory(null)}
                category={reactivatingCategory}
            />
        </InventoryLayout>
    );
}
