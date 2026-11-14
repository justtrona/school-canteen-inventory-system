import React from "react";

import {
    Wallet,
    CheckCircle2,
    Clock3,
    RotateCcw,
} from "lucide-react";

import SummaryCard from "./SummaryCard.jsx";

import {
    formatCurrency,
    formatNumber,
} from "../Utils/formatters.js";

export default function SummaryCards({ summary = {} }) {
    const cards = [
        {
            label: "Total Collected",
            value: formatCurrency(summary.totalCollected),
            icon: Wallet,
            color: "collected",
        },
        {
            label: "Paid Payments",
            value: formatNumber(summary.paidPayments),
            icon: CheckCircle2,
            color: "paid",
        },
        {
            label: "Pending Payments",
            value: formatNumber(summary.pendingPayments),
            icon: Clock3,
            color: "pending",
        },
        {
            label: "Refunded / Voided",
            value: formatNumber(summary.reversedPayments),
            icon: RotateCcw,
            color: "reversed",
        },
    ];

    return (
        <div className="payments-summary-grid">
            {cards.map((card) => (
                <SummaryCard
                    key={card.label}
                    {...card}
                />
            ))}
        </div>
    );
}
