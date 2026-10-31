import React from "react";
import BaseModal from "./BaseModal.jsx";
import "../../../css/modals/form-modal.css";

export default function FormModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    description,
    children,
    mode = "create",
    size = "medium",
    isSubmitting = false,
    submitLabel,
    cancelLabel = "Cancel",
    formId,
}) {
    const isEdit = mode === "edit";

    const buttonLabel =
        submitLabel || (isEdit ? "Save Changes" : "Add");

    const handleSubmit = (event) => {
        event.preventDefault();

        if (isSubmitting) return;

        onSubmit?.(event);
    };

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            size={size}
            closeOnOverlay={!isSubmitting}
            closeOnEscape={!isSubmitting}
            showCloseButton={!isSubmitting}
            footer={
                <>
                    <button
                        type="button"
                        className="sc-modal-button sc-modal-button-secondary"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="submit"
                        form={formId}
                        className="sc-modal-button sc-modal-button-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Saving..."
                            : buttonLabel}
                    </button>
                </>
            }
        >
            <form
                id={formId}
                className="sc-form-modal-form"
                onSubmit={handleSubmit}
                noValidate
            >
                {children}
            </form>
        </BaseModal>
    );
}