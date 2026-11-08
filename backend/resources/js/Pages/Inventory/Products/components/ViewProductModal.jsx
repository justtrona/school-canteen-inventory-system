
import React from "react";

import ViewModal from "../../../../components/modals/ViewModal.jsx";

// ========================================
// UNIT LABELS
// ========================================

const UNIT_LABELS = {
    pcs: "Pieces (pcs)",
    bottle: "Bottle",
    pack: "Pack",
    box: "Box",
    kg: "Kilograms (kg)",
    g: "Grams (g)",
    L: "Liters (L)",
    mL: "Milliliters (mL)",
};

const COUNT_UNITS = ["pcs", "bottle", "pack", "box"];

// ========================================
// FORMAT PRICE
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
// FORMAT QUANTITY
// ========================================

const formatQuantity = (quantity, unit = "pcs") => {
    const value = Number(quantity ?? 0);

    if (!Number.isFinite(value)) {
        return "—";
    }

    return value.toLocaleString("en-PH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: COUNT_UNITS.includes(unit)
            ? 0
            : 3,
    });
};

// ========================================
// GET STOCK STATUS
// ========================================

const getStockStatus = (quantity, reorderLevel) => {
    const stockQuantity = Number(quantity ?? 0);

    const threshold = Number(reorderLevel ?? 0);

    if (stockQuantity <= 0) {
        return {
            label: "Out of Stock",
            className: "sc-view-badge-danger",
        };
    }

    if (threshold > 0 && stockQuantity <= threshold) {
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
// MAIN COMPONENT
// ========================================

export default function ViewProductModal({
    isOpen,
    onClose,
    product,
}) {
    // ========================================
    // PRODUCT DATA
    // ========================================

    const quantity = Number(product?.quantity ?? 0);

    const reorderLevel = Number(
        product?.reorder_level ?? 0
    );

    const unit = product?.unit_of_measure ?? "pcs";

    const unitLabel = UNIT_LABELS[unit] ?? unit;

    const stockStatus = getStockStatus(
        quantity,
        reorderLevel
    );

    const isArchived = Boolean(product?.archived_at);

    const isActive = Boolean(product?.is_active);

    const productStatus = isArchived
        ? {
              label: "Archived",
              className: "sc-view-badge-neutral",
          }
        : isActive
          ? {
                label: "Active",
                className: "sc-view-badge-success",
            }
          : {
                label: "Inactive",
                className: "sc-view-badge-neutral",
            };

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
                        PRICING
                    ======================================== */}

                    <div className="sc-view-section">
                        <h3 className="sc-view-section-title">
                            Pricing
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
                        </div>
                    </div>

                    {/* ========================================
                        INVENTORY INFORMATION
                    ======================================== */}

                    <div className="sc-view-section">
                        <h3 className="sc-view-section-title">
                            Inventory Information
                        </h3>

                        <div className="sc-view-grid">
                            {/* CURRENT STOCK */}

                            <div className="sc-view-item">
                                <span className="sc-view-label">
                                    Current Stock
                                </span>

                                <span className="sc-view-value">
                                    {formatQuantity(quantity, unit)}{" "}
                                    {unit}
                                </span>
                            </div>

                            {/* UNIT OF MEASUREMENT */}

                            <div className="sc-view-item">
                                <span className="sc-view-label">
                                    Unit of Measurement
                                </span>

                                <span className="sc-view-value">
                                    {unitLabel}
                                </span>
                            </div>

                            {/* REORDER LEVEL */}

                            <div className="sc-view-item">
                                <span className="sc-view-label">
                                    Reorder Level
                                </span>

                                <span className="sc-view-value">
                                    {formatQuantity(
                                        reorderLevel,
                                        unit
                                    )}{" "}
                                    {unit}
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
                        </div>
                    </div>

                    {/* ========================================
                        AVAILABILITY
                    ======================================== */}

                    <div className="sc-view-section">
                        <h3 className="sc-view-section-title">
                            Availability
                        </h3>

                        <div className="sc-view-grid">
                            {/* PRODUCT STATUS */}

                            <div className="sc-view-item">
                                <span className="sc-view-label">
                                    Product Status
                                </span>

                                <span
                                    className={
                                        productStatus.className
                                    }
                                >
                                    {productStatus.label}
                                </span>
                            </div>

                            {/* STOCK AVAILABILITY */}

                            <div className="sc-view-item">
                                <span className="sc-view-label">
                                    Available for Sale
                                </span>

                                <span
                                    className={
                                        !isArchived &&
                                        isActive &&
                                        quantity > 0
                                            ? "sc-view-badge-success"
                                            : "sc-view-badge-neutral"
                                    }
                                >
                                    {!isArchived &&
                                    isActive &&
                                    quantity > 0
                                        ? "Yes"
                                        : "No"}
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

                            {/* ARCHIVED DATE */}

                            {isArchived && (
                                <div className="sc-view-item sc-view-item-full">
                                    <span className="sc-view-label">
                                        Date Archived
                                    </span>

                                    <span className="sc-view-value">
                                        {formatDate(
                                            product.archived_at
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </ViewModal>
    );
}
