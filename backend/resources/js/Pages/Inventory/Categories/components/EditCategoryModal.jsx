
import React, { useState } from "react";
import { useForm } from "@inertiajs/react";

import FormModal from "../../../../components/modals/FormModal.jsx";
import SuccessModal from "../../../../components/modals/SuccessModal.jsx";

export default function EditCategoryModal({
    isOpen,
    onClose,
    category,
}) {
    const [isSuccessModalOpen, setIsSuccessModalOpen] =
        useState(false);

    return (
        <>
            {isOpen && category && (
                <EditCategoryForm
                    key={category.id}
                    category={category}
                    onClose={onClose}
                    onSuccess={() => {
                        onClose();
                        setIsSuccessModalOpen(true);
                    }}
                />
            )}

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="Category Updated Successfully!"
                message="The category information and availability have been updated successfully."
                buttonLabel="Done"
            />
        </>
    );
}

function EditCategoryForm({
    category,
    onClose,
    onSuccess,
}) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
        clearErrors,
        reset,
    } = useForm({
        name: category.name ?? "",
        sku_prefix: category.sku_prefix ?? "",
        description: category.description ?? "",
        is_active: Boolean(category.is_active),
    });

    const handleClose = () => {
        if (processing) return;

        reset();
        clearErrors();
        onClose();
    };

    const handleSubmit = (event) => {
        event?.preventDefault();

        if (processing) return;

        put(`/inventory/categories/${category.id}`, {
            preserveScroll: true,
            onSuccess,
        });
    };

    return (
        <FormModal
            isOpen={true}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title="Edit Category"
            description="Update the details and availability of this product category."
            mode="edit"
            size="medium"
            formId="edit-category-form"
            submitLabel="Save Changes"
            isSubmitting={processing}
        >
            <div className="sc-form-section">
                <div className="sc-form-section-header">
                    <h3 className="sc-form-section-title">
                        Category Information
                    </h3>

                    <p className="sc-form-section-description">
                        Manage the basic details used to organize
                        and identify products in this category.
                    </p>
                </div>

                <div className="sc-form-group">
                    <label
                        htmlFor="edit-category-name"
                        className="sc-form-label"
                    >
                        Category Name
                        <span className="sc-form-required">
                            *
                        </span>
                    </label>

                    <input
                        id="edit-category-name"
                        type="text"
                        className="sc-form-input"
                        placeholder="e.g. Drinks"
                        maxLength={255}
                        value={data.name}
                        onChange={(event) =>
                            setData(
                                "name",
                                event.target.value
                            )
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

                <div className="sc-form-group">
                    <label
                        htmlFor="edit-category-sku-prefix"
                        className="sc-form-label"
                    >
                        SKU Prefix
                        <span className="sc-form-required">
                            *
                        </span>
                    </label>

                    <input
                        id="edit-category-sku-prefix"
                        type="text"
                        className="sc-form-input"
                        placeholder="e.g. DRINK"
                        maxLength={20}
                        pattern="[A-Za-z0-9_-]+"
                        value={data.sku_prefix}
                        onChange={(event) =>
                            setData(
                                "sku_prefix",
                                event.target.value.toUpperCase()
                            )
                        }
                        aria-invalid={Boolean(
                            errors.sku_prefix
                        )}
                        required
                    />

                    <p className="sc-form-help">
                        This prefix is used when generating SKUs
                        for new products. Changing it will not
                        update existing product SKUs.
                    </p>

                    {errors.sku_prefix && (
                        <p className="sc-form-error">
                            {errors.sku_prefix}
                        </p>
                    )}
                </div>

                <div className="sc-form-group">
                    <label
                        htmlFor="edit-category-description"
                        className="sc-form-label"
                    >
                        Description
                        <span className="sc-form-optional">
                            Optional
                        </span>
                    </label>

                    <textarea
                        id="edit-category-description"
                        className="sc-form-textarea"
                        rows={2}
                        placeholder="Add a short description..."
                        maxLength={1000}
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

            <div className="sc-form-section">
                <div className="sc-form-section-header">
                    <h3 className="sc-form-section-title">
                        Availability
                    </h3>

                    <p className="sc-form-section-description">
                        Control whether this category is
                        available for product assignment.
                    </p>
                </div>

                <div className="sc-form-group">
                    <label
                        htmlFor="edit-category-status"
                        className="sc-form-label"
                    >
                        Category Status
                        <span className="sc-form-required">
                            *
                        </span>
                    </label>

                    <select
                        id="edit-category-status"
                        className="sc-form-select"
                        value={data.is_active ? "1" : "0"}
                        onChange={(event) =>
                            setData(
                                "is_active",
                                event.target.value === "1"
                            )
                        }
                        aria-invalid={Boolean(
                            errors.is_active
                        )}
                        required
                    >
                        <option value="1">
                            Active
                        </option>

                        <option value="0">
                            Inactive
                        </option>
                    </select>

                    <p className="sc-form-help">
                        {data.is_active
                            ? "Active categories can be assigned to new products."
                            : "Inactive categories cannot be assigned to new products. Categories with current products must be reassigned or archived first."}
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
                        Category Management
                    </p>

                    <p className="sc-form-notice-description">
                        Updating the category name or SKU prefix
                        will not modify existing product SKUs.
                        Changing the status to Inactive is only
                        allowed when the category has no current
                        products assigned.
                    </p>
                </div>
            </div>

            {errors.category && (
                <p className="sc-form-error" role="alert">
                    {errors.category}
                </p>
            )}
        </FormModal>
    );
}
