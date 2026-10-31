import React from "react";
import BaseModal from "./BaseModal.jsx";
import "../../../css/modals/confirm-modal.css";

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to continue?",
    description,
    variant = "default",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    isProcessing = false,
    children,
}) {
    const isDanger = variant === "danger";

    const handleConfirm = () => {
        if (isProcessing) return;

        onConfirm?.();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            size="small"
            closeOnOverlay={!isProcessing}
            closeOnEscape={!isProcessing}
            showCloseButton={!isProcessing}
            footer={
                <>
                    <button
                        type="button"
                        className="sc-modal-button sc-modal-button-secondary"
                        onClick={onClose}
                        disabled={isProcessing}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        className={`sc-modal-button ${
                            isDanger
                                ? "sc-modal-button-danger"
                                : "sc-modal-button-primary"
                        }`}
                        onClick={handleConfirm}
                        disabled={isProcessing}
                    >
                        {isProcessing
                            ? "Processing..."
                            : confirmLabel}
                    </button>
                </>
            }
        >
            <div className="sc-confirm-modal-content">
                <p className="sc-confirm-modal-message">
                    {message}
                </p>

                {children && (
                    <div className="sc-confirm-modal-details">
                        {children}
                    </div>
                )}
            </div>
        </BaseModal>
    );
}