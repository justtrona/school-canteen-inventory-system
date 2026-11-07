
import React, { useState } from "react";
import { router } from "@inertiajs/react";

import ConfirmModal from "../../../../components/modals/ConfirmModal.jsx";

export default function DeactivateCategoryModal({
    isOpen,
    onClose,
    category,
}) {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    const handleClose = () => {
        if (processing) return;

        setError("");
        onClose();
    };

    const handleDeactivate = () => {
        if (!category || processing) return;

        setError("");
        setProcessing(true);

        router.patch(
            `/inventory/categories/${category.id}/archive`,
            {},
            {
                preserveScroll: true,

                onSuccess: () => {
                    setError("");
                    onClose();
                },

                onError: (errors) => {
                    setError(
                        errors.category ??
                            "Unable to deactivate this category."
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
            isOpen={isOpen}
            onClose={handleClose}
            onConfirm={handleDeactivate}
            title="Deactivate Category"
            description="Manage category availability."
            variant="danger"
            message={
                category
                    ? `Are you sure you want to deactivate "${category.name}"?`
                    : ""
            }
            confirmLabel="Deactivate Category"
            cancelLabel="Cancel"
            isProcessing={processing}
        >
            {category && (
                <p>
                    This category will no longer be available
                    for new product assignments. You can
                    reactivate it anytime.
                </p>
            )}

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
