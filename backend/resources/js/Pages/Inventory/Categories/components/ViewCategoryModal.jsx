
import React from "react";

import ViewModal from "../../../../components/modals/ViewModal.jsx";

export default function ViewCategoryModal({
    isOpen,
    onClose,
    category,
}) {
    if (!category) return null;

    return (
        <ViewModal
            isOpen={isOpen}
            onClose={onClose}
            title="Category Details"
            description="View the information and current status of this category."
            size="medium"
            closeLabel="Close"
        >
            <div className="sc-form-section">
                <div className="sc-form-section-header">
                    <h3 className="sc-form-section-title">
                        Category Information
                    </h3>

                    <p className="sc-form-section-description">
                        Basic details used to identify and organize
                        products in this category.
                    </p>
                </div>

                <div className="sc-form-group">
                    <label
                        htmlFor="view-category-name"
                        className="sc-form-label"
                    >
                        Category Name
                    </label>

                    <input
                        id="view-category-name"
                        type="text"
                        className="sc-form-input"
                        value={category.name ?? ""}
                        readOnly
                    />
                </div>

                <div className="sc-form-group">
                    <label
                        htmlFor="view-category-sku-prefix"
                        className="sc-form-label"
                    >
                        SKU Prefix
                    </label>

                    <input
                        id="view-category-sku-prefix"
                        type="text"
                        className="sc-form-input"
                        value={category.sku_prefix ?? ""}
                        readOnly
                    />

                    <p className="sc-form-help">
                        Used when generating SKUs for new products
                        assigned to this category.
                    </p>
                </div>

                <div className="sc-form-group">
                    <label
                        htmlFor="view-category-description"
                        className="sc-form-label"
                    >
                        Description
                    </label>

                    <textarea
                        id="view-category-description"
                        className="sc-form-textarea"
                        rows={2}
                        value={
                            category.description ||
                            "No description provided."
                        }
                        readOnly
                    />
                </div>
            </div>

            <div className="sc-form-section">
                <div className="sc-form-section-header">
                    <h3 className="sc-form-section-title">
                        Category Overview
                    </h3>

                    <p className="sc-form-section-description">
                        Product count and category availability.
                    </p>
                </div>

                <div className="sc-form-row">
                    <div className="sc-form-group">
                        <label
                            htmlFor="view-category-products"
                            className="sc-form-label"
                        >
                            Total Products
                        </label>

                        <input
                            id="view-category-products"
                            type="text"
                            className="sc-form-input"
                            value={String(
                                category.products_count ?? 0
                            )}
                            readOnly
                        />
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="view-category-status"
                            className="sc-form-label"
                        >
                            Category Status
                        </label>

                        <input
                            id="view-category-status"
                            type="text"
                            className="sc-form-input"
                            value={
                                category.is_active
                                    ? "Active"
                                    : "Inactive"
                            }
                            readOnly
                        />
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
                        Category Availability
                    </p>

                    <p className="sc-form-notice-description">
                        {category.is_active
                            ? "This category is active and available for product assignment."
                            : "This category is inactive and cannot be assigned to new products until reactivated."}
                    </p>
                </div>
            </div>
        </ViewModal>
    );
}
