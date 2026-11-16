
import React from "react";

import ViewModal from "../../../../components/modals/ViewModal.jsx";

const COUNT_UNITS = ["pcs", "bottle", "pack", "box"];

// ========================================
// FORMAT QUANTITY
// ========================================

const formatQuantity = (value, unit) => {
    const number = Number(value ?? 0);

    if (!Number.isFinite(number)) return "—";

    return number.toLocaleString("en-PH", {
        maximumFractionDigits: COUNT_UNITS.includes(unit) ? 0 : 3,
    });
};

// ========================================
// FORMAT CURRENCY
// ========================================

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const number = Number(value);

    if (!Number.isFinite(number)) return "—";

    return number.toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

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

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

// ========================================
// VIEW STOCK IN MODAL
// ========================================

export default function ViewStockInModal({
    isOpen,
    onClose,
    movement,
}) {
    const receipt = movement?.stock_in_receipt;

    const unit = movement?.product?.unit_of_measure ?? "pcs";

    // ========================================
    // RECEIVING INFORMATION
    // ========================================

    const receivingFields = [
        [
            "Reference Number",
            receipt?.reference_number ?? "—",
        ],
        [
            "Date Received",
            formatDate(
                receipt?.received_at ?? movement?.created_at
            ),
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
                ? `+${formatQuantity(
                      movement.quantity_change,
                      unit
                  )} ${unit}`
                : "—",
        ],
        [
            "Previous Stock",
            movement
                ? `${formatQuantity(
                      movement.quantity_before,
                      unit
                  )} ${unit}`
                : "—",
        ],
        [
            "Stock After Receiving",
            movement
                ? `${formatQuantity(
                      movement.quantity_after,
                      unit
                  )} ${unit}`
                : "—",
        ],
        [
            "Received By",
            movement?.user?.name ?? "—",
        ],
    ];

    // ========================================
    // PURCHASE COST INFORMATION
    // ========================================

    const purchaseCostFields = [
        [
            "Unit Cost",
            formatCurrency(receipt?.unit_cost),
        ],
        [
            "Total Purchase Cost",
            formatCurrency(receipt?.total_cost),
        ],
    ];

    // ========================================
    // RENDER
    // ========================================

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
                    {/* RECEIVING INFORMATION */}

                    <div className="sc-view-section">
                        <h3 className="sc-view-section-title">
                            Receiving Information
                        </h3>

                        <div className="sc-view-grid">
                            {receivingFields.map(([label, value]) => (
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

                    {/* PURCHASE COST */}

                    <div className="sc-view-section">
                        <h3 className="sc-view-section-title">
                            Purchase Cost
                        </h3>

                        <div className="sc-view-grid">
                            {purchaseCostFields.map(([label, value]) => (
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

                    {/* REMARKS */}

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
