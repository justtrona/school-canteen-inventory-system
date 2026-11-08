
import React, { useState } from "react";
import { useForm } from "@inertiajs/react";

import FormModal from "../../../../components/modals/FormModal.jsx";
import SuccessModal from "../../../../components/modals/SuccessModal.jsx";

const COUNT_UNITS = ["pcs", "bottle", "pack", "box"];

const formatQuantity = (value, unit) => {
    return Number(value ?? 0).toLocaleString("en-PH", {
        maximumFractionDigits: COUNT_UNITS.includes(unit) ? 0 : 3,
    });
};

const getToday = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());

    const get = (type) =>
        parts.find((part) => part.type === type)?.value ?? "";

    return `${get("year")}-${get("month")}-${get("day")}`;
};

export default function AddStockInModal({
    isOpen,
    onClose,
    products = [],
    suppliers = [],
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
        supplier_id: "",
        quantity: "",
        received_at: getToday(),
        reason: "",
    });

    const selectedProduct = products.find(
        (product) => String(product.id) === String(data.product_id)
    );

    const unit = selectedProduct?.unit_of_measure ?? "";

    const activeSuppliers = suppliers.filter(
        (supplier) => supplier.is_active
    );

    const fieldError = (name) =>
        localErrors[name] || errors[name];

    const updateField = (name, value) => {
        setData(name, value);
        clearErrors(name);

        setLocalErrors((previous) => {
            const next = { ...previous };
            delete next[name];
            return next;
        });
    };

    const resetForm = () => {
        reset();
        setData("received_at", getToday());
        clearErrors();
        setLocalErrors({});
    };

    const handleClose = () => {
        if (processing) return;

        resetForm();
        onClose();
    };

    const validate = () => {
        const nextErrors = {};
        const quantity = data.quantity.trim();

        if (!selectedProduct) {
            nextErrors.product_id = "Please select a product.";
        }

        if (!data.supplier_id) {
            nextErrors.supplier_id = "Please select a supplier.";
        }

        if (!quantity) {
            nextErrors.quantity = "Received quantity is required.";
        } else if (
            !/^(?:0|[1-9]\d{0,8})(?:\.\d{1,3})?$/.test(quantity) ||
            Number(quantity) <= 0
        ) {
            nextErrors.quantity =
                "Enter a positive quantity with up to 3 decimal places.";
        } else if (
            COUNT_UNITS.includes(unit) &&
            !Number.isInteger(Number(quantity))
        ) {
            nextErrors.quantity =
                `Quantity for ${unit} must be a whole number.`;
        }

        if (!data.received_at) {
            nextErrors.received_at = "Date received is required.";
        } else if (data.received_at > getToday()) {
            nextErrors.received_at =
                "Date received cannot be in the future.";
        }

        if (data.reason.length > 2000) {
            nextErrors.reason =
                "Remarks cannot exceed 2,000 characters.";
        }

        setLocalErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = (event) => {
        event?.preventDefault();

        if (processing || !validate()) return;

        post("/inventory/stock-in", {
            preserveScroll: true,

            onSuccess: () => {
                resetForm();
                onClose();
                setSuccessOpen(true);
            },
        });
    };

    return (
        <>
            <FormModal
                isOpen={isOpen}
                onClose={handleClose}
                onSubmit={handleSubmit}
                title="Add Stock In"
                description="Record products received by the school canteen."
                mode="create"
                size="medium"
                formId="add-stock-in-form"
                submitLabel="Receive Stock"
                isSubmitting={processing}
            >
                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Product Information
                        </h3>

                        <p className="sc-form-section-description">
                            Select the product being received.
                        </p>
                    </div>

                    <div className="sc-form-group">
                        <label
                            className="sc-form-label"
                            htmlFor="stock-in-product"
                        >
                            Product
                            <span className="sc-form-required">*</span>
                        </label>

                        <select
                            id="stock-in-product"
                            className="sc-form-select"
                            value={data.product_id}
                            onChange={(event) => {
                                updateField(
                                    "product_id",
                                    event.target.value
                                );
                                setData((previous) => ({
                                    ...previous,
                                    product_id: event.target.value,
                                    quantity: "",
                                }));
                            }}
                            aria-invalid={Boolean(fieldError("product_id"))}
                            required
                        >
                            <option value="">Select a product</option>

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
                                    Current Stock
                                </p>

                                <p className="sc-form-notice-description">
                                    {formatQuantity(
                                        selectedProduct.quantity,
                                        unit
                                    )}{" "}
                                    {unit}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Delivery Information
                        </h3>

                        <p className="sc-form-section-description">
                            Enter the supplier and receiving details.
                        </p>
                    </div>

                    <div className="sc-form-group">
                        <label
                            className="sc-form-label"
                            htmlFor="stock-in-supplier"
                        >
                            Supplier
                            <span className="sc-form-required">*</span>
                        </label>

                        <select
                            id="stock-in-supplier"
                            className="sc-form-select"
                            value={data.supplier_id}
                            onChange={(event) =>
                                updateField(
                                    "supplier_id",
                                    event.target.value
                                )
                            }
                            aria-invalid={Boolean(fieldError("supplier_id"))}
                            required
                        >
                            <option value="">Select a supplier</option>

                            {activeSuppliers.map((supplier) => (
                                <option
                                    key={supplier.id}
                                    value={supplier.id}
                                >
                                    {supplier.name}
                                </option>
                            ))}
                        </select>

                        {fieldError("supplier_id") && (
                            <p className="sc-form-error">
                                {fieldError("supplier_id")}
                            </p>
                        )}
                    </div>

                    <div className="sc-form-row">
                        <div className="sc-form-group">
                            <label
                                className="sc-form-label"
                                htmlFor="stock-in-quantity"
                            >
                                Quantity Received
                                <span className="sc-form-required">*</span>
                            </label>

                            <input
                                id="stock-in-quantity"
                                className="sc-form-input"
                                type="number"
                                min="0.001"
                                max="999999999.999"
                                step={
                                    COUNT_UNITS.includes(unit)
                                        ? "1"
                                        : "0.001"
                                }
                                placeholder={
                                    COUNT_UNITS.includes(unit)
                                        ? "e.g. 20"
                                        : "e.g. 2.500"
                                }
                                value={data.quantity}
                                onChange={(event) =>
                                    updateField(
                                        "quantity",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(
                                    fieldError("quantity")
                                )}
                                required
                            />

                            <p className="sc-form-help">
                                {unit
                                    ? `Enter the quantity in ${unit}.`
                                    : "Select a product to see its unit."}
                            </p>

                            {fieldError("quantity") && (
                                <p className="sc-form-error">
                                    {fieldError("quantity")}
                                </p>
                            )}
                        </div>

                        <div className="sc-form-group">
                            <label
                                className="sc-form-label"
                                htmlFor="stock-in-date"
                            >
                                Date Received
                                <span className="sc-form-required">*</span>
                            </label>

                            <input
                                id="stock-in-date"
                                className="sc-form-input"
                                type="date"
                                max={getToday()}
                                value={data.received_at}
                                onChange={(event) =>
                                    updateField(
                                        "received_at",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(
                                    fieldError("received_at")
                                )}
                                required
                            />

                            {fieldError("received_at") && (
                                <p className="sc-form-error">
                                    {fieldError("received_at")}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="sc-form-group">
                        <label
                            className="sc-form-label"
                            htmlFor="stock-in-remarks"
                        >
                            Remarks
                            <span className="sc-form-optional">
                                Optional
                            </span>
                        </label>

                        <textarea
                            id="stock-in-remarks"
                            className="sc-form-textarea"
                            rows={3}
                            maxLength={2000}
                            placeholder="e.g. Received 2 sacks of rice, 25 kg each."
                            value={data.reason}
                            onChange={(event) =>
                                updateField(
                                    "reason",
                                    event.target.value
                                )
                            }
                            aria-invalid={Boolean(fieldError("reason"))}
                        />

                        {fieldError("reason") && (
                            <p className="sc-form-error">
                                {fieldError("reason")}
                            </p>
                        )}
                    </div>
                </div>

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
                            Receiving stock increases the product's
                            inventory and creates a permanent stock
                            movement record. The reference number is
                            generated automatically.
                        </p>
                    </div>
                </div>
            </FormModal>

            <SuccessModal
                isOpen={successOpen}
                onClose={() => setSuccessOpen(false)}
                title="Stock Received Successfully!"
                message="The received quantity has been added to inventory and recorded in stock history."
                buttonLabel="Done"
            />
        </>
    );
}
