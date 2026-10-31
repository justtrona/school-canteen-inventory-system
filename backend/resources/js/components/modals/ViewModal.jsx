import React from "react";
import BaseModal from "./BaseModal.jsx";
import "../../../css/modals/view-modal.css";

export default function ViewModal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = "medium",
    onEdit,
    canEdit = false,
    editLabel = "Edit",
    closeLabel = "Close",
}) {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            size={size}
            footer={
                <>
                    <button
                        type="button"
                        className="sc-modal-button sc-modal-button-secondary"
                        onClick={onClose}
                    >
                        {closeLabel}
                    </button>

                    {canEdit && typeof onEdit === "function" && (
                        <button
                            type="button"
                            className="sc-modal-button sc-modal-button-primary"
                            onClick={onEdit}
                        >
                            {editLabel}
                        </button>
                    )}
                </>
            }
        >
            <div className="sc-view-modal-content">
                {children}
            </div>
        </BaseModal>
    );
}