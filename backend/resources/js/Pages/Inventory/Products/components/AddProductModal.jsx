
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

export default function AddProductModal({
    isOpen,
    onClose,
    categories = [],
}) {
    // ========================================
    // SUCCESS MODAL STATE
    // ========================================

    const [isSuccessModalOpen, setIsSuccessModalOpen] =
        useState(false);

    // ========================================
    // SKU PREVIEW STATE
    // ========================================

    const [displayedSku, setDisplayedSku] = useState("");
    const [isLoadingSku, setIsLoadingSku] = useState(false);
    const [skuError, setSkuError] = useState("");

    // ========================================
    // PRODUCT FORM
    // ========================================

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        name: "",
        category_id: "",
        description: "",
        price: "",
        unit_of_measure: "pcs",
        reorder_level: "0",
        is_active: true,
    });

    // ========================================
    // AUTOMATIC SKU PREVIEW
    // ========================================

    useEffect(() => {
        if (!isOpen || !data.category_id) {
            setDisplayedSku("");
            setIsLoadingSku(false);
            setSkuError("");
            return;
        }

        const controller = new AbortController();

        setDisplayedSku("");
        setIsLoadingSku(true);
        setSkuError("");

        const fetchNextSku = async () => {
            try {
                const response = await fetch(
                    `/inventory/products/next-sku?category_id=${encodeURIComponent(
                        data.category_id
                    )}`,
                    {
                        method: "GET",
                        signal: controller.signal,
                        credentials: "same-origin",
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Unable to generate the next SKU."
                    );
                }

                const result = await response.json();

                if (!controller.signal.aborted) {
                    if (!result.sku) {
                        throw new Error(
                            "No SKU was returned by the server."
                        );
                    }

                    setDisplayedSku(result.sku);
                    setSkuError("");
                }
            } catch (error) {
                if (!controller.signal.aborted) {
                    setDisplayedSku("");
                    setSkuError(error.message);

                    console.error(
                        "SKU preview error:",
                        error
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoadingSku(false);
                }
            }
        };

        fetchNextSku();

        return () => {
            controller.abort();
        };
    }, [isOpen, data.category_id]);

    // ========================================
    // RESET FORM
    // ========================================

    const resetForm = () => {
        reset();
        clearErrors();

        setDisplayedSku("");
        setIsLoadingSku(false);
        setSkuError("");
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
    // SAVE PRODUCT
    // ========================================

    const handleSubmit = (event) => {
        event?.preventDefault();

        if (processing || isLoadingSku || skuError) {
            return;
        }

        const normalizedName = data.name.trim();

        const normalizedPrice = Number(data.price);

        const normalizedReorderLevel = Number(
            data.reorder_level
        );

        if (
            !normalizedName ||
            normalizedName.length < 3 ||
            !data.category_id ||
            data.price === "" ||
            !Number.isFinite(normalizedPrice) ||
            normalizedPrice < 0 ||
            !data.unit_of_measure ||
            data.reorder_level === "" ||
            !Number.isFinite(normalizedReorderLevel) ||
            normalizedReorderLevel < 0 ||
            !Number.isFinite(
                normalizedReorderLevel * 1000
            ) ||
            Math.round(normalizedReorderLevel * 1000) !==
                normalizedReorderLevel * 1000
        ) {
            return;
        }

        post("/inventory/products", {
            preserveScroll: true,

            onSuccess: () => {
                resetForm();
                onClose();
                setIsSuccessModalOpen(true);
            },
        });
    };

    // ========================================
    // SKU DISPLAY TEXT
    // ========================================

    const skuPlaceholder = isLoadingSku
        ? "Generating SKU..."
        : "Select a category";

    const skuHelpText = isLoadingSku
        ? "Checking the next available SKU..."
        : displayedSku
          ? "SKU generated automatically based on the selected category."
          : "Select a category to generate an SKU.";

    // ========================================
    // RENDER
    // ========================================

    return (
        <>
            <FormModal
                isOpen={isOpen}
                onClose={handleClose}
                onSubmit={handleSubmit}
                title="Add Product"
                description="Create a new product in your inventory."
                mode="create"
                size="medium"
                formId="add-product-form"
                submitLabel="Save Product"
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
                            Basic details used to identify this product.
                        </p>
                    </div>

                    {/* PRODUCT NAME */}

                    <div className="sc-form-group">
                        <label
                            htmlFor="product-name"
                            className="sc-form-label"
                        >
                            Product Name
                            <span className="sc-form-required">*</span>
                        </label>

                        <input
                            id="product-name"
                            type="text"
                            className="sc-form-input"
                            placeholder="e.g. Bottled Water 350ml"
                            minLength={3}
                            maxLength={255}
                            value={data.name}
                            onChange={(event) =>
                                setData("name", event.target.value)
                            }
                            aria-invalid={Boolean(errors.name)}
                            required
                        />

                        {errors.name && (
                            <p className="sc-form-error">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* SKU AND CATEGORY */}

                    <div className="sc-form-row">
                        <div className="sc-form-group">
                            <label
                                htmlFor="product-sku"
                                className="sc-form-label"
                            >
                                SKU
                            </label>

                            <input
                                id="product-sku"
                                type="text"
                                className="sc-form-input"
                                placeholder={skuPlaceholder}
                                value={displayedSku}
                                readOnly
                                aria-readonly="true"
                                aria-invalid={Boolean(
                                    skuError || errors.sku
                                )}
                            />

                            {skuError ? (
                                <p className="sc-form-error">
                                    {skuError}
                                </p>
                            ) : (
                                <p className="sc-form-help">
                                    {skuHelpText}
                                </p>
                            )}

                            {errors.sku && (
                                <p className="sc-form-error">
                                    {errors.sku}
                                </p>
                            )}
                        </div>

                        <div className="sc-form-group">
                            <label
                                htmlFor="product-category"
                                className="sc-form-label"
                            >
                                Category
                                <span className="sc-form-required">*</span>
                            </label>

                            <select
                                id="product-category"
                                className="sc-form-select"
                                value={data.category_id}
                                onChange={(event) =>
                                    setData(
                                        "category_id",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(
                                    errors.category_id
                                )}
                                required
                            >
                                <option value="">
                                    Select a category
                                </option>

                                {categories.map((item) => (
                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </option>
                                ))}
                            </select>

                            {errors.category_id && (
                                <p className="sc-form-error">
                                    {errors.category_id}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* DESCRIPTION */}

                    <div className="sc-form-group">
                        <label
                            htmlFor="product-description"
                            className="sc-form-label"
                        >
                            Description

                            <span className="sc-form-optional">
                                Optional
                            </span>
                        </label>

                        <textarea
                            id="product-description"
                            className="sc-form-textarea"
                            rows={2}
                            maxLength={5000}
                            placeholder="Add a short description..."
                            value={data.description}
                            onChange={(event) =>
                                setData(
                                    "description",
                                    event.target.value
                                )
                            }
                            aria-invalid={Boolean(
                                errors.description
                            )}
                        />

                        {errors.description && (
                            <p className="sc-form-error">
                                {errors.description}
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
                            Define how this product will be measured
                            and monitored in your inventory.
                        </p>
                    </div>

                    <div className="sc-form-row">
                        {/* UNIT OF MEASUREMENT */}

                        <div className="sc-form-group">
                            <label
                                htmlFor="product-unit"
                                className="sc-form-label"
                            >
                                Unit of Measurement

                                <span className="sc-form-required">
                                    *
                                </span>
                            </label>

                            <select
                                id="product-unit"
                                className="sc-form-select"
                                value={data.unit_of_measure}
                                onChange={(event) =>
                                    setData(
                                        "unit_of_measure",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(
                                    errors.unit_of_measure
                                )}
                                required
                            >
                                <option value="">
                                    Select a unit
                                </option>

                                {UNIT_OPTIONS.map((unit) => (
                                    <option
                                        key={unit.value}
                                        value={unit.value}
                                    >
                                        {unit.label}
                                    </option>
                                ))}
                            </select>

                            {errors.unit_of_measure && (
                                <p className="sc-form-error">
                                    {errors.unit_of_measure}
                                </p>
                            )}
                        </div>

                        {/* REORDER LEVEL */}

                        <div className="sc-form-group">
                            <label
                                htmlFor="product-reorder-level"
                                className="sc-form-label"
                            >
                                Reorder Level

                                <span className="sc-form-required">
                                    *
                                </span>
                            </label>

                            <input
                                id="product-reorder-level"
                                type="number"
                                className="sc-form-input"
                                placeholder="e.g. 10"
                                min="0"
                                max="999999999.999"
                                step="0.001"
                                value={data.reorder_level}
                                onChange={(event) =>
                                    setData(
                                        "reorder_level",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(
                                    errors.reorder_level
                                )}
                                required
                            />

                            <p className="sc-form-help">
                                Minimum stock quantity before
                                the product needs replenishment.
                            </p>

                            {errors.reorder_level && (
                                <p className="sc-form-error">
                                    {errors.reorder_level}
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
                                Use one consistent unit for each product.
                                For example, use kg for flour or pcs for
                                individually sold snacks. Weight-based
                                products support decimal quantities.
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
                            Set the selling price for this product.
                        </p>
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="product-price"
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
                                id="product-price"
                                type="number"
                                className="sc-form-price-input"
                                placeholder="0.00"
                                min="0"
                                max="99999999.99"
                                step="0.01"
                                value={data.price}
                                onChange={(event) =>
                                    setData(
                                        "price",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(errors.price)}
                                required
                            />
                        </div>

                        {errors.price && (
                            <p className="sc-form-error">
                                {errors.price}
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
                            Control whether this product is available
                            for sale.
                        </p>
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="product-status"
                            className="sc-form-label"
                        >
                            Product Status

                            <span className="sc-form-required">*</span>
                        </label>

                        <select
                            id="product-status"
                            className="sc-form-select"
                            value={data.is_active ? "1" : "0"}
                            onChange={(event) =>
                                setData(
                                    "is_active",
                                    event.target.value === "1"
                                )
                            }
                            aria-invalid={Boolean(errors.is_active)}
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

                        {errors.is_active && (
                            <p className="sc-form-error">
                                {errors.is_active}
                            </p>
                        )}
                    </div>
                </div>

                {/* ========================================
                    STARTING INVENTORY NOTICE
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
                            Starting Inventory: 0{" "}
                            {data.unit_of_measure}
                        </p>

                        <p className="sc-form-notice-description">
                            New products always start with zero stock.
                            Record received quantities separately through
                            the Stock In process.
                        </p>
                    </div>
                </div>
            </FormModal>

            {/* ========================================
                SUCCESS MODAL
            ======================================== */}

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() =>
                    setIsSuccessModalOpen(false)
                }
                title="Product Added Successfully!"
                message="The product has been saved to your inventory and is ready for stock management."
                buttonLabel="Done"
            />
        </>
    );
}
