import React from "react";

import ViewModal from "../../../../components/modals/ViewModal.jsx";

const COUNT_UNITS = ["pcs", "bottle", "pack", "box"];

const formatQuantity = (value, unit) => {
    return Number(value ?? 0).toLocaleString("en-PH", {
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

    return date.toLocaleString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

export default function ViewStockHistoryModal({
    isOpen,
    onClose,
    movement,
}) {
    if (!movement) {
        return (
            <ViewModal
                isOpen={isOpen}
                onClose={onClose}
                title="Stock Movement Details"
                description="View inventory transaction details."
                size="medium"
                closeLabel="Close"
            />
        );
    }

    const receipt = movement.stock_in_receipt;
    const product = movement.product;

    const unit = product?.unit_of_measure ?? "pcs";

    const isStockIn = movement.type === "stock_in";

    const quantity = Math.abs(
        Number(movement.quantity_change ?? 0)
    );

    const reference = isStockIn
        ? receipt?.reference_number ?? `SI-${String(movement.id).padStart(6, "0")}`
        : `SO-${String(movement.id).padStart(6, "0")}`;

    const movementDetails = [
        ["Reference Number", reference],
        ["Movement Type", isStockIn ? "Stock In" : "Stock Out"],
        [
            "Transaction Date",
            isStockIn
                ? formatDate(receipt?.received_at ?? movement.created_at)
                : formatDate(movement.created_at),
        ],
        ["Product", product?.name ?? "Unknown Product"],
        ["SKU", product?.sku ?? "—"],
        ["Category Unit", unit],
    ];

    const quantityDetails = [
        [
            "Quantity Received / Released",
            `${isStockIn ? "+" : "-"}${formatQuantity(quantity, unit)} ${unit}`,
        ],
        [
            "Previous Stock",
            `${formatQuantity(movement.quantity_before, unit)} ${unit}`,
        ],
        [
            "Remaining Stock",
            `${formatQuantity(movement.quantity_after, unit)} ${unit}`,
        ],
    ];

    return (
        <ViewModal
            isOpen={isOpen}
            onClose={onClose}
            title="Stock Movement Details"
            description="View the complete record of this inventory transaction."
            size="medium"
            closeLabel="Close"
        >
            {/* TRANSACTION INFORMATION */}

            <div className="sc-view-section">
                <h3 className="sc-view-section-title">
                    Transaction Information
                </h3>

                <div className="sc-view-grid">
                    {movementDetails.map(([label, value]) => (
                        <div className="sc-view-item" key={label}>
                            <span className="sc-view-label">
                                {label}
                            </span>

                            <span className="sc-view-value">
                                {value}
                            </span>
                        </div>
                    ))}

                    <div className="sc-view-item">
                        <span className="sc-view-label">
                            Movement Status
                        </span>

                        <span
                            className={
                                isStockIn
                                    ? "sc-view-badge-success"
                                    : "sc-view-badge-warning"
                            }
                        >
                            {isStockIn ? "Stock Received" : "Stock Released"}
                        </span>
                    </div>
                </div>
            </div>

            {/* QUANTITY DETAILS */}

            <div className="sc-view-section">
                <h3 className="sc-view-section-title">
                    Inventory Changes
                </h3>

                <div className="sc-view-grid">
                    {quantityDetails.map(([label, value]) => (
                        <div className="sc-view-item" key={label}>
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

            {/* SUPPLIER INFORMATION */}

            {isStockIn && (
                <div className="sc-view-section">
                    <h3 className="sc-view-section-title">
                        Supplier Information
                    </h3>

                    <div className="sc-view-grid">
                        <div className="sc-view-item">
                            <span className="sc-view-label">
                                Supplier
                            </span>

                            <span className="sc-view-value">
                                {receipt?.supplier?.name ?? "—"}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* REMARKS */}

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
                        No remarks provided.
                    </span>
                )}
            </div>

            {/* USER INFORMATION */}

            <div className="sc-view-section">
                <h3 className="sc-view-section-title">
                    Record Details
                </h3>

                <div className="sc-view-grid">
                    <div className="sc-view-item">
                        <span className="sc-view-label">
                            Recorded By
                        </span>

                        <span className="sc-view-value">
                            {movement.user?.name ?? "—"}
                        </span>
                    </div>

                    <div className="sc-view-item">
                        <span className="sc-view-label">
                            Date Recorded
                        </span>

                        <span className="sc-view-value">
                            {formatDate(movement.created_at)}
                        </span>
                    </div>
                </div>
            </div>
        </ViewModal>
    );
}