
import React from "react";

import ViewModal from "../../../../components/modals/ViewModal.jsx";

export default function ViewSupplierModal({
    isOpen,
    onClose,
    supplier,
}) {
    if (!supplier) return null;

    return (
        <ViewModal
            isOpen={isOpen}
            onClose={onClose}
            title="Supplier Details"
            description="View the information and current status of this supplier."
            size="medium"
            closeLabel="Close"
        >
            <div className="sc-form-section">
                <div className="sc-form-section-header">
                    <h3 className="sc-form-section-title">
                        Supplier Information
                    </h3>

                    <p className="sc-form-section-description">
                        Basic information about this supplier.
                    </p>
                </div>

                <div className="sc-form-group">
                    <label
                        htmlFor="view-supplier-name"
                        className="sc-form-label"
                    >
                        Supplier Name
                    </label>

                    <input
                        id="view-supplier-name"
                        type="text"
                        className="sc-form-input"
                        value={supplier.name ?? ""}
                        readOnly
                    />
                </div>

                <div className="sc-form-group">
                    <label
                        htmlFor="view-supplier-contact"
                        className="sc-form-label"
                    >
                        Contact Person
                    </label>

                    <input
                        id="view-supplier-contact"
                        type="text"
                        className="sc-form-input"
                        value={supplier.contact_person || "—"}
                        readOnly
                    />
                </div>
            </div>

            <div className="sc-form-section">
                <div className="sc-form-section-header">
                    <h3 className="sc-form-section-title">
                        Contact Details
                    </h3>

                    <p className="sc-form-section-description">
                        Supplier contact information.
                    </p>
                </div>

                <div className="sc-form-row">
                    <div className="sc-form-group">
                        <label
                            htmlFor="view-supplier-phone"
                            className="sc-form-label"
                        >
                            Contact Number
                        </label>

                        <input
                            id="view-supplier-phone"
                            type="text"
                            className="sc-form-input"
                            value={supplier.phone || "—"}
                            readOnly
                        />
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="view-supplier-email"
                            className="sc-form-label"
                        >
                            Email Address
                        </label>

                        <input
                            id="view-supplier-email"
                            type="text"
                            className="sc-form-input"
                            value={supplier.email || "—"}
                            readOnly
                        />
                    </div>
                </div>

                <div className="sc-form-group">
                    <label
                        htmlFor="view-supplier-address"
                        className="sc-form-label"
                    >
                        Address
                    </label>

                    <textarea
                        id="view-supplier-address"
                        className="sc-form-textarea"
                        rows={2}
                        value={supplier.address || "—"}
                        readOnly
                    />
                </div>
            </div>

            <div className="sc-form-section">
                <div className="sc-form-section-header">
                    <h3 className="sc-form-section-title">
                        Supplier Overview
                    </h3>

                    <p className="sc-form-section-description">
                        Associated products and supplier availability.
                    </p>
                </div>

                <div className="sc-form-row">
                    <div className="sc-form-group">
                        <label
                            htmlFor="view-supplier-products"
                            className="sc-form-label"
                        >
                            Associated Products
                        </label>

                        <input
                            id="view-supplier-products"
                            type="text"
                            className="sc-form-input"
                            value={String(
                                supplier.products_count ?? 0
                            )}
                            readOnly
                        />
                    </div>

                    <div className="sc-form-group">
                        <label
                            htmlFor="view-supplier-status"
                            className="sc-form-label"
                        >
                            Supplier Status
                        </label>

                        <input
                            id="view-supplier-status"
                            type="text"
                            className="sc-form-input"
                            value={
                                supplier.is_active
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
                        Supplier Availability
                    </p>

                    <p className="sc-form-notice-description">
                        {supplier.is_active
                            ? "This supplier is active and can be selected for new inventory transactions."
                            : "This supplier is inactive. Existing records are preserved, but new transactions should not use this supplier."}
                    </p>
                </div>
            </div>
        </ViewModal>
    );
}
