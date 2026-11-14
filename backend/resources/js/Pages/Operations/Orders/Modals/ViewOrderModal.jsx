
import React, { useEffect } from "react";
import {
    X,
    ClipboardList,
    AlertCircle,
    LoaderCircle,
} from "lucide-react";

import {
    formatCurrency,
    formatDateTime,
    formatPaymentMethod,
    formatNumber,
} from "../Utils/formatters.js";

import { ORDER_STATUS_LABELS } from "../Utils/constants.js";

export default function ViewOrderModal({
    isOpen,
    onClose,
    order,
    isLoading,
    error,
}) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener(
                "keydown",
                handleEscape
            );
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const items = order?.items ?? [];
    const payments = order?.payments ?? [];

    return (
        <div
            className="orders-modal-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="orders-details-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="orders-details-title"
            >
                <div className="orders-modal-header">
                    <div>
                        <h2 id="orders-details-title">
                            Order Details
                        </h2>
                        <p>
                            {order?.transaction_number ??
                                "View order information"}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="orders-modal-close"
                        onClick={onClose}
                        aria-label="Close order details"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="orders-modal-body">
                    {isLoading ? (
                        <div className="orders-modal-state" role="status">
                            <LoaderCircle
                                className="orders-loading-icon"
                                size={28}
                            />
                            <p>Loading order details...</p>
                        </div>
                    ) : error ? (
                        <div className="orders-modal-state" role="alert">
                            <AlertCircle size={30} />
                            <p>{error}</p>
                        </div>
                    ) : order ? (
                        <>
                            <div className="orders-details-section">
                                <div className="orders-details-heading">
                                    <ClipboardList size={17} />
                                    <h3>Order Information</h3>
                                </div>

                                <div className="orders-details-grid">
                                    <div className="orders-details-field">
                                        <span>Order Number</span>
                                        <strong>
                                            {order.transaction_number}
                                        </strong>
                                    </div>

                                    <div className="orders-details-field">
                                        <span>Status</span>
                                        <div>
                                            <span
                                                className={`orders-status-badge orders-status-${order.status}`}
                                            >
                                                {ORDER_STATUS_LABELS[
                                                    order.status
                                                ] ?? order.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="orders-details-field">
                                        <span>Date &amp; Time</span>
                                        <strong>
                                            {formatDateTime(order.created_at)}
                                        </strong>
                                    </div>

                                    <div className="orders-details-field">
                                        <span>Created By</span>
                                        <strong>{order.created_by}</strong>
                                    </div>

                                    {order.completed_at && (
                                        <div className="orders-details-field">
                                            <span>Completed At</span>
                                            <strong>
                                                {formatDateTime(
                                                    order.completed_at
                                                )}
                                            </strong>
                                        </div>
                                    )}

                                    {order.voided_at && (
                                        <div className="orders-details-field">
                                            <span>Voided At</span>
                                            <strong>
                                                {formatDateTime(
                                                    order.voided_at
                                                )}
                                            </strong>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="orders-details-section">
                                <div className="orders-details-heading">
                                    <h3>Purchased Items</h3>
                                    <span>{formatNumber(items.length)} Items</span>
                                </div>

                                <div className="orders-details-table-wrapper">
                                    <table className="orders-details-table">
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Qty</th>
                                                <th>Unit Price</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {items.length > 0 ? (
                                                items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>
                                                            {item.product_name}
                                                        </td>
                                                        <td>
                                                            {formatNumber(
                                                                item.quantity
                                                            )}
                                                        </td>
                                                        <td>
                                                            {formatCurrency(
                                                                item.unit_price
                                                            )}
                                                        </td>
                                                        <td>
                                                            {formatCurrency(
                                                                item.subtotal
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4}>
                                                        No items recorded.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="orders-details-totals">
                                    <div>
                                        <span>Subtotal</span>
                                        <strong>
                                            {formatCurrency(order.subtotal)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Discount</span>
                                        <strong>
                                            {formatCurrency(
                                                order.discount_amount
                                            )}
                                        </strong>
                                    </div>

                                    <div className="orders-details-grand-total">
                                        <span>Total Amount</span>
                                        <strong>
                                            {formatCurrency(
                                                order.total_amount
                                            )}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="orders-details-section">
                                <div className="orders-details-heading">
                                    <h3>Payment Information</h3>
                                </div>

                                {payments.length > 0 ? (
                                    payments.map((payment) => (
                                        <div
                                            className="orders-payment-card"
                                            key={payment.id}
                                        >
                                            <div>
                                                <span>Payment Method</span>
                                                <strong>
                                                    {formatPaymentMethod(
                                                        payment.payment_method
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Payment Status</span>
                                                <strong>
                                                    {formatPaymentMethod(
                                                        payment.status
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Amount</span>
                                                <strong>
                                                    {formatCurrency(
                                                        payment.amount
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Amount Received</span>
                                                <strong>
                                                    {formatCurrency(
                                                        payment.amount_received
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Change</span>
                                                <strong>
                                                    {formatCurrency(
                                                        payment.change_amount
                                                    )}
                                                </strong>
                                            </div>

                                            {payment.reference_number && (
                                                <div>
                                                    <span>Reference Number</span>
                                                    <strong>
                                                        {payment.reference_number}
                                                    </strong>
                                                </div>
                                            )}

                                            {payment.paid_at && (
                                                <div>
                                                    <span>Paid At</span>
                                                    <strong>
                                                        {formatDateTime(
                                                            payment.paid_at
                                                        )}
                                                    </strong>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="orders-details-muted">
                                        No payment records available.
                                    </p>
                                )}
                            </div>

                            {(order.notes || order.void_reason) && (
                                <div className="orders-details-section">
                                    <div className="orders-details-heading">
                                        <h3>Additional Information</h3>
                                    </div>

                                    {order.notes && (
                                        <div className="orders-details-note">
                                            <strong>Notes</strong>
                                            <p>{order.notes}</p>
                                        </div>
                                    )}

                                    {order.void_reason && (
                                        <div className="orders-details-note">
                                            <strong>Void Reason</strong>
                                            <p>{order.void_reason}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                <div className="orders-modal-footer">
                    <button
                        type="button"
                        className="orders-modal-done"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
