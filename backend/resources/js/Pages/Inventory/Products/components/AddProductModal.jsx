
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

const isValidMoney = (value) => {
    const text = String(value);

    if (!/^\d+(?:\.\d{1,2})?$/.test(text)) {
        return false;
    }

    const amount = Number(text);

    return (
        Number.isFinite(amount) &&
        amount >= 0 &&
        amount <= 99999999.99
    );
};

export default function AddProductModal({
    isOpen,
    onClose,
    categories = [],
}) {
    const [isSuccessModalOpen, setIsSuccessModalOpen] =
        useState(false);

    const [displayedSku, setDisplayedSku] = useState("");
    const [isLoadingSku, setIsLoadingSku] = useState(false);
    const [skuError, setSkuError] = useState("");
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
        name: "",
        category_id: "",
        description: "",
        price: "",
        unit_of_measure: "pcs",
        reorder_level: "0",
        is_active: true,
    });

    const sellingPriceValid = isValidMoney(data.price);

    const getError = (field) =>
        localErrors[field] || errors[field] || "";

    const updateField = (field, value) => {
        setData(field, value);

        setLocalErrors((previous) => {
            if (!previous[field]) {
                return previous;
            }

            const next = { ...previous };
            delete next[field];

            return next;
        });

        if (errors[field]) {
            clearErrors(field);
        }
    };

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

    const resetForm = () => {
        reset();
        clearErrors();
        setLocalErrors({});
        setDisplayedSku("");
        setIsLoadingSku(false);
        setSkuError("");
    };

    const handleClose = () => {
        if (processing) return;

        resetForm();
        onClose();
    };

    const handleSubmit = (event) => {
        event?.preventDefault();

        if (processing || isLoadingSku || skuError) {
            return;
        }

        const nextErrors = {};
        const normalizedName = data.name.trim();
        const normalizedReorderLevel = Number(
            data.reorder_level
        );

        if (
            normalizedName.length < 3 ||
            normalizedName.length > 255
        ) {
            nextErrors.name =
                "Product name must have between 3 and 255 characters.";
        }

        if (!data.category_id) {
            nextErrors.category_id =
                "Please select a product category.";
        }

        if (!sellingPriceValid) {
            nextErrors.price =
                "Enter a valid selling price with up to 2 decimal places.";
        }

        if (!data.unit_of_measure) {
            nextErrors.unit_of_measure =
                "Please select a unit of measurement.";
        }

        if (
            data.reorder_level === "" ||
            !/^\d+(?:\.\d{1,3})?$/.test(
                String(data.reorder_level)
            ) ||
            !Number.isFinite(normalizedReorderLevel) ||
            normalizedReorderLevel < 0 ||
            normalizedReorderLevel > 999999999.999
        ) {
            nextErrors.reorder_level =
                "Enter a valid reorder level with up to 3 decimal places.";
        }

        if (Object.keys(nextErrors).length > 0) {
            setLocalErrors(nextErrors);
            return;
        }

        setLocalErrors({});

        post("/inventory/products", {
            preserveScroll: true,
            onSuccess: () => {
                resetForm();
                onClose();
                setIsSuccessModalOpen(true);
            },
        });
    };

    const skuPlaceholder = isLoadingSku
        ? "Generating SKU..."
        : "Select a category";

    const skuHelpText = isLoadingSku
        ? "Checking the next available SKU..."
        : displayedSku
          ? "SKU generated automatically based on the selected category."
          : "Select a category to generate an SKU.";

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
                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Product Information
                        </h3>

                        <p className="sc-form-section-description">
                            Basic details used to identify this product.
                        </p>
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="product-name"
                            className="sc-form-label"
                        >
                            Product Name
                            <span className="sc-form-required">
                                *
                            </span>
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
                                updateField(
                                    "name",
                                    event.target.value
                                )
                            }
                            aria-invalid={Boolean(
                                getError("name")
                            )}
                            required
                        />

                        {getError("name") && (
                            <p className="sc-form-error">
                                {getError("name")}
                            </p>
                        )}
                    </div>

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
                                <span className="sc-form-required">
                                    *
                                </span>
                            </label>

                            <select
                                id="product-category"
                                className="sc-form-select"
                                value={data.category_id}
                                onChange={(event) =>
                                    updateField(
                                        "category_id",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(
                                    getError("category_id")
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

                            {getError("category_id") && (
                                <p className="sc-form-error">
                                    {getError("category_id")}
                                </p>
                            )}
                        </div>
                    </div>

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
                                updateField(
                                    "description",
                                    event.target.value
                                )
                            }
                            aria-invalid={Boolean(
                                getError("description")
                            )}
                        />

                        {getError("description") && (
                            <p className="sc-form-error">
                                {getError("description")}
                            </p>
                        )}
                    </div>
                </div>

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
                                    updateField(
                                        "unit_of_measure",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(
                                    getError("unit_of_measure")
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

                            {getError("unit_of_measure") && (
                                <p className="sc-form-error">
                                    {getError("unit_of_measure")}
                                </p>
                            )}
                        </div>

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
                                    updateField(
                                        "reorder_level",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(
                                    getError("reorder_level")
                                )}
                                required
                            />

                            <p className="sc-form-help">
                                Minimum stock quantity before the
                                product needs replenishment.
                            </p>

                            {getError("reorder_level") && (
                                <p className="sc-form-error">
                                    {getError("reorder_level")}
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
                                Use one consistent unit for each
                                product. For example, use kg for flour
                                or pcs for individually sold snacks.
                                Weight-based products support decimal
                                quantities.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Pricing
                        </h3>

                        <p className="sc-form-section-description">
                            Set the product selling price. Supplier
                            purchase cost will be recorded
                            automatically from Stock In.
                        </p>
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="product-purchase-cost"
                            className="sc-form-label"
                        >
                            Supplier Purchase Cost
                        </label>

                        <div className="sc-form-price">
                            <span className="sc-form-currency">
                                ₱
                            </span>

                            <input
                                id="product-purchase-cost"
                                type="text"
                                className="sc-form-price-input"
                                value="Not yet recorded"
                                readOnly
                                aria-readonly="true"
                                title="Purchase cost is recorded through Stock In."
                                style={{
                                    cursor: "not-allowed",
                                    color: "#64748b",
                                    backgroundColor: "#f8fafc",
                                }}
                            />
                        </div>

                        <p className="sc-form-help">
                            This value is automatically determined
                            from supplier delivery costs recorded
                            during Stock In. It cannot be edited
                            when adding a product.
                        </p>
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="product-price"
                            className="sc-form-label"
                        >
                            Selling Price
                            <span className="sc-form-required">
                                *
                            </span>
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
                                    updateField(
                                        "price",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(
                                    getError("price")
                                )}
                                required
                            />
                        </div>

                        <p className="sc-form-help">
                            Enter the selling price for this product.
                            Once a supplier cost is recorded,
                            selling-price validation will use
                            the recorded purchase cost.
                        </p>

                        {getError("price") && (
                            <p
                                className="sc-form-error"
                                role="alert"
                            >
                                {getError("price")}
                            </p>
                        )}
                    </div>
                </div>

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
                            <span className="sc-form-required">
                                *
                            </span>
                        </label>

                        <select
                            id="product-status"
                            className="sc-form-select"
                            value={data.is_active ? "1" : "0"}
                            onChange={(event) =>
                                updateField(
                                    "is_active",
                                    event.target.value === "1"
                                )
                            }
                            aria-invalid={Boolean(
                                getError("is_active")
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

                        {getError("is_active") && (
                            <p className="sc-form-error">
                                {getError("is_active")}
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
                            Starting Inventory: 0{" "}
                            {data.unit_of_measure}
                        </p>

                        <p className="sc-form-notice-description">
                            New products always start with zero stock.
                            Record received quantities and supplier
                            purchase costs separately through the
                            Stock In process.
                        </p>
                    </div>
                </div>
            </FormModal>

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() =>
                    setIsSuccessModalOpen(false)
                }
                title="Product Added Successfully!"
                message="The product has been saved to your inventory. Supplier purchase cost will be available after Stock In."
                buttonLabel="Done"
            />
        </>
    );
}
