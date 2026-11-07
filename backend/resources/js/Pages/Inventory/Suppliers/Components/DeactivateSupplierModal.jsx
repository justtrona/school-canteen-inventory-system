
import React, { useState } from "react";
import { router } from "@inertiajs/react";

import ConfirmModal from "../../../../components/modals/ConfirmModal.jsx";

export default function DeactivateSupplierModal({
    isOpen,
    onClose,
    supplier,
}) {
    if (!isOpen || !supplier) return null;

    return (
        <DeactivateConfirmation
            key={supplier.id}
            supplier={supplier}
            onClose={onClose}
        />
    );
}

function DeactivateConfirmation({ supplier, onClose }) {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    const handleClose = () => {
        if (processing) return;

        setError("");
        onClose();
    };

    const handleDeactivate = () => {
        if (processing) return;

        setError("");
        setProcessing(true);

        router.patch(
            `/inventory/suppliers/${supplier.id}/deactivate`,
            {},
            {
                preserveScroll: true,

                onSuccess: () => {
                    onClose();
                },

                onError: (errors) => {
                    setError(
                        errors.supplier ??
                            "Unable to deactivate this supplier."
                    );
                },

                onFinish: () => {
                    setProcessing(false);
                },
            }
        );
    };

    return (
        <ConfirmModal
            isOpen={true}
            onClose={handleClose}
            onConfirm={handleDeactivate}
            title="Deactivate Supplier"
            description="Manage supplier availability."
            variant="danger"
            message={`Are you sure you want to deactivate "${supplier.name}"?`}
            confirmLabel="Deactivate Supplier"
            cancelLabel="Cancel"
            isProcessing={processing}
        >
            <p>
                This supplier will no longer be available for
                new inventory transactions. Existing supplier
                records and product associations will be preserved.
            </p>

            {error && (
                <p
                    className="sc-form-error"
                    role="alert"
                    style={{ marginTop: "10px" }}
                >
                    {error}
                </p>
            )}
        </ConfirmModal>
    );
}
