import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import "../../../css/modals/base-modal.css";

export default function BaseModal({
    isOpen,
    onClose,
    title,
    description,
    ariaLabel,
    children,
    footer,
    size = "medium",
    closeOnOverlay = true,
    closeOnEscape = true,
    showCloseButton = true,
}) {
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);
    const onCloseRef = useRef(onClose);

    const titleId = useId();
    const descriptionId = useId();

    const validSizes = ["small", "medium", "large"];
    const modalSize = validSizes.includes(size) ? size : "medium";

    const hasHeader = Boolean(title || description);

    // Keep the latest close handler without resetting modal focus.
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen || typeof document === "undefined") {
            return;
        }

        previousFocusRef.current = document.activeElement;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const modal = modalRef.current;

        const getFocusableElements = () => {
            if (!modal) return [];

            return Array.from(
                modal.querySelectorAll(
                    'button:not([disabled]), ' +
                        'input:not([disabled]), ' +
                        'select:not([disabled]), ' +
                        'textarea:not([disabled]), ' +
                        'a[href], ' +
                        '[tabindex]:not([tabindex="-1"])'
                )
            ).filter(
                (element) =>
                    element.getClientRects().length > 0 &&
                    element.getAttribute("aria-hidden") !== "true"
            );
        };

        const focusableElements = getFocusableElements();

        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        } else {
            modal?.focus();
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape" && closeOnEscape) {
                event.preventDefault();
                onCloseRef.current?.();
                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const elements = getFocusableElements();

            if (elements.length === 0) {
                event.preventDefault();
                modal?.focus();
                return;
            }

            const firstElement = elements[0];
            const lastElement = elements[elements.length - 1];

            if (
                event.shiftKey &&
                document.activeElement === firstElement
            ) {
                event.preventDefault();
                lastElement.focus();
            } else if (
                !event.shiftKey &&
                document.activeElement === lastElement
            ) {
                event.preventDefault();
                firstElement.focus();
            } else if (
                !modal?.contains(document.activeElement)
            ) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;

            document.removeEventListener(
                "keydown",
                handleKeyDown
            );

            previousFocusRef.current?.focus?.();
        };
    }, [isOpen, closeOnEscape]);

    if (!isOpen || typeof document === "undefined") {
        return null;
    }

    const handleOverlayClick = (event) => {
        if (
            closeOnOverlay &&
            event.target === event.currentTarget
        ) {
            onCloseRef.current?.();
        }
    };

    return createPortal(
        <div
            className="sc-modal-overlay"
            onMouseDown={handleOverlayClick}
        >
            <div
                ref={modalRef}
                className={`sc-modal sc-modal-${modalSize}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
                aria-label={!title ? ariaLabel || "Dialog" : undefined}
                aria-describedby={
                    description ? descriptionId : undefined
                }
                tabIndex={-1}
            >
                {/* Render header only when needed */}
                {hasHeader && (
                    <div className="sc-modal-header">
                        <div className="sc-modal-heading">
                            {title && (
                                <h2 id={titleId}>
                                    {title}
                                </h2>
                            )}

                            {description && (
                                <p id={descriptionId}>
                                    {description}
                                </p>
                            )}
                        </div>

                        {showCloseButton && (
                            <button
                                type="button"
                                className="sc-modal-close"
                                onClick={() => onCloseRef.current?.()}
                                aria-label="Close modal"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                )}

                <div className="sc-modal-body">
                    {children}
                </div>

                {footer && (
                    <div className="sc-modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}