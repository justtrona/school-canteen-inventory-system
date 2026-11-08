
import React, { useState } from "react";
import { useForm } from "@inertiajs/react";

import FormModal from "../../../../components/modals/FormModal.jsx";
import SuccessModal from "../../../../components/modals/SuccessModal.jsx";

const COUNT_UNITS = ["pcs", "bottle", "pack", "box"];

const REASON_OPTIONS = [
    { value: "damaged", label: "Damaged" },
    { value: "expired", label: "Expired" },
    { value: "spoiled", label: "Spoiled" },
    { value: "internal_use", label: "Internal Use" },
    { value: "inventory_correction", label: "Inventory Correction" },
    { value: "other", label: "Other" },
];

// ========================================
// FORMAT QUANTITY
// ========================================

const formatQuantity = (value, unit) => {
    return Number(value ?? 0).toLocaleString("en-PH", {
        maximumFractionDigits: COUNT_UNITS.includes(unit) ? 0 : 3,
    });
};

// ========================================
// ADD STOCK OUT MODAL
// ========================================

export default function AddStockOutModal({
    isOpen,
    onClose,
    products = [],
}) {
    const [successOpen, setSuccessOpen] = useState(false);
    const [localErrors, setLocalErrors] = useState({});

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        product_id: "",
        quantity: "",
        reason: "",
        remarks: "",
    });

    // ========================================
    // SELECTED PRODUCT
    // ========================================

    const selectedProduct = products.find(
        (product) =>
            String(product.id) === String(data.product_id)
    );

    const unit = selectedProduct?.unit_of_measure ?? "";

    const currentStock = Number(
        selectedProduct?.quantity ?? 0
    );

    const availableStock = Number.isFinite(currentStock)
        ? currentStock
        : 0;

    const isCountUnit = COUNT_UNITS.includes(unit);

    // ========================================
    // FIELD ERRORS
    // ========================================

    const fieldError = (name) =>
        localErrors[name] || errors[name];

    // ========================================
    // UPDATE FIELD
    // ========================================

    const updateField = (name, value) => {
        setData(name, value);
        clearErrors(name);

        setLocalErrors((previous) => {
            const next = { ...previous };
            delete next[name];
            return next;
        });
    };

    // ========================================
    // RESET FORM
    // ========================================

    const resetForm = () => {
        reset();
        clearErrors();
        setLocalErrors({});
    };

    // ========================================
    // CLOSE MODAL
    // ========================================

    const handleClose = () => {
        if (processing) return;

        resetForm();
        onClose();
    };

    // ========================================
    // VALIDATION
    // ========================================

    const validate = () => {
        const nextErrors = {};

        const quantityText = data.quantity.trim();
        const quantity = Number(quantityText);

        if (!selectedProduct) {
            nextErrors.product_id =
                "Please select a product.";
        }

        if (!quantityText) {
            nextErrors.quantity =
                "Released quantity is required.";
        } else if (
            !/^(?:0|[1-9]\d{0,8})(?:\.\d{1,3})?$/.test(
                quantityText
            ) ||
            !Number.isFinite(quantity) ||
            quantity <= 0
        ) {
            nextErrors.quantity =
                "Enter a positive quantity with up to 3 decimal places.";
        } else if (
            isCountUnit &&
            !Number.isInteger(quantity)
        ) {
            nextErrors.quantity =
                `Quantity for ${unit} must be a whole number.`;
        } else if (
            quantity > availableStock
        ) {
            nextErrors.quantity =
                `Insufficient stock. Only ${formatQuantity(
                    availableStock,
                    unit
                )} ${unit} available.`;
        }

        if (!data.reason) {
            nextErrors.reason =
                "Please select a reason for stock removal.";
        } else if (
            !REASON_OPTIONS.some(
                (item) => item.value === data.reason
            )
        ) {
            nextErrors.reason =
                "Please select a valid stock-out reason.";
        }

        if (data.remarks.length > 2000) {
            nextErrors.remarks =
                "Remarks cannot exceed 2,000 characters.";
        }

        setLocalErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    // ========================================
    // SUBMIT STOCK OUT
    // ========================================

    const handleSubmit = (event) => {
        event?.preventDefault();

        if (processing || !validate()) return;

        post("/inventory/stock-out", {
            preserveScroll: true,

            onSuccess: () => {
                resetForm();
                onClose();
                setSuccessOpen(true);
            },
        });
    };

    // ========================================
    // RENDER
    // ========================================

    return (
        <>
            <FormModal
                isOpen={isOpen}
                onClose={handleClose}
                onSubmit={handleSubmit}
                title="Add Stock Out"
                description="Record inventory removed from the school canteen."
                mode="create"
                size="medium"
                formId="add-stock-out-form"
                submitLabel="Release Stock"
                isSubmitting={processing}
            >
                {/* ========================================
                    PRODUCT INFORMATION
                ======================================== */}

                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Product Information
                        </h3>

                        <p className="sc-form-section-description">
                            Select the product being removed from inventory.
                        </p>
                    </div>

                    {/* PRODUCT */}

                    <div className="sc-form-group">
                        <label
                            className="sc-form-label"
                            htmlFor="stock-out-product"
                        >
                            Product
                            <span className="sc-form-required">
                                *
                            </span>
                        </label>

                        <select
                            id="stock-out-product"
                            className="sc-form-select"
                            value={data.product_id}
                            onChange={(event) => {
                                updateField(
                                    "product_id",
                                    event.target.value
                                );

                                setData("quantity", "");

                                setLocalErrors((previous) => {
                                    const next = { ...previous };
                                    delete next.quantity;
                                    return next;
                                });

                                clearErrors("quantity");
                            }}
                            aria-invalid={Boolean(
                                fieldError("product_id")
                            )}
                            required
                        >
                            <option value="">
                                Select a product
                            </option>

                            {products.map((product) => (
                                <option
                                    key={product.id}
                                    value={product.id}
                                >
                                    {product.name} ({product.sku})
                                </option>
                            ))}
                        </select>

                        {fieldError("product_id") && (
                            <p className="sc-form-error">
                                {fieldError("product_id")}
                            </p>
                        )}
                    </div>

                    {/* CURRENT STOCK */}

                    {selectedProduct && (
                        <div className="sc-form-notice">
                            <div
                                className="sc-form-notice-icon"
                                aria-hidden="true"
                            >
                                i
                            </div>

                            <div className="sc-form-notice-content">
                                <p className="sc-form-notice-title">
                                    Available Stock
                                </p>

                                <p className="sc-form-notice-description">
                                    {formatQuantity(
                                        availableStock,
                                        unit
                                    )}{" "}
                                    {unit}
                                </p>
                            </div>
                        </div>
                    )}

                    {selectedProduct && availableStock <= 0 && (
                        <p className="sc-form-error">
                            This product has no available stock to release.
                        </p>
                    )}
                </div>

                {/* ========================================
                    STOCK OUT DETAILS
                ======================================== */}

                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Stock Out Details
                        </h3>

                        <p className="sc-form-section-description">
                            Specify the quantity and reason for removing stock.
                        </p>
                    </div>

                    {/* QUANTITY */}

                    <div className="sc-form-group">
                        <label
                            className="sc-form-label"
                            htmlFor="stock-out-quantity"
                        >
                            Quantity Released
                            <span className="sc-form-required">
                                *
                            </span>
                        </label>

                        <input
                            id="stock-out-quantity"
                            className="sc-form-input"
                            type="number"
                            min={isCountUnit ? "1" : "0.001"}
                            max={availableStock}
                            step={isCountUnit ? "1" : "0.001"}
                            placeholder={
                                isCountUnit
                                    ? "e.g. 5"
                                    : "e.g. 1.500"
                            }
                            value={data.quantity}
                            onChange={(event) =>
                                updateField(
                                    "quantity",
                                    event.target.value
                                )
                            }
                            disabled={
                                !selectedProduct ||
                                availableStock <= 0
                            }
                            aria-invalid={Boolean(
                                fieldError("quantity")
                            )}
                            required
                        />

                        <p className="sc-form-help">
                            {unit
                                ? isCountUnit
                                    ? `Enter a whole number of ${unit}.`
                                    : `Enter the quantity in ${unit}, up to 3 decimal places.`
                                : "Select a product to see its unit."}
                        </p>

                        {fieldError("quantity") && (
                            <p className="sc-form-error">
                                {fieldError("quantity")}
                            </p>
                        )}
                    </div>

                    {/* REASON */}

                    <div className="sc-form-group">
                        <label
                            className="sc-form-label"
                            htmlFor="stock-out-reason"
                        >
                            Reason for Stock Out
                            <span className="sc-form-required">
                                *
                            </span>
                        </label>

                        <select
                            id="stock-out-reason"
                            className="sc-form-select"
                            value={data.reason}
                            onChange={(event) =>
                                updateField(
                                    "reason",
                                    event.target.value
                                )
                            }
                            aria-invalid={Boolean(
                                fieldError("reason")
                            )}
                            required
                        >
                            <option value="">
                                Select a reason
                            </option>

                            {REASON_OPTIONS.map((item) => (
                                <option
                                    key={item.value}
                                    value={item.value}
                                >
                                    {item.label}
                                </option>
                            ))}
                        </select>

                        {fieldError("reason") && (
                            <p className="sc-form-error">
                                {fieldError("reason")}
                            </p>
                        )}
                    </div>

                    {/* REMARKS */}

                    <div className="sc-form-group">
                        <label
                            className="sc-form-label"
                            htmlFor="stock-out-remarks"
                        >
                            Remarks
                            <span className="sc-form-optional">
                                Optional
                            </span>
                        </label>

                        <textarea
                            id="stock-out-remarks"
                            className="sc-form-textarea"
                            rows={3}
                            maxLength={2000}
                            placeholder="Add additional details about this stock removal..."
                            value={data.remarks}
                            onChange={(event) =>
                                updateField(
                                    "remarks",
                                    event.target.value
                                )
                            }
                            aria-invalid={Boolean(
                                fieldError("remarks")
                            )}
                        />

                        {fieldError("remarks") && (
                            <p className="sc-form-error">
                                {fieldError("remarks")}
                            </p>
                        )}
                    </div>
                </div>

                {/* ========================================
                    INVENTORY NOTICE
                ======================================== */}

                <div className="sc-form-notice">
                    <div
                        className="sc-form-notice-icon"
                        aria-hidden="true"
                    >
                        i
                    </div>

                    <div className="sc-form-notice-content">
                        <p className="sc-form-notice-title">
                            Inventory Record
                        </p>

                        <p className="sc-form-notice-description">
                            Releasing stock reduces the product's
                            available inventory and creates a permanent
                            stock movement record. This transaction is
                            intended for non-sales deductions only.
                            Customer purchases should be recorded
                            through Point of Sale.
                        </p>
                    </div>
                </div>
            </FormModal>

            {/* ========================================
                SUCCESS MODAL
            ======================================== */}

            <SuccessModal
                isOpen={successOpen}
                onClose={() => setSuccessOpen(false)}
                title="Stock Released Successfully!"
                message="The released quantity has been deducted from inventory and recorded in stock history."
                buttonLabel="Done"
            />
        </>
    );
}
