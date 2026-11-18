
import React, { useState } from "react";
import { useForm } from "@inertiajs/react";

import FormModal from "../../../../components/modals/FormModal.jsx";
import SuccessModal from "../../../../components/modals/SuccessModal.jsx";

const COUNT_UNITS = ["pcs", "bottle", "pack", "box"];

const QUANTITY_PATTERN = /^(?:0|[1-9]\d{0,8})(?:\.\d{1,3})?$/;
const COST_PATTERN = /^\d+(?:\.\d{1,2})?$/;

const MAX_UNIT_COST_CENTS = 9999999999;
const MAX_QUANTITY_THOUSANDTHS = 999999999999;

const formatQuantity = (value, unit) =>
    Number(value ?? 0).toLocaleString("en-PH", {
        maximumFractionDigits: COUNT_UNITS.includes(unit) ? 0 : 3,
    });

const formatCurrency = (value) =>
    Number(value ?? 0).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

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

const toCents = (value) => {
    const text = String(value ?? "").trim();

    if (!COST_PATTERN.test(text)) return null;

    const [whole, fraction = ""] = text.split(".");

    const cents =
        Number(whole) * 100 +
        Number(fraction.padEnd(2, "0"));

    return Number.isSafeInteger(cents) &&
        cents >= 0 &&
        cents <= MAX_UNIT_COST_CENTS
        ? cents
        : null;
};

const toThousandths = (value) => {
    const text = String(value ?? "").trim();

    if (!QUANTITY_PATTERN.test(text)) return null;

    const [whole, fraction = ""] = text.split(".");

    const quantity =
        Number(whole) * 1000 +
        Number(fraction.padEnd(3, "0"));

    return Number.isSafeInteger(quantity) &&
        quantity >= 0 &&
        quantity <= MAX_QUANTITY_THOUSANDTHS
        ? quantity
        : null;
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
        unit_cost: "",
        received_at: getToday(),
        notes: "",
    });

    const selectedProduct = products.find(
        (product) =>
            String(product.id) === String(data.product_id)
    );

    const unit = selectedProduct?.unit_of_measure ?? "";

    const activeSuppliers = suppliers.filter(
        (supplier) => Boolean(supplier.is_active)
    );

    const quantityThousandths = toThousandths(
        data.quantity
    );

    const unitCostCents = toCents(data.unit_cost);

    const sellingPriceCents = toCents(
        selectedProduct?.price
    );

    const hasSellingPrice =
        sellingPriceCents !== null;

    const validQuantity =
        quantityThousandths !== null &&
        quantityThousandths > 0 &&
        (
            !COUNT_UNITS.includes(unit) ||
            quantityThousandths % 1000 === 0
        );

    const validUnitCost =
        unitCostCents !== null &&
        unitCostCents > 0;

    const costExceedsSellingPrice =
        Boolean(selectedProduct) &&
        hasSellingPrice &&
        validUnitCost &&
        unitCostCents > sellingPriceCents;

    const pricingWarning = costExceedsSellingPrice
        ? `Unit cost cannot exceed the product selling price of ${formatCurrency(
              sellingPriceCents / 100
          )}. Please update the product selling price first.`
        : "";

    const hasValidCalculation =
        validQuantity && validUnitCost;

    const totalCostCents = hasValidCalculation
        ? Math.round(
              (quantityThousandths * unitCostCents) / 1000
          )
        : 0;

    const totalCost = totalCostCents / 100;

    const fieldError = (name) =>
        localErrors[name] || errors[name] || "";

    const updateField = (name, value) => {
        setData(name, value);

        clearErrors(name);

        setLocalErrors((previous) => {
            const next = { ...previous };
            delete next[name];
            return next;
        });
    };

    const handleProductChange = (event) => {
        const productId = event.target.value;

        setData((previous) => ({
            ...previous,
            product_id: productId,
            quantity: "",
            unit_cost: "",
        }));

        clearErrors(
            "product_id",
            "quantity",
            "unit_cost"
        );

        setLocalErrors((previous) => {
            const next = { ...previous };

            delete next.product_id;
            delete next.quantity;
            delete next.unit_cost;

            return next;
        });
    };

    const resetForm = () => {
        reset();

        setData({
            product_id: "",
            supplier_id: "",
            quantity: "",
            unit_cost: "",
            received_at: getToday(),
            notes: "",
        });

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

        const quantity = String(data.quantity).trim();
        const unitCost = String(data.unit_cost).trim();
        const notes = String(data.notes ?? "").trim();

        if (!selectedProduct) {
            nextErrors.product_id =
                "Please select a product.";
        }

        if (
            data.supplier_id !== "" &&
            !activeSuppliers.some(
                (supplier) =>
                    String(supplier.id) ===
                    String(data.supplier_id)
            )
        ) {
            nextErrors.supplier_id =
                "Please select an active supplier.";
        }

        if (!quantity) {
            nextErrors.quantity =
                "Received quantity is required.";
        } else if (!validQuantity) {
            nextErrors.quantity =
                COUNT_UNITS.includes(unit) &&
                quantityThousandths !== null &&
                quantityThousandths % 1000 !== 0
                    ? `Quantity for ${unit} must be a whole number.`
                    : "Enter a positive quantity with up to 3 decimal places.";
        }

        if (!unitCost) {
            nextErrors.unit_cost =
                "Supplier unit cost is required.";
        } else if (!validUnitCost) {
            nextErrors.unit_cost =
                "Enter a valid unit cost greater than zero, up to ₱99,999,999.99, with at most 2 decimal places.";
        } else if (!hasSellingPrice) {
            nextErrors.unit_cost =
                "The selected product does not have a valid selling price.";
        } else if (costExceedsSellingPrice) {
            nextErrors.unit_cost = pricingWarning;
        }

        if (!data.received_at) {
            nextErrors.received_at =
                "Date received is required.";
        } else if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                data.received_at
            ) ||
            Number.isNaN(
                Date.parse(`${data.received_at}T00:00:00`)
            )
        ) {
            nextErrors.received_at =
                "Please enter a valid receiving date.";
        } else if (data.received_at > getToday()) {
            nextErrors.received_at =
                "Date received cannot be in the future.";
        }

        if (notes.length > 2000) {
            nextErrors.notes =
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
                            <span className="sc-form-required">
                                *
                            </span>
                        </label>

                        <select
                            id="stock-in-product"
                            className="sc-form-select"
                            value={data.product_id}
                            onChange={handleProductChange}
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
                            <p
                                className="sc-form-error"
                                role="alert"
                            >
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
                            <span className="sc-form-optional">
                                Optional
                            </span>
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
                            aria-invalid={Boolean(
                                fieldError("supplier_id")
                            )}
                        >
                            <option value="">
                                No supplier selected
                            </option>

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
                            <p
                                className="sc-form-error"
                                role="alert"
                            >
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
                                <span className="sc-form-required">
                                    *
                                </span>
                            </label>

                            <input
                                id="stock-in-quantity"
                                className="sc-form-input"
                                type="number"
                                min={
                                    COUNT_UNITS.includes(unit)
                                        ? "1"
                                        : "0.001"
                                }
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
                                <p
                                    className="sc-form-error"
                                    role="alert"
                                >
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
                                <span className="sc-form-required">
                                    *
                                </span>
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
                                <p
                                    className="sc-form-error"
                                    role="alert"
                                >
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
                            value={data.notes}
                            onChange={(event) =>
                                updateField(
                                    "notes",
                                    event.target.value
                                )
                            }
                            aria-invalid={Boolean(
                                fieldError("notes")
                            )}
                        />

                        {fieldError("notes") && (
                            <p
                                className="sc-form-error"
                                role="alert"
                            >
                                {fieldError("notes")}
                            </p>
                        )}
                    </div>
                </div>

                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Purchase Cost
                        </h3>

                        <p className="sc-form-section-description">
                            Record the actual supplier purchase cost
                            of this delivery.
                        </p>
                    </div>

                    <div className="sc-form-group">
                        <label
                            className="sc-form-label"
                            htmlFor="stock-in-unit-cost"
                        >
                            Supplier Unit Cost (₱)
                            <span className="sc-form-required">
                                *
                            </span>
                        </label>

                        <input
                            id="stock-in-unit-cost"
                            className="sc-form-input"
                            type="number"
                            min="0.01"
                            max="99999999.99"
                            step="0.01"
                            placeholder="e.g. 10.00"
                            value={data.unit_cost}
                            onChange={(event) =>
                                updateField(
                                    "unit_cost",
                                    event.target.value
                                )
                            }
                            aria-invalid={Boolean(
                                fieldError("unit_cost") ||
                                costExceedsSellingPrice
                            )}
                            aria-describedby={
                                costExceedsSellingPrice
                                    ? "stock-in-pricing-warning"
                                    : undefined
                            }
                            required
                        />

                        <p className="sc-form-help">
                            Enter the supplier's purchase cost
                            per {unit || "unit"}.
                        </p>

                        {selectedProduct && hasSellingPrice && (
                            <p className="sc-form-help">
                                Product Selling Price:{" "}
                                <strong>
                                    {formatCurrency(
                                        sellingPriceCents / 100
                                    )}
                                </strong>
                            </p>
                        )}

                        {costExceedsSellingPrice && (
                            <p
                                id="stock-in-pricing-warning"
                                className="sc-form-error"
                                role="alert"
                                style={{
                                    color: "#dc2626",
                                    fontWeight: 600,
                                }}
                            >
                                {pricingWarning}
                            </p>
                        )}

                        {fieldError("unit_cost") &&
                            fieldError("unit_cost") !==
                                pricingWarning && (
                                <p
                                    className="sc-form-error"
                                    role="alert"
                                >
                                    {fieldError("unit_cost")}
                                </p>
                            )}
                    </div>

                    <div
                        className="sc-form-notice"
                        aria-live="polite"
                    >
                        <div
                            className="sc-form-notice-icon"
                            aria-hidden="true"
                        >
                            ₱
                        </div>

                        <div className="sc-form-notice-content">
                            <p className="sc-form-notice-title">
                                Total Purchase Cost
                            </p>

                            <p className="sc-form-notice-description">
                                {formatCurrency(totalCost)}
                            </p>

                            <p className="sc-form-help">
                                {hasValidCalculation
                                    ? `${formatQuantity(
                                          data.quantity,
                                          unit
                                      )} ${
                                          unit || "units"
                                      } × ${formatCurrency(
                                          unitCostCents / 100
                                      )}`
                                    : "Enter quantity and unit cost to calculate the total."}
                            </p>
                        </div>
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
                            movement record. The supplier purchase
                            cost is recorded for this delivery and
                            will appear automatically in Edit Product.
                            The reference number is generated
                            automatically.
                        </p>
                    </div>
                </div>

                {errors.product && (
                    <p
                        className="sc-form-error"
                        role="alert"
                    >
                        {errors.product}
                    </p>
                )}
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
