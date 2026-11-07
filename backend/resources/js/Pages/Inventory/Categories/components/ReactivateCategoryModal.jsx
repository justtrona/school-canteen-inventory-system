
import React, { useState } from "react";
import { router } from "@inertiajs/react";

import ConfirmModal from "../../../../components/modals/ConfirmModal.jsx";

export default function ReactivateCategoryModal({
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

    const handleReactivate = () => {
        if (!category || processing) return;

        setError("");
        setProcessing(true);

        router.patch(
            `/inventory/categories/${category.id}/restore`,
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
                            "Unable to reactivate this category."
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
            onConfirm={handleReactivate}
            title="Reactivate Category"
            description="Restore category availability."
            variant="default"
            message={
                category
                    ? `Are you sure you want to reactivate "${category.name}"?`
                    : ""
            }
            confirmLabel="Reactivate Category"
            cancelLabel="Cancel"
            isProcessing={processing}
        >
            {category && (
                <p>
                    Once reactivated, this category will be
                    available for product assignments again.
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
