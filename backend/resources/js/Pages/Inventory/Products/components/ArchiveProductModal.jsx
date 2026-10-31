import React from "react";
import { router } from "@inertiajs/react";

import ConfirmModal from "../../../../components/modals/ConfirmModal.jsx";

export default function ArchiveProductModal({
    isOpen,
    onClose,
    product,
}) {
    const handleArchive = () => {
        if (!product) return;

        router.patch(
            `/inventory/products/${product.id}/archive`,
            {},
            {
                preserveScroll: true,

                onSuccess: () => {
                    onClose();
                },
            }
        );
    };

    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleArchive}
            title="Archive Product"
            variant="danger"
            message={
                product
                    ? `Are you sure you want to archive "${product.name}"? You can restore this product anytime.`
                    : ""
            }
            confirmLabel="Archive Product"
            cancelLabel="Cancel"
        />
    );
}