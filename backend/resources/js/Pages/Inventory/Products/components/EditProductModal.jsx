import React, { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";

import FormModal from "../../../../components/modals/FormModal.jsx";
import SuccessModal from "../../../../components/modals/SuccessModal.jsx";

export default function EditProductModal({
    isOpen,
    onClose,
    product,
    categories = [],
}) {
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const {
        data,
        setData,
        put,
        processing,
        errors,
        reset,
        clearErrors,
    } = useForm({
        sku: "",
        name: "",
        category_id: "",
        description: "",
        price: "",
        is_active: true,
    });

    // Populate the form when a product is selected.
    useEffect(() => {
        if (!isOpen || !product) return;

        setData({
            sku: product.sku ?? "",
            name: product.name ?? "",
            category_id: product.category_id ?? "",
            description: product.description ?? "",
            price: product.price ?? "",
            is_active: Boolean(product.is_active),
        });

        clearErrors();
    }, [isOpen, product?.id]);

    const handleClose = () => {
        if (processing) return;

        clearErrors();
        reset();
        onClose();
    };

    const handleSubmit = (event) => {
        event?.preventDefault();

        if (!product || processing) return;

        put(`/inventory/products/${product.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                onClose();
                setIsSuccessModalOpen(true);
            },
        });
    };

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
                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Product Information
                        </h3>

                        <p className="sc-form-section-description">
                            Update the details used to identify this product.
                        </p>
                    </div>

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
                            maxLength={255}
                            value={data.name}
                            onChange={(event) =>
                                setData("name", event.target.value)
                            }
                            aria-invalid={Boolean(errors.name)}
                        />

                        {errors.name && (
                            <p className="sc-form-error">{errors.name}</p>
                        )}
                    </div>

                    <div className="sc-form-row">
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
                                onChange={(event) =>
                                    setData("sku", event.target.value)
                                }
                                aria-invalid={Boolean(errors.sku)}
                            />

                            {errors.sku && (
                                <p className="sc-form-error">
                                    {errors.sku}
                                </p>
                            )}
                        </div>

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
                                    setData(
                                        "category_id",
                                        event.target.value
                                    )
                                }
                                aria-invalid={Boolean(errors.category_id)}
                            >
                                <option value="">Uncategorized</option>

                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
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
                            value={data.description}
                            onChange={(event) =>
                                setData(
                                    "description",
                                    event.target.value
                                )
                            }
                            aria-invalid={Boolean(errors.description)}
                        />

                        {errors.description && (
                            <p className="sc-form-error">
                                {errors.description}
                            </p>
                        )}
                    </div>
                </div>

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
                            <span className="sc-form-currency">₱</span>

                            <input
                                id="edit-product-price"
                                type="number"
                                className="sc-form-price-input"
                                min="0"
                                max="99999999.99"
                                step="0.01"
                                value={data.price}
                                onChange={(event) =>
                                    setData("price", event.target.value)
                                }
                                aria-invalid={Boolean(errors.price)}
                            />
                        </div>

                        {errors.price && (
                            <p className="sc-form-error">
                                {errors.price}
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
                                setData(
                                    "is_active",
                                    event.target.value === "1"
                                )
                            }
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
                            Use Stock In or Stock Out to record inventory
                            changes.
                        </p>
                    </div>
                </div>
            </FormModal>

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