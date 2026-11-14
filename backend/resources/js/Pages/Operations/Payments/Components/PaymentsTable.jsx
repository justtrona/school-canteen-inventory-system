
import React from "react";
import { CreditCard } from "lucide-react";

import PaymentSearch from "./PaymentSearch.jsx";
import PaymentFilters from "./PaymentFilters.jsx";

import {
    formatCurrency,
    formatDateTime,
    formatNumber,
    formatPaymentMethod,
} from "../Utils/formatters.js";

import {
    PAYMENT_STATUS_LABELS,
} from "../Utils/constants.js";

export default function PaymentsTable({
    payments = {},
    filterControls,
}) {
    const records = payments?.data ?? [];
    const total = payments?.total ?? 0;

    return (
        <section className="payments-records-section">
            <div className="payments-records-header">
                <div>
                    <h2>Payment Records</h2>
                    <p>
                        Review recorded payments and
                        monitor collection activity.
                    </p>
                </div>

                <span className="payments-record-count">
                    {formatNumber(total)} Payments
                </span>
            </div>

            <div className="payments-toolbar">
                <PaymentSearch
                    search={filterControls.search}
                    setSearch={filterControls.setSearch}
                    onSubmit={filterControls.handleSearch}
                />

                <PaymentFilters
                    status={filterControls.status}
                    onStatusChange={filterControls.handleStatusChange}
                    onClear={filterControls.clearFilters}
                    hasActiveFilters={
                        filterControls.hasActiveFilters
                    }
                />
            </div>

            {records.length === 0 ? (
                <div className="payments-empty-state">
                    <div className="payments-empty-icon">
                        <CreditCard
                            size={28}
                            strokeWidth={1.5}
                        />
                    </div>

                    <h3>No payments found</h3>

                    <p>
                        {filterControls.hasActiveFilters
                            ? "No payments match your current filters."
                            : "Payment records will appear here once transactions are recorded."}
                    </p>
                </div>
            ) : (
                <div className="payments-table-wrapper">
                    <table className="payments-table">
                        <thead>
                            <tr>
                                <th>Order Number</th>
                                <th>Date &amp; Time</th>
                                <th>Received By</th>
                                <th>Payment Method</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {records.map((payment) => (
                                <tr key={payment.id}>
                                    <td className="payments-order-number">
                                        {payment.transaction_number}
                                    </td>

                                    <td>
                                        {formatDateTime(
                                            payment.paid_at ??
                                                payment.created_at
                                        )}
                                    </td>

                                    <td>
                                        {payment.received_by}
                                    </td>

                                    <td>
                                        {formatPaymentMethod(
                                            payment.payment_method
                                        )}
                                    </td>

                                    <td className="payments-amount">
                                        {formatCurrency(
                                            payment.amount
                                        )}
                                    </td>

                                    <td>
                                        <span
                                            className={`payments-status-badge payments-status-${payment.status}`}
                                        >
                                            {PAYMENT_STATUS_LABELS[
                                                payment.status
                                            ] ?? payment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
