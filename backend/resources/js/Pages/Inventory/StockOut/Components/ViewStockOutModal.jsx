
import React from "react";

import ViewModal from "../../../../components/modals/ViewModal.jsx";

const COUNT_UNITS = ["pcs", "bottle", "pack", "box"];

// ========================================
// FORMAT QUANTITY
// ========================================

const formatQuantity = (value, unit) =>
    Number(value ?? 0).toLocaleString("en-PH", {
        maximumFractionDigits: COUNT_UNITS.includes(unit) ? 0 : 3,
    });

// ========================================
// FORMAT DATE
// ========================================

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(
        /^\d{4}-\d{2}-\d{2}$/.test(value)
            ? `${value}T12:00:00`
            : value
    );

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

// ========================================
// VIEW STOCK OUT MODAL
// ========================================

export default function ViewStockOutModal({
    isOpen,
    onClose,
    movement,
}) {
    const unit = movement?.product?.unit_of_measure ?? "pcs";

    const releasedQuantity = Math.abs(
        Number(movement?.quantity_change ?? 0)
    );

    const fields = [
        [
            "Transaction ID",
            movement ? `SO-${String(movement.id).padStart(6, "0")}` : "—",
        ],
        [
            "Date Released",
            formatDate(movement?.created_at),
        ],
        [
            "Product",
            movement?.product?.name ?? "—",
        ],
        [
            "SKU",
            movement?.product?.sku ?? "—",
        ],
        [
            "Quantity Released",
            movement
                ? `-${formatQuantity(releasedQuantity, unit)} ${unit}`
                : "—",
        ],
        [
            "Previous Stock",
            movement
                ? `${formatQuantity(movement.quantity_before, unit)} ${unit}`
                : "—",
        ],
        [
            "Stock After Release",
            movement
                ? `${formatQuantity(movement.quantity_after, unit)} ${unit}`
                : "—",
        ],
        [
            "Released By",
            movement?.user?.name ?? "—",
        ],
    ];

    return (
        <ViewModal
            isOpen={isOpen}
            onClose={onClose}
            title="Stock Out Details"
            description="View the details of this inventory release transaction."
            size="medium"
            closeLabel="Close"
        >
            {movement && (
                <>
                    {/* ========================================
                        STOCK OUT INFORMATION
                    ======================================== */}

                    <div className="sc-view-section">
                        <h3 className="sc-view-section-title">
                            Stock Out Information
                        </h3>

                        <div className="sc-view-grid">
                            {fields.map(([label, value]) => (
                                <div
                                    className="sc-view-item"
                                    key={label}
                                >
                                    <span className="sc-view-label">
                                        {label}
                                    </span>

                                    <span className="sc-view-value">
                                        {value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ========================================
                        REASON AND REMARKS
                    ======================================== */}

                    <div className="sc-view-section">
                        <h3 className="sc-view-section-title">
                            Reason & Remarks
                        </h3>

                        {movement.reason ? (
                            <p className="sc-view-description">
                                {movement.reason}
                            </p>
                        ) : (
                            <span className="sc-view-empty">
                                No reason or remarks provided.
                            </span>
                        )}
                    </div>
                </>
            )}
        </ViewModal>
    );
}
