
import React, { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";

import FormModal from "../../../../components/modals/FormModal.jsx";
import SuccessModal from "../../../../components/modals/SuccessModal.jsx";

const UNIT_OPTIONS = [
    { value: "pcs", label: "Pieces (pcs)" },
    { value: "bottle", label: "Bottle" },
    { value: "pack", label: "Pack" },
    { value: "box", label: "Box" },
    { value: "kg", label: "Kilograms (kg)" },
    { value: "g", label: "Grams (g)" },
    { value: "L", label: "Liters (L)" },
    { value: "mL", label: "Milliliters (mL)" },
];

const PRICE_PATTERN = /^\d+(\.\d{1,2})?$/;
const QUANTITY_PATTERN = /^\d+(\.\d{1,3})?$/;

export default function EditProductModal({
    isOpen,
    onClose,
    product,
    categories = [],
}) {
    // ========================================
    // MODAL STATES
    // ========================================

    const [isSuccessModalOpen, setIsSuccessModalOpen] =
        useState(false);

    const [validationErrors, setValidationErrors] =
        useState({});

    // ========================================
    // FORM
    // ========================================

    const {
        data,
        setData,
        put,
        processing,
        errors,
        reset,
        clearErrors,
        transform,
    } = useForm({
        sku: "",
        name: "",
        category_id: "",
        description: "",
        price: "",
        unit_of_measure: "pcs",
        reorder_level: "0",
        is_active: true,
    });

    // ========================================
    // FIELD ERRORS
    // ========================================

    const fieldError = (field) =>
        validationErrors[field] || errors[field];

    const updateField = (field, value) => {
        setData(field, value);

        setValidationErrors((previous) => {
            const next = { ...previous };
            delete next[field];
            return next;
        });

        clearErrors(field);
    };

    // ========================================
    // POPULATE FORM
    // ========================================

    useEffect(() => {
        if (!isOpen || !product) return;

        setData({
            sku: product.sku ?? "",
            name: product.name ?? "",
            category_id: product.category_id
                ? String(product.category_id)
                : "",
            description: product.description ?? "",
            price: String(product.price ?? ""),
            unit_of_measure:
                product.unit_of_measure ?? "pcs",
            reorder_level: String(
                product.reorder_level ?? "0"
            ),
            is_active: Boolean(product.is_active),
        });

        clearErrors();
        setValidationErrors({});
    }, [isOpen, product?.id]);

    // ========================================
    // RESET FORM
    // ========================================

    const resetForm = () => {
        reset();
        clearErrors();
        setValidationErrors({});
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
    // CLIENT-SIDE VALIDATION
    // ========================================

    const validateForm = () => {
        const nextErrors = {};

        const name = data.name.trim();
        const sku = data.sku.trim();
        const description = data.description.trim();
        const price = data.price.trim();
        const reorderLevel = data.reorder_level.trim();

        // PRODUCT NAME

        if (!name) {
            nextErrors.name = "Product name is required.";
        } else if (name.length < 3) {
            nextErrors.name =
                "Product name must have at least 3 characters.";
        } else if (name.length > 255) {
            nextErrors.name =
                "Product name cannot exceed 255 characters.";
        }

        // SKU

        if (!sku) {
            nextErrors.sku = "Product SKU is required.";
        } else if (sku.length > 50) {
            nextErrors.sku =
                "SKU cannot exceed 50 characters.";
        }

        // CATEGORY

        if (
            data.category_id !== "" &&
            !categories.some(
                (category) =>
                    String(category.id) ===
                    String(data.category_id)
            ) &&
            String(product?.category_id ?? "") !==
                String(data.category_id)
        ) {
            nextErrors.category_id =
                "Please select a valid category.";
        }

        // DESCRIPTION

        if (description.length > 5000) {
            nextErrors.description =
                "Description cannot exceed 5000 characters.";
        }

        // SELLING PRICE

        if (!price) {
            nextErrors.price = "Selling price is required.";
        } else if (!PRICE_PATTERN.test(price)) {
            nextErrors.price =
                "Enter a valid price with up to 2 decimal places.";
        } else if (Number(price) > 99999999.99) {
            nextErrors.price =
                "Selling price exceeds the allowed limit.";
        }

        // UNIT OF MEASUREMENT

        if (!data.unit_of_measure) {
            nextErrors.unit_of_measure =
                "Please select a unit of measurement.";
        } else if (
            !UNIT_OPTIONS.some(
                (unit) => unit.value === data.unit_of_measure
            )
        ) {
            nextErrors.unit_of_measure =
                "Please select a valid unit of measurement.";
        }

        // REORDER LEVEL

        if (!reorderLevel) {
            nextErrors.reorder_level =
                "Reorder level is required.";
        } else if (!QUANTITY_PATTERN.test(reorderLevel)) {
            nextErrors.reorder_level =
                "Enter a valid quantity with up to 3 decimal places.";
        } else if (Number(reorderLevel) > 999999999.999) {
            nextErrors.reorder_level =
                "Reorder level exceeds the allowed limit.";
        }

        // PRODUCT STATUS

        if (typeof data.is_active !== "boolean") {
            nextErrors.is_active =
                "Please select a valid product status.";
        }

        setValidationErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    };

    // ========================================
    // UPDATE PRODUCT
    // ========================================

    const handleSubmit = (event) => {
        event?.preventDefault();

        if (!product || processing) return;

        clearErrors();

        if (!validateForm()) return;

        transform((formData) => ({
            ...formData,

            sku: formData.sku.trim(),

            name: formData.name.trim(),

            category_id: formData.category_id || null,

            description:
                formData.description.trim() || null,

            price: formData.price.trim(),

            reorder_level:
                formData.reorder_level.trim(),
        }));

        put(`/inventory/products/${product.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                resetForm();
                onClose();
                setIsSuccessModalOpen(true);
            },
        });
    };

    // ========================================
    // CURRENT CATEGORY FALLBACK
    // ========================================

    const currentCategory = product?.category;

    const currentCategoryMissing =
        product?.category_id &&
        !categories.some(
            (category) =>
                Number(category.id) ===
                Number(product.category_id)
        );

    // ========================================
    // RENDER
    // ========================================

    return (
        <>
            <FormModal
                isOpen={isOpen}
                onClose={handleClose}
                onSubmit={handleSubmit}
                title="Edit Product"
                description="Update the selected product's information."
                mode="edit"
                size="medium"
                formId="edit-product-form"
                submitLabel="Save Changes"
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
                            Update the details used to identify this product.
                        </p>
                    </div>

                    {/* PRODUCT NAME */}

                    <div className="sc-form-group">
                        <label
                            htmlFor="edit-product-name"
                            className="sc-form-label"
                        >
                            Product Name
                            <span className="sc-form-required">*</span>
                        </label>

                        <input
                            id="edit-product-name"
                            type="text"
                            className="sc-form-input"
                            placeholder="e.g. Bottled Water 350ml"
                            minLength={3}
                            maxLength={255}
                            value={data.name}
                            onChange={(event) =>
                                updateField("name", event.target.value)
                            }
                            aria-invalid={Boolean(fieldError("name"))}
                            aria-describedby={
                                fieldError("name")
                                    ? "edit-product-name-error"
                                    : undefined
                            }
                            required
                        />

                        {fieldError("name") && (
                            <p
                                id="edit-product-name-error"
                                className="sc-form-error"
                                role="alert"
                            >
                                {fieldError("name")}
                            </p>
                        )}
                    </div>

                    {/* SKU AND CATEGORY */}

                    <div className="sc-form-row">
                        {/* SKU */}

                        <div className="sc-form-group">
                            <label
                                htmlFor="edit-product-sku"
                                className="sc-form-label"
                            >
                                SKU
                                <span className="sc-form-required">*</span>
                            </label>

                            <input
                                id="edit-product-sku"
                                type="text"
                                className="sc-form-input"
                                maxLength={50}
                                value={data.sku}
                                readOnly
                                aria-readonly="true"
                            />

                            <p className="sc-form-help">
                                Automatically generated product identifier.
                            </p>

                            {fieldError("sku") && (
                                <p className="sc-form-error" role="alert">
                                    {fieldError("sku")}
                                </p>
                            )}
                        </div>

                        {/* CATEGORY */}

                        <div className="sc-form-group">
                            <label
                                htmlFor="edit-product-category"
                                className="sc-form-label"
                            >
                                Category
                            </label>

                            <select
                                id="edit-product-category"
                                className="sc-form-select"
                                value={data.category_id}
                                onChange={(event) =>
                                    updateField(
                                        "category_id",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(
                                    fieldError("category_id")
                                )}
                            >
                                <option value="">
                                    Uncategorized
                                </option>

                                {currentCategoryMissing && (
                                    <option
                                        value={String(product.category_id)}
                                    >
                                        {currentCategory?.name ??
                                            "Current category"}
                                        {" (Inactive)"}
                                    </option>
                                )}

                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={String(category.id)}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            {fieldError("category_id") && (
                                <p className="sc-form-error" role="alert">
                                    {fieldError("category_id")}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* DESCRIPTION */}

                    <div className="sc-form-group">
                        <label
                            htmlFor="edit-product-description"
                            className="sc-form-label"
                        >
                            Description

                            <span className="sc-form-optional">
                                Optional
                            </span>
                        </label>

                        <textarea
                            id="edit-product-description"
                            className="sc-form-textarea"
                            rows={2}
                            maxLength={5000}
                            placeholder="Add a short product description..."
                            value={data.description}
                            onChange={(event) =>
                                updateField(
                                    "description",
                                    event.target.value
                                )
                            }
                            aria-invalid={Boolean(
                                fieldError("description")
                            )}
                        />

                        {fieldError("description") && (
                            <p className="sc-form-error" role="alert">
                                {fieldError("description")}
                            </p>
                        )}
                    </div>
                </div>

                {/* ========================================
                    INVENTORY MEASUREMENT
                ======================================== */}

                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Inventory Measurement
                        </h3>

                        <p className="sc-form-section-description">
                            Define how this product is measured and
                            monitored in your inventory.
                        </p>
                    </div>

                    <div className="sc-form-row">
                        {/* UNIT OF MEASUREMENT */}

                        <div className="sc-form-group">
                            <label
                                htmlFor="edit-product-unit"
                                className="sc-form-label"
                            >
                                Unit of Measurement
                                <span className="sc-form-required">*</span>
                            </label>

                            <select
                                id="edit-product-unit"
                                className="sc-form-select"
                                value={data.unit_of_measure}
                                onChange={(event) =>
                                    updateField(
                                        "unit_of_measure",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(
                                    fieldError("unit_of_measure")
                                )}
                                required
                            >
                                {UNIT_OPTIONS.map((unit) => (
                                    <option
                                        key={unit.value}
                                        value={unit.value}
                                    >
                                        {unit.label}
                                    </option>
                                ))}
                            </select>

                            <p className="sc-form-help">
                                Keep one consistent unit for this product.
                            </p>

                            {fieldError("unit_of_measure") && (
                                <p className="sc-form-error" role="alert">
                                    {fieldError("unit_of_measure")}
                                </p>
                            )}
                        </div>

                        {/* REORDER LEVEL */}

                        <div className="sc-form-group">
                            <label
                                htmlFor="edit-product-reorder-level"
                                className="sc-form-label"
                            >
                                Reorder Level
                                <span className="sc-form-required">*</span>
                            </label>

                            <input
                                id="edit-product-reorder-level"
                                type="number"
                                className="sc-form-input"
                                min="0"
                                max="999999999.999"
                                step="0.001"
                                placeholder="0.000"
                                value={data.reorder_level}
                                onChange={(event) =>
                                    updateField(
                                        "reorder_level",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(
                                    fieldError("reorder_level")
                                )}
                                required
                            />

                            <p className="sc-form-help">
                                Minimum stock quantity before replenishment
                                is needed.
                            </p>

                            {fieldError("reorder_level") && (
                                <p className="sc-form-error" role="alert">
                                    {fieldError("reorder_level")}
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
                                Consistent Inventory Units
                            </p>

                            <p className="sc-form-notice-description">
                                Use one consistent measurement unit for
                                each product. Weight-based and
                                volume-based products support decimal
                                quantities. Products with existing
                                inventory history cannot have their
                                measurement unit changed.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ========================================
                    PRICING
                ======================================== */}

                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Pricing
                        </h3>

                        <p className="sc-form-section-description">
                            Update the selling price for this product.
                        </p>
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="edit-product-price"
                            className="sc-form-label"
                        >
                            Selling Price

                            <span className="sc-form-required">*</span>
                        </label>

                        <div className="sc-form-price">
                            <span className="sc-form-currency">
                                ₱
                            </span>

                            <input
                                id="edit-product-price"
                                type="number"
                                className="sc-form-price-input"
                                placeholder="0.00"
                                min="0"
                                max="99999999.99"
                                step="0.01"
                                value={data.price}
                                onChange={(event) =>
                                    updateField(
                                        "price",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(
                                    fieldError("price")
                                )}
                                required
                            />
                        </div>

                        <p className="sc-form-help">
                            Enter the selling price with up to 2 decimal
                            places.
                        </p>

                        {fieldError("price") && (
                            <p className="sc-form-error" role="alert">
                                {fieldError("price")}
                            </p>
                        )}
                    </div>
                </div>

                {/* ========================================
                    AVAILABILITY
                ======================================== */}

                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Availability
                        </h3>

                        <p className="sc-form-section-description">
                            Control whether this product can be sold.
                        </p>
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="edit-product-status"
                            className="sc-form-label"
                        >
                            Product Status

                            <span className="sc-form-required">*</span>
                        </label>

                        <select
                            id="edit-product-status"
                            className="sc-form-select"
                            value={data.is_active ? "1" : "0"}
                            onChange={(event) =>
                                updateField(
                                    "is_active",
                                    event.target.value === "1"
                                )
                            }
                            aria-invalid={Boolean(
                                fieldError("is_active")
                            )}
                            required
                        >
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>

                        <p className="sc-form-help">
                            {data.is_active
                                ? "Active products can be sold when stock is available."
                                : "Inactive products cannot be sold but remain in inventory records."}
                        </p>

                        {fieldError("is_active") && (
                            <p className="sc-form-error" role="alert">
                                {fieldError("is_active")}
                            </p>
                        )}
                    </div>
                </div>

                {/* ========================================
                    STOCK INFORMATION
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
                            Stock quantity cannot be edited here
                        </p>

                        <p className="sc-form-notice-description">
                            Current stock is managed separately through
                            Stock In and Stock Out. Changes to inventory
                            quantities are recorded in stock movement
                            history to maintain accurate inventory records.
                        </p>
                    </div>
                </div>

                {/* GENERAL SERVER ERRORS */}

                {errors.product && (
                    <p className="sc-form-error" role="alert">
                        {errors.product}
                    </p>
                )}
            </FormModal>

            {/* ========================================
                SUCCESS MODAL
            ======================================== */}

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="Product Updated Successfully!"
                message="The product information has been updated."
                buttonLabel="Done"
            />
        </>
    );
}
