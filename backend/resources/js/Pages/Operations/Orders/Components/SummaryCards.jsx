
import React from "react";
import {
    ClipboardList,
    Clock3,
    CheckCircle2,
    Ban,
} from "lucide-react";

import SummaryCard from "./SummaryCard.jsx";
import { formatNumber } from "../Utils/formatters.js";

export default function SummaryCards({
    statusCounts = {},
}) {
    const cards = [
        {
            label: "Total Orders",
            value: formatNumber(statusCounts.all),
            icon: ClipboardList,
            iconClass: "orders-summary-icon-total",
        },
        {
            label: "Pending Orders",
            value: formatNumber(statusCounts.pending),
            icon: Clock3,
            iconClass: "orders-summary-icon-pending",
        },
        {
            label: "Completed Orders",
            value: formatNumber(statusCounts.completed),
            icon: CheckCircle2,
            iconClass: "orders-summary-icon-completed",
        },
        {
            label: "Voided Orders",
            value: formatNumber(statusCounts.voided),
            icon: Ban,
            iconClass: "orders-summary-icon-voided",
        },
    ];

    return (
        <div className="orders-summary-grid">
            {cards.map((card) => (
                <SummaryCard
                    key={card.label}
                    {...card}
                />
            ))}
        </div>
    );
}
