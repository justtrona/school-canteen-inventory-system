
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Head, Link, router } from "@inertiajs/react";

import InventoryLayout from "../../../Layouts/InventoryLayout.jsx";

import AddSupplierModal from "./Components/AddSupplierModal.jsx";
import ViewSupplierModal from "./Components/ViewSupplierModal.jsx";
import EditSupplierModal from "./Components/EditSupplierModal.jsx";
import DeactivateSupplierModal from "./Components/DeactivateSupplierModal.jsx";
import ReactivateSupplierModal from "./Components/ReactivateSupplierModal.jsx";

import "../../../../css/products.css";
import "../../../../css/suppliers.css";

export default function Index({ suppliers, filters = {} }) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [status, setStatus] = useState(filters.status ?? "active");

    const [isFiltering, setIsFiltering] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [deactivatingSupplier, setDeactivatingSupplier] = useState(null);
    const [reactivatingSupplier, setReactivatingSupplier] = useState(null);

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

    const closeActionMenu = () => {
        setActionMenu(null);
    };

    const toggleActionMenu = (event, supplier) => {
        if (actionMenu?.supplier.id === supplier.id) {
            closeActionMenu();
            return;
        }

        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();

        actionButtonRef.current = button;

        const menuWidth = 160;
        const menuHeight = supplier.is_active ? 132 : 95;
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
            supplier,
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
        return () => {
            clearTimeout(filterTimerRef.current);
        };
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
            router.cancelAll();
            setIsFiltering(false);
            return;
        }

        setIsFiltering(true);

        filterTimerRef.current = setTimeout(() => {
            closeActionMenu();

            router.get(
                "/inventory/suppliers",
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

    const openViewModal = (supplier) => {
        closeActionMenu();
        setSelectedSupplier(supplier);
    };

    const openEditModal = (supplier) => {
        if (!supplier.is_active) return;

        closeActionMenu();
        setEditingSupplier(supplier);
    };

    const openDeactivateModal = (supplier) => {
        if (!supplier.is_active) return;

        closeActionMenu();
        setDeactivatingSupplier(supplier);
    };

    const openReactivateModal = (supplier) => {
        if (supplier.is_active) return;

        closeActionMenu();
        setReactivatingSupplier(supplier);
    };

    return (
        <InventoryLayout>
            <Head title="Suppliers" />

            <div className="products-page suppliers-page">
                <div className="products-page-header">
                    <div>
                        <h1>Suppliers</h1>

                        <p>
                            Manage suppliers and their contact
                            information.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="products-add-button"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        + Add Supplier
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
                                placeholder="Search suppliers..."
                                value={search}
                                onChange={handleSearchChange}
                                aria-label="Search suppliers"
                            />
                        </div>

                        <div className="products-filter-select products-status-select">
                            <select
                                value={status}
                                onChange={handleStatusChange}
                                aria-label="Filter supplier status"
                            >
                                <option value="active">
                                    Active Suppliers
                                </option>

                                <option value="inactive">
                                    Inactive Suppliers
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
                        <table className="products-table suppliers-table">
                            <thead>
                                <tr>
                                    <th>SUPPLIER</th>
                                    <th>CONTACT PERSON</th>
                                    <th>PHONE</th>
                                    <th>EMAIL</th>
                                    <th>ADDRESS</th>
                                    <th>PRODUCTS</th>
                                    <th>STATUS</th>
                                    <th>ACTIONS</th>
                                </tr>
                            </thead>

                            <tbody>
                                {suppliers.data.length > 0 ? (
                                    suppliers.data.map((supplier) => (
                                        <tr key={supplier.id}>
                                            <td className="products-name">
                                                {supplier.name}
                                            </td>

                                            <td>
                                                {supplier.contact_person || "—"}
                                            </td>

                                            <td className="suppliers-phone">
                                                {supplier.phone || "—"}
                                            </td>

                                            <td className="suppliers-email">
                                                {supplier.email || "—"}
                                            </td>

                                            <td className="suppliers-address">
                                                <span
                                                    className="suppliers-address-text"
                                                    title={supplier.address || ""}
                                                >
                                                    {supplier.address || "—"}
                                                </span>
                                            </td>

                                            <td>
                                                {supplier.products_count ?? 0}
                                            </td>

                                            <td>
                                                {supplier.is_active
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
                                                            supplier
                                                        )
                                                    }
                                                    aria-label={`Actions for ${supplier.name}`}
                                                    aria-haspopup="menu"
                                                    aria-expanded={
                                                        actionMenu?.supplier.id ===
                                                        supplier.id
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
                                            colSpan={8}
                                            className="products-empty"
                                        >
                                            {status === "inactive"
                                                ? "No inactive suppliers found."
                                                : "No suppliers found."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="products-pagination">
                        <span>
                            Showing {suppliers.from ?? 0}–
                            {suppliers.to ?? 0} of{" "}
                            {suppliers.total} suppliers
                        </span>

                        <div className="products-pagination-links">
                            {suppliers.links.map((link, index) =>
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
                        aria-label={`Actions for ${actionMenu.supplier.name}`}
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
                                openViewModal(actionMenu.supplier)
                            }
                        >
                            View
                        </button>

                        {actionMenu.supplier.is_active ? (
                            <>
                                <button
                                    type="button"
                                    className="products-menu-item"
                                    role="menuitem"
                                    onClick={() =>
                                        openEditModal(actionMenu.supplier)
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
                                        openDeactivateModal(
                                            actionMenu.supplier
                                        )
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
                                        openReactivateModal(
                                            actionMenu.supplier
                                        )
                                    }
                                >
                                    Reactivate
                                </button>
                            </>
                        )}
                    </div>,
                    document.body
                )}

            <AddSupplierModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <ViewSupplierModal
                isOpen={selectedSupplier !== null}
                onClose={() => setSelectedSupplier(null)}
                supplier={selectedSupplier}
            />

            <EditSupplierModal
                isOpen={editingSupplier !== null}
                onClose={() => setEditingSupplier(null)}
                supplier={editingSupplier}
            />

            <DeactivateSupplierModal
                isOpen={deactivatingSupplier !== null}
                onClose={() => setDeactivatingSupplier(null)}
                supplier={deactivatingSupplier}
            />

            <ReactivateSupplierModal
                isOpen={reactivatingSupplier !== null}
                onClose={() => setReactivatingSupplier(null)}
                supplier={reactivatingSupplier}
            />
        </InventoryLayout>
    );
}
