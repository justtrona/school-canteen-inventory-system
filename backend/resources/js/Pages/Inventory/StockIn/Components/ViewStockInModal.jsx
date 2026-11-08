
import React from "react";

import ViewModal from "../../../../components/modals/ViewModal.jsx";

const COUNT_UNITS = ["pcs", "bottle", "pack", "box"];

const formatQuantity = (value, unit) =>
    Number(value ?? 0).toLocaleString("en-PH", {
        maximumFractionDigits: COUNT_UNITS.includes(unit) ? 0 : 3,
    });

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
        month: "long",
        day: "numeric",
    });
};

export default function ViewStockInModal({
    isOpen,
    onClose,
    movement,
}) {
    const receipt = movement?.stock_in_receipt;
    const unit = movement?.product?.unit_of_measure ?? "pcs";

    const fields = [
        [
            "Reference Number",
            receipt?.reference_number ?? "—",
        ],
        [
            "Date Received",
            formatDate(receipt?.received_at ?? movement?.created_at),
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
            "Supplier",
            receipt?.supplier?.name ?? "—",
        ],
        [
            "Quantity Received",
            movement
                ? `+${formatQuantity(movement.quantity_change, unit)} ${unit}`
                : "—",
        ],
        [
            "Previous Stock",
            movement
                ? `${formatQuantity(movement.quantity_before, unit)} ${unit}`
                : "—",
        ],
        [
            "Stock After Receiving",
            movement
                ? `${formatQuantity(movement.quantity_after, unit)} ${unit}`
                : "—",
        ],
        [
            "Received By",
            movement?.user?.name ?? "—",
        ],
    ];

    return (
        <ViewModal
            isOpen={isOpen}
            onClose={onClose}
            title="Stock In Details"
            description="View the details of this receiving transaction."
            size="medium"
            closeLabel="Close"
        >
            {movement && (
                <>
                    <div className="sc-view-section">
                        <h3 className="sc-view-section-title">
                            Receiving Information
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

                    <div className="sc-view-section">
                        <h3 className="sc-view-section-title">
                            Remarks
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
                </>
            )}
        </ViewModal>
    );
}
