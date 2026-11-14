
import React from "react";
import { ReceiptText } from "lucide-react";

import TransactionSearch from "./TransactionSearch.jsx";
import TransactionFilters from "./TransactionFilters.jsx";
import TransactionPagination from "./TransactionPagination.jsx";

import useTransactionFilters from "../Hooks/useTransactionFilters.js";

import {
    formatCurrency,
    formatDateTime,
    formatPaymentMethod,
} from "../Utils/formatters.js";

import { STATUS_LABELS } from "../Utils/constants.js";

export default function TransactionsTable({
    transactions,
    filters = {},
}) {
    const records = transactions?.data ?? [];
    const total = transactions?.total ?? 0;

    const {
        search,
        setSearch,
        appliedStatus,
        hasActiveFilters,
        handleSearch,
        handleStatusChange,
        clearSearch,
        clearFilters,
    } = useTransactionFilters(filters);

    return (
        <section className="pos-transactions-section">
            <div className="pos-transactions-header">
                <div>
                    <h2>Recent POS Transactions</h2>
                    <p>
                        Monitor cashier transactions and payment activity.
                    </p>
                </div>

                <span className="pos-transaction-count">
                    {total} Transactions
                </span>
            </div>

            <div className="pos-transactions-toolbar">
                <TransactionSearch
                    search={search}
                    setSearch={setSearch}
                    handleSearch={handleSearch}
                    clearSearch={clearSearch}
                />

                <TransactionFilters
                    appliedStatus={appliedStatus}
                    hasActiveFilters={hasActiveFilters}
                    handleStatusChange={handleStatusChange}
                    clearFilters={clearFilters}
                />
            </div>

            {records.length === 0 ? (
                <div className="pos-transactions-empty">
                    <div className="pos-empty-icon">
                        <ReceiptText
                            size={28}
                            strokeWidth={1.5}
                        />
                    </div>

                    <h3>
                        {hasActiveFilters
                            ? "No matching transactions"
                            : "No transactions found"}
                    </h3>

                    <p>
                        {hasActiveFilters
                            ? "No transactions match your selected filters."
                            : "Transactions will appear here once orders are recorded in the system."}
                    </p>
                </div>
            ) : (
                <>
                    <div className="pos-table-wrapper">
                        <table className="pos-transactions-table">
                            <thead>
                                <tr>
                                    <th>Transaction No.</th>
                                    <th>Cashier</th>
                                    <th>Date &amp; Time</th>
                                    <th>Total Amount</th>
                                    <th>Payment Method</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {records.map((transaction) => (
                                    <tr key={transaction.id}>
                                        <td className="pos-transaction-number">
                                            {transaction.transaction_number}
                                        </td>

                                        <td>
                                            {transaction.cashier}
                                        </td>

                                        <td>
                                            {formatDateTime(
                                                transaction.created_at
                                            )}
                                        </td>

                                        <td className="pos-transaction-amount">
                                            {formatCurrency(
                                                transaction.total_amount
                                            )}
                                        </td>

                                        <td>
                                            {formatPaymentMethod(
                                                transaction.payment_method
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={`pos-status-badge pos-status-${transaction.status}`}
                                            >
                                                {STATUS_LABELS[
                                                    transaction.status
                                                ] ?? transaction.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <TransactionPagination
                        transactions={transactions}
                    />
                </>
            )}
        </section>
    );
}
