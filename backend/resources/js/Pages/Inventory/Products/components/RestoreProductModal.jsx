
import React, { useState } from "react";
import { router } from "@inertiajs/react";

import ConfirmModal from "../../../../components/modals/ConfirmModal.jsx";

export default function RestoreProductModal({
    isOpen,
    onClose,
    product,
}) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handleRestore = () => {
        if (!product || isProcessing) return;

        router.patch(
            `/inventory/products/${product.id}/restore`,
            {},
            {
                preserveScroll: true,
                onStart: () => setIsProcessing(true),
                onSuccess: () => onClose(),
                onFinish: () => setIsProcessing(false),
            }
        );
    };

    return (
        <ConfirmModal
            isOpen={isOpen}
            onClose={onClose}
            onConfirm={handleRestore}
            title="Restore Product"
            variant="default"
            message={
                product
                    ? `Are you sure you want to restore "${product.name}"?`
                    : ""
            }
            // description="The product will return to the current catalog as Inactive."
            confirmLabel="Restore Product"
            cancelLabel="Cancel"
            isProcessing={isProcessing}
        />
    );
}
