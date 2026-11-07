
import React, { useState } from "react";
import { useForm } from "@inertiajs/react";

import FormModal from "../../../../components/modals/FormModal.jsx";
import SuccessModal from "../../../../components/modals/SuccessModal.jsx";

export default function AddCategoryModal({
    isOpen,
    onClose,
}) {
    const [isSuccessModalOpen, setIsSuccessModalOpen] =
        useState(false);

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
        sku_prefix: "",
        description: "",
        is_active: true,
    });

    const resetForm = () => {
        reset();
        clearErrors();
    };

    const handleClose = () => {
        if (processing) return;

        resetForm();
        onClose();
    };

    const handleSubmit = (event) => {
        event?.preventDefault();

        if (processing) return;

        post("/inventory/categories", {
            preserveScroll: true,

            onSuccess: () => {
                resetForm();
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
                title="Add Category"
                description="Create a new category to organize your products."
                mode="create"
                size="medium"
                formId="add-category-form"
                submitLabel="Save Category"
                isSubmitting={processing}
            >
                <div className="sc-form-section">
                    <div className="sc-form-section-header">
                        <h3 className="sc-form-section-title">
                            Category Information
                        </h3>

                        <p className="sc-form-section-description">
                            Basic details used to organize and
                            identify products in this category.
                        </p>
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="category-name"
                            className="sc-form-label"
                        >
                            Category Name
                            <span className="sc-form-required">
                                *
                            </span>
                        </label>

                        <input
                            id="category-name"
                            type="text"
                            className="sc-form-input"
                            placeholder="e.g. Snacks"
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
                            htmlFor="category-sku-prefix"
                            className="sc-form-label"
                        >
                            SKU Prefix
                            <span className="sc-form-required">
                                *
                            </span>
                        </label>

                        <input
                            id="category-sku-prefix"
                            type="text"
                            className="sc-form-input"
                            placeholder="e.g. SNK"
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
                            Used to generate product SKUs
                            automatically based on the selected
                            category.
                        </p>

                        {errors.sku_prefix && (
                            <p className="sc-form-error">
                                {errors.sku_prefix}
                            </p>
                        )}
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="category-description"
                            className="sc-form-label"
                        >
                            Description
                            <span className="sc-form-optional">
                                Optional
                            </span>
                        </label>

                        <textarea
                            id="category-description"
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
                            htmlFor="category-status"
                            className="sc-form-label"
                        >
                            Category Status
                            <span className="sc-form-required">
                                *
                            </span>
                        </label>

                        <select
                            id="category-status"
                            className="sc-form-select"
                            value={
                                data.is_active ? "1" : "0"
                            }
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
                                : "Inactive categories remain in the system but cannot be assigned to new products until reactivated."}
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
                            Categories are preserved in inventory
                            records regardless of their status.
                            You can reactivate inactive categories
                            when needed.
                        </p>
                    </div>
                </div>
            </FormModal>

            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() =>
                    setIsSuccessModalOpen(false)
                }
                title="Category Added Successfully!"
                message="The category has been saved successfully. Its availability is based on the selected status."
                buttonLabel="Done"
            />
        </>
    );
}
