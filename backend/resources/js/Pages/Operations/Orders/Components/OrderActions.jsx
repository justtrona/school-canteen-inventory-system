
import React, { useEffect, useRef, useState } from "react";
import { Eye, MoreHorizontal } from "lucide-react";

export default function OrderActions({ order, onView }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (event) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("pointerdown", handleOutsideClick);

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleOutsideClick
            );
        };
    }, [isOpen]);

    return (
        <div className="orders-actions" ref={menuRef}>
            <button
                type="button"
                className="orders-actions-trigger"
                onClick={() => setIsOpen((current) => !current)}
                aria-label={`Actions for ${order.transaction_number}`}
                aria-expanded={isOpen}
                aria-haspopup="menu"
            >
                <MoreHorizontal size={19} strokeWidth={1.8} />
            </button>

            {isOpen && (
                <div className="orders-actions-menu" role="menu">
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                            setIsOpen(false);
                            onView(order.id);
                        }}
                    >
                        <Eye size={16} strokeWidth={1.8} />
                        <span>View Details</span>
                    </button>
                </div>
            )}
        </div>
    );
}
