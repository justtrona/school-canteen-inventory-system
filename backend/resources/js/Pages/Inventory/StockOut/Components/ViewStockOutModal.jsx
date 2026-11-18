
import React from "react";

import ViewModal from "../../../../components/modals/ViewModal.jsx";

const COUNT_UNITS = ["pcs", "bottle", "pack", "box"];

const REASON_LABELS = [
    "Inventory Correction",
    "Internal Use",
    "Damaged",
    "Expired",
    "Spoiled",
    "Other",
];

// ========================================
// FORMAT QUANTITY
// ========================================

const formatQuantity = (value, unit) => {
    const quantity = Number(value ?? 0);

    if (!Number.isFinite(quantity)) {
        return "0";
    }

    return quantity.toLocaleString("en-PH", {
        maximumFractionDigits: COUNT_UNITS.includes(unit)
            ? 0
            : 3,
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

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Manila",
    });
};

// ========================================
// PARSE REASON AND REMARKS
// ========================================

const parseReasonAndRemarks = (value) => {
    const text = String(value ?? "").trim();

    if (!text) {
        return {
            reason: "—",
            remarks: "No additional remarks provided.",
        };
    }

    const matchedReason = REASON_LABELS.find(
        (label) =>
            text === label ||
            text.startsWith(`${label} - `)
    );

    if (!matchedReason) {
        return {
            reason: text,
            remarks: "No additional remarks provided.",
        };
    }

    const remarks =
        text === matchedReason
            ? ""
            : text.slice(matchedReason.length + 3).trim();

    return {
        reason: matchedReason,
        remarks:
            remarks || "No additional remarks provided.",
    };
};

// ========================================
// VIEW STOCK OUT MODAL
// ========================================

export default function ViewStockOutModal({
    isOpen,
    onClose,
    movement,
}) {
    const unit =
        movement?.product?.unit_of_measure ?? "pcs";

    const releasedQuantity = Math.abs(
        Number(movement?.quantity_change ?? 0)
    );

    const { reason, remarks } = parseReasonAndRemarks(
        movement?.reason
    );

    const fields = [
        [
            "Transaction ID",
            movement
                ? `SO-${String(movement.id).padStart(6, "0")}`
                : "—",
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
                ? `${formatQuantity(
                      movement.quantity_before,
                      unit
                  )} ${unit}`
                : "—",
        ],
        [
            "Stock After Release",
            movement
                ? `${formatQuantity(
                      movement.quantity_after,
                      unit
                  )} ${unit}`
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

                        <div className="sc-view-grid">
                            <div className="sc-view-item">
                                <span className="sc-view-label">
                                    Reason for Stock Out
                                </span>

                                <span className="sc-view-value">
                                    {reason}
                                </span>
                            </div>
                        </div>

                        <div className="sc-view-item">
                            <span className="sc-view-label">
                                Additional Remarks
                            </span>

                            {remarks ===
                            "No additional remarks provided." ? (
                                <span className="sc-view-empty">
                                    {remarks}
                                </span>
                            ) : (
                                <p className="sc-view-description">
                                    {remarks}
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </ViewModal>
    );
}
