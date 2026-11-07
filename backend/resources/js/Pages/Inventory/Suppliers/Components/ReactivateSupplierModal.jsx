
import React, { useState } from "react";
import { router } from "@inertiajs/react";

import ConfirmModal from "../../../../components/modals/ConfirmModal.jsx";

export default function ReactivateSupplierModal({
    isOpen,
    onClose,
    supplier,
}) {
    if (!isOpen || !supplier) return null;

    return (
        <ReactivateConfirmation
            key={supplier.id}
            supplier={supplier}
            onClose={onClose}
        />
    );
}

function ReactivateConfirmation({ supplier, onClose }) {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    const handleClose = () => {
        if (processing) return;

        setError("");
        onClose();
    };

    const handleReactivate = () => {
        if (processing) return;

        setError("");
        setProcessing(true);

        router.patch(
            `/inventory/suppliers/${supplier.id}/reactivate`,
            {},
            {
                preserveScroll: true,

                onSuccess: () => {
                    onClose();
                },

                onError: (errors) => {
                    setError(
                        errors.supplier ??
                            "Unable to reactivate this supplier."
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
            onConfirm={handleReactivate}
            title="Reactivate Supplier"
            description="Restore supplier availability."
            variant="default"
            message={`Are you sure you want to reactivate "${supplier.name}"?`}
            confirmLabel="Reactivate Supplier"
            cancelLabel="Cancel"
            isProcessing={processing}
        >
            <p>
                Once reactivated, this supplier will be available
                for new inventory transactions again.
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
