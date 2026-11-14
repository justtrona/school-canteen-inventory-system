
import React from "react";
import { ReceiptText } from "lucide-react";

import SalesFilters from "./SalesFilters.jsx";
import SalesPagination from "./SalesPagination.jsx";

import {
    formatCurrency,
    formatDateTime,
    formatNumber,
    formatPaymentMethods,
} from "../Utils/formatters.js";

export default function SalesTable({
    sales = {},
    filterControls,
}) {
    const records = sales?.data ?? [];
    const total = sales?.total ?? 0;

    return (
        <section className="sales-records-section">
            <div className="sales-records-header">
                <div>
                    <h2>Sales Records</h2>
                    <p>
                        Monitor completed sales and
                        canteen transaction activity.
                    </p>
                </div>

                <span className="sales-record-count">
                    {formatNumber(total)} Sales
                </span>
            </div>

            <SalesFilters controls={filterControls} />

            {records.length === 0 ? (
                <div className="sales-empty-state">
                    <div className="sales-empty-icon">
                        <ReceiptText
                            size={28}
                            strokeWidth={1.5}
                        />
                    </div>

                    <h3>No sales found</h3>

                    <p>
                        {filterControls.hasActiveFilters
                            ? "No sales match your current filters."
                            : "Completed and paid transactions will appear here once sales are recorded."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="sales-table-wrapper">
                        <table className="sales-table">
                            <thead>
                                <tr>
                                    <th>Transaction Number</th>
                                    <th>Date &amp; Time</th>
                                    <th>Processed By</th>
                                    <th>Items</th>
                                    <th>Payment Method</th>
                                    <th>Total Amount</th>
                                </tr>
                            </thead>

                            <tbody>
                                {records.map((sale) => (
                                    <tr key={sale.id}>
                                        <td className="sales-transaction-number">
                                            {sale.transaction_number}
                                        </td>

                                        <td>
                                            {formatDateTime(
                                                sale.completed_at ??
                                                    sale.created_at
                                            )}
                                        </td>

                                        <td>
                                            {sale.cashier}
                                        </td>

                                        <td>
                                            {formatNumber(
                                                sale.items_count
                                            )}
                                        </td>

                                        <td>
                                            {formatPaymentMethods(
                                                sale.payment_methods
                                            )}
                                        </td>

                                        <td className="sales-amount">
                                            {formatCurrency(
                                                sale.total_amount
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <SalesPagination sales={sales} />
                </>
            )}
        </section>
    );
}
