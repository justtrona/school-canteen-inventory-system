import React from "react";
import BaseModal from "./BaseModal.jsx";
import "../../../css/modals/success-modal.css";

export default function SuccessModal({
    isOpen,
    onClose,
    title = "Success!",
    message = "The operation was completed successfully.",
    buttonLabel = "Done",
    children,
}) {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            size="small"
            closeOnOverlay={false}
            showCloseButton={false}
        >
            <div className="sc-success-modal-content">
                <div
                    className="sc-success-modal-icon-wrapper"
                    aria-hidden="true"
                >
                    <div className="sc-success-modal-icon">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M5 12l4 4L19 6" />
                        </svg>
                    </div>
                </div>

                <h2 className="sc-success-modal-title">
                    {title}
                </h2>

                <p className="sc-success-modal-message">
                    {message}
                </p>

                {children && (
                    <div className="sc-success-modal-details">
                        {children}
                    </div>
                )}

                <button
                    type="button"
                    className="sc-success-modal-button"
                    onClick={onClose}
                >
                    {buttonLabel}
                </button>
            </div>
        </BaseModal>
    );
}