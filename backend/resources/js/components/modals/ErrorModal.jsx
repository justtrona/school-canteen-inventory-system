import React from "react";
import BaseModal from "./BaseModal.jsx";
import "../../../css/modals/error-modal.css";

export default function ErrorModal({
    isOpen,
    onClose,
    onRetry,
    title = "Something Went Wrong",
    message = "An error occurred while processing your request.",
    details,
    showRetry = false,
    isRetrying = false,
    retryLabel = "Try Again",
    closeLabel = "Close",
}) {
    const canRetry =
        showRetry && typeof onRetry === "function";

    const handleRetry = () => {
        if (isRetrying || !canRetry) return;

        onRetry();
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="small"
            closeOnOverlay={!isRetrying}
            closeOnEscape={!isRetrying}
            showCloseButton={!isRetrying}
            footer={
                <>
                    <button
                        type="button"
                        className="sc-modal-button sc-modal-button-secondary"
                        onClick={onClose}
                        disabled={isRetrying}
                    >
                        {closeLabel}
                    </button>

                    {canRetry && (
                        <button
                            type="button"
                            className="sc-modal-button sc-modal-button-primary"
                            onClick={handleRetry}
                            disabled={isRetrying}
                        >
                            {isRetrying
                                ? "Retrying..."
                                : retryLabel}
                        </button>
                    )}
                </>
            }
        >
            <div className="sc-error-modal-content">
                <div
                    className="sc-error-modal-icon"
                    aria-hidden="true"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v6" />
                        <path d="M12 17h.01" />
                    </svg>
                </div>

                <p className="sc-error-modal-message">
                    {message}
                </p>

                {details && (
                    <div className="sc-error-modal-details">
                        {details}
                    </div>
                )}
            </div>
        </BaseModal>
    );
}