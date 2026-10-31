import React from "react";
import { Head } from "@inertiajs/react";
import InventoryLayout from "../Layouts/InventoryLayout.jsx";
import "../../css/dashboard.css";

export default function Dashboard({
    statistics = {},
    recentMovements = [],
}) {
    const summaryCards = [
        {
            label: "Total Products",
            value: statistics.total_products ?? 0,
            status: "total",
            description: "Registered products",
        },
        {
            label: "In Stock",
            value: statistics.in_stock ?? 0,
            status: "available",
            description: "More than 10 units",
        },
        {
            label: "Low Stock",
            value: statistics.low_stock ?? 0,
            status: "low",
            description: "1–10 units remaining",
        },
        {
            label: "Out of Stock",
            value: statistics.out_of_stock ?? 0,
            status: "out",
            description: "No remaining stock",
        },
    ];

    const formatNumber = (value) => {
        return Number(value ?? 0).toLocaleString("en-PH");
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) return "—";

        return parsed.toLocaleString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const formatMovementType = (type) => {
        return String(type ?? "Unknown")
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase());
    };

    const getMovementClass = (quantity) => {
        if (quantity > 0) return "positive";
        if (quantity < 0) return "negative";
        return "neutral";
    };

    return (
        <InventoryLayout>
            <Head title="Inventory Dashboard" />

            <div className="inventory-dashboard">
                {/* Page heading */}
                <div className="dashboard-page-header">
                    <div>
                        <h1>Inventory Dashboard</h1>
                        <p>
                            Monitor product availability and stock activity.
                        </p>
                    </div>

                    <span className="dashboard-page-label">
                        Inventory Overview
                    </span>
                </div>

                {/* Summary cards */}
                <div className="dashboard-summary-grid">
                    {summaryCards.map((card) => (
                        <div
                            key={card.label}
                            className={`dashboard-summary-card ${card.status}`}
                        >
                            <div className="summary-card-top">
                                <span className="summary-card-label">
                                    {card.label}
                                </span>

                                <span
                                    className={`summary-status-dot ${card.status}`}
                                />
                            </div>

                            <div className="summary-card-bottom">
                                <strong className="summary-card-value">
                                    {formatNumber(card.value)}
                                </strong>

                                <span className="summary-card-description">
                                    {card.description}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stock overview */}
                <div className="dashboard-stock-overview">
                    <div className="stock-overview-info">
                        <span className="stock-overview-label">
                            Total Stock Units
                        </span>

                        <strong>
                            {formatNumber(
                                statistics.total_stock_units
                            )}
                        </strong>

                        <span className="stock-overview-description">
                            Combined quantity across all products
                        </span>
                    </div>

                    <div className="stock-overview-note">
                        <span className="stock-note-indicator" />
                        Inventory data is based on current product records.
                    </div>
                </div>

                {/* Recent movements */}
                <section className="dashboard-table-section">
                    <div className="dashboard-section-header">
                        <div>
                            <h2>Recent Stock Movements</h2>
                            <p>
                                Latest inventory transactions recorded
                                in the system.
                            </p>
                        </div>

                        <span className="dashboard-record-count">
                            {recentMovements.length} recent records
                        </span>
                    </div>

                    <div className="dashboard-table-container">
                        <table className="dashboard-data-table">
                            <thead>
                                <tr>
                                    <th>PRODUCT</th>
                                    <th>TYPE</th>
                                    <th>CHANGE</th>
                                    <th>BALANCE</th>
                                    <th>RECORDED BY</th>
                                    <th>DATE & TIME</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentMovements.length > 0 ? (
                                    recentMovements.map((movement) => (
                                        <tr key={movement.id}>
                                            <td>
                                                <div className="table-product-info">
                                                    <span className="table-product-name">
                                                        {movement.product?.name ??
                                                            "Deleted Product"}
                                                    </span>

                                                    <span className="table-product-sku">
                                                        {movement.product?.sku ??
                                                            "No SKU"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td>
                                                <span className="table-type-badge">
                                                    {formatMovementType(
                                                        movement.type
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                <span
                                                    className={`table-quantity ${getMovementClass(
                                                        movement.quantity_change
                                                    )}`}
                                                >
                                                    {movement.quantity_change > 0
                                                        ? "+"
                                                        : ""}
                                                    {formatNumber(
                                                        movement.quantity_change
                                                    )}
                                                </span>
                                            </td>

                                            <td className="table-balance">
                                                {formatNumber(
                                                    movement.quantity_after
                                                )}
                                            </td>

                                            <td>
                                                {movement.user?.name ??
                                                    "Unknown"}
                                            </td>

                                            <td className="table-date">
                                                {formatDate(
                                                    movement.created_at
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="dashboard-empty-state"
                                        >
                                            <div className="empty-state-content">
                                                <strong>
                                                    No stock movements yet
                                                </strong>
                                                <p>
                                                    Stock transactions will
                                                    appear here once recorded.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </InventoryLayout>
    );
}