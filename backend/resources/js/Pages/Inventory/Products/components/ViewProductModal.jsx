import React from "react";

import ViewModal from "../../../../components/modals/ViewModal.jsx";

export default function ViewProductModal({
    isOpen,
    onClose,
    product,
}) {
    // ========================================
    // FORMAT PRICE
    // ========================================

    const formatPrice = (price) => {
        return Number(price ?? 0).toLocaleString("en-PH", {
            style: "currency",
            currency: "PHP",
        });
    };

    // ========================================
    // FORMAT DATE
    // ========================================

    const formatDate = (date) => {
        if (!date) return "—";

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleString("en-PH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    // ========================================
    // GET STOCK STATUS
    // ========================================

    const getStockStatus = (quantity) => {
        const stockQuantity = Number(quantity ?? 0);

        if (stockQuantity <= 0) {
            return {
                label: "Out of Stock",
                className: "sc-view-badge-danger",
            };
        }

        if (stockQuantity <= 10) {
            return {
                label: "Low Stock",
                className: "sc-view-badge-warning",
            };
        }

        return {
            label: "In Stock",
            className: "sc-view-badge-success",
        };
    };

    // ========================================
    // PRODUCT DATA
    // ========================================

    const quantity = Number(product?.quantity ?? 0);

    const stockStatus = getStockStatus(quantity);

    const isActive = Boolean(product?.is_active);

    // ========================================
    // RENDER
    // ========================================

    return (
        <ViewModal
            isOpen={isOpen}
            onClose={onClose}
            title="Product Details"
            description="View product information and current inventory status."
            size="medium"
            closeLabel="Close"
        >
            {product && (
                <>
                    {/* ========================================
                        PRODUCT INFORMATION
                    ======================================== */}

                    <div className="sc-view-section">
                        <h3 className="sc-view-section-title">
                            Product Information
                        </h3>

                        <div className="sc-view-grid">
                            {/* PRODUCT NAME */}

                            <div className="sc-view-item sc-view-item-full">
                                <span className="sc-view-label">
                                    Product Name
                                </span>

                                <span className="sc-view-value">
                                    {product.name}
                                </span>
                            </div>

                            {/* SKU */}

                            <div className="sc-view-item">
                                <span className="sc-view-label">
                                    SKU
                                </span>

                                <span className="sc-view-value">
                                    {product.sku}
                                </span>
                            </div>

                            {/* CATEGORY */}

                            <div className="sc-view-item">
                                <span className="sc-view-label">
                                    Category
                                </span>

                                <span className="sc-view-value">
                                    {product.category?.name ??
                                        "Uncategorized"}
                                </span>
                            </div>

                            {/* DESCRIPTION */}

                            <div className="sc-view-item sc-view-item-full">
                                <span className="sc-view-label">
                                    Description
                                </span>

                                {product.description ? (
                                    <p className="sc-view-description">
                                        {product.description}
                                    </p>
                                ) : (
                                    <span className="sc-view-empty">
                                        No description provided.
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ========================================
                        PRICING AND INVENTORY
                    ======================================== */}

                    <div className="sc-view-section">
                        <h3 className="sc-view-section-title">
                            Pricing & Inventory
                        </h3>

                        <div className="sc-view-grid">
                            {/* SELLING PRICE */}

                            <div className="sc-view-item">
                                <span className="sc-view-label">
                                    Selling Price
                                </span>

                                <span className="sc-view-value">
                                    {formatPrice(product.price)}
                                </span>
                            </div>

                            {/* CURRENT QUANTITY */}

                            <div className="sc-view-item">
                                <span className="sc-view-label">
                                    Current Quantity
                                </span>

                                <span className="sc-view-value">
                                    {quantity.toLocaleString("en-PH")}{" "}
                                    {quantity === 1 ? "unit" : "units"}
                                </span>
                            </div>

                            {/* STOCK STATUS */}

                            <div className="sc-view-item">
                                <span className="sc-view-label">
                                    Stock Status
                                </span>

                                <span
                                    className={stockStatus.className}
                                >
                                    {stockStatus.label}
                                </span>
                            </div>

                            {/* PRODUCT STATUS */}

                            <div className="sc-view-item">
                                <span className="sc-view-label">
                                    Product Status
                                </span>

                                <span
                                    className={
                                        isActive
                                            ? "sc-view-badge-success"
                                            : "sc-view-badge-neutral"
                                    }
                                >
                                    {isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ========================================
                        RECORD DETAILS
                    ======================================== */}

                    <div className="sc-view-section">
                        <h3 className="sc-view-section-title">
                            Record Details
                        </h3>

                        <div className="sc-view-grid">
                            {/* DATE CREATED */}

                            <div className="sc-view-item">
                                <span className="sc-view-label">
                                    Date Created
                                </span>

                                <span className="sc-view-value">
                                    {formatDate(product.created_at)}
                                </span>
                            </div>

                            {/* LAST UPDATED */}

                            <div className="sc-view-item">
                                <span className="sc-view-label">
                                    Last Updated
                                </span>

                                <span className="sc-view-value">
                                    {formatDate(product.updated_at)}
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </ViewModal>
    );
}