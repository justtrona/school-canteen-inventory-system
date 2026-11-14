
import React from "react";

import {
    PhilippinePeso,
    ShoppingBag,
    PackageCheck,
    TrendingUp,
} from "lucide-react";

import SummaryCard from "./SummaryCard.jsx";

import {
    formatCurrency,
    formatNumber,
} from "../Utils/formatters.js";

export default function SummaryCards({ summary = {} }) {
    const cards = [
        {
            label: "Total Sales",
            value: formatCurrency(summary.totalSales),
            icon: PhilippinePeso,
            color: "total",
        },
        {
            label: "Completed Sales",
            value: formatNumber(summary.completedSales),
            icon: ShoppingBag,
            color: "completed",
        },
        {
            label: "Items Sold",
            value: formatNumber(summary.itemsSold),
            icon: PackageCheck,
            color: "items",
        },
        {
            label: "Average Sale",
            value: formatCurrency(summary.averageSale),
            icon: TrendingUp,
            color: "average",
        },
    ];

    return (
        <div className="sales-summary-grid">
            {cards.map((card) => (
                <SummaryCard
                    key={card.label}
                    {...card}
                />
            ))}
        </div>
    );
}
