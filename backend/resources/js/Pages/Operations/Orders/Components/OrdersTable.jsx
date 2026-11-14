
import React from "react";
import { ClipboardList } from "lucide-react";

import OrderSearch from "./OrderSearch.jsx";
import OrderFilters from "./OrderFilters.jsx";
import OrderPagination from "./OrderPagination.jsx";
import OrderActions from "./OrderActions.jsx";
import ViewOrderModal from "../Modals/ViewOrderModal.jsx";

import useOrderFilters from "../Hooks/useOrderFilters.js";
import useOrderDetails from "../Hooks/useOrderDetails.js";

import {
    formatCurrency,
    formatDateTime,
    formatNumber,
} from "../Utils/formatters.js";

import { ORDER_STATUS_LABELS } from "../Utils/constants.js";

export default function OrdersTable({
    orders = {},
    filters = {},
}) {
    const records = orders?.data ?? [];
    const total = orders?.total ?? 0;

    const {
        search,
        setSearch,
        appliedStatus,
        hasActiveFilters,
        handleSearch,
        handleStatusChange,
        clearSearch,
        clearFilters,
    } = useOrderFilters(filters);

    const {
        order,
        isOpen,
        isLoading,
        error,
        viewOrder,
        closeModal,
    } = useOrderDetails();

    return (
        <>
            <section className="orders-records-section">
                <div className="orders-records-header">
                    <div>
                        <h2>Order Records</h2>
                        <p>
                            Review recorded orders and monitor their statuses.
                        </p>
                    </div>

                    <span className="orders-record-count">
                        {formatNumber(total)} Orders
                    </span>
                </div>

                <div className="orders-records-toolbar">
                    <OrderSearch
                        search={search}
                        setSearch={setSearch}
                        handleSearch={handleSearch}
                        clearSearch={clearSearch}
                    />

                    <OrderFilters
                        appliedStatus={appliedStatus}
                        hasActiveFilters={hasActiveFilters}
                        handleStatusChange={handleStatusChange}
                        clearFilters={clearFilters}
                    />
                </div>

                {records.length === 0 ? (
                    <div className="orders-empty-state">
                        <div className="orders-empty-icon">
                            <ClipboardList
                                size={28}
                                strokeWidth={1.5}
                            />
                        </div>

                        <h3>
                            {hasActiveFilters
                                ? "No matching orders"
                                : "No orders found"}
                        </h3>

                        <p>
                            {hasActiveFilters
                                ? "No orders match your selected filters."
                                : "Orders recorded through the canteen system will appear here."}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="orders-table-wrapper">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Order Number</th>
                                        <th>Date &amp; Time</th>
                                        <th>Created By</th>
                                        <th>Items</th>
                                        <th>Total Amount</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {records.map((record) => (
                                        <tr key={record.id}>
                                            <td className="orders-number">
                                                {record.transaction_number}
                                            </td>

                                            <td>
                                                {formatDateTime(
                                                    record.created_at
                                                )}
                                            </td>

                                            <td>{record.created_by}</td>

                                            <td>
                                                {formatNumber(
                                                    record.items_count
                                                )}
                                            </td>

                                            <td className="orders-amount">
                                                {formatCurrency(
                                                    record.total_amount
                                                )}
                                            </td>

                                            <td>
                                                <span
                                                    className={`orders-status-badge orders-status-${record.status}`}
                                                >
                                                    {ORDER_STATUS_LABELS[
                                                        record.status
                                                    ] ?? record.status}
                                                </span>
                                            </td>

                                            <td className="orders-actions-cell">
                                                <OrderActions
                                                    order={record}
                                                    onView={viewOrder}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <OrderPagination orders={orders} />
                    </>
                )}
            </section>

            <ViewOrderModal
                isOpen={isOpen}
                onClose={closeModal}
                order={order}
                isLoading={isLoading}
                error={error}
            />
        </>
    );
}
